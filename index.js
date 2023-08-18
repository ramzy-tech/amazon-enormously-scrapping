import puppeteer from "puppeteer";
import { readFile, appendFile, writeFile } from "fs/promises";
import { Worker } from "node:worker_threads";
import getAllCategoriesInfo from "./utils/getAllCategoriesInfo.js";
import writeDataToFile from "./utils/writeDataToFile.js";
import filterItems from "./utils/filterItems.js";
import addTotalItems from "./utils/addTotalItems.js";
import metaData from "./metaData.js";
import getItemDetails from "./utils/getItemDetails.js";
import appendDataToFile from "./utils/appendDataToFile.js";

(async () => {
  // let categories = [];
  // try {
  //   categories = await getAllCategoriesInfo();
  // } catch (error) {
  //   console.log(error.message);
  // }

  // categories = filterItems(categories, {
  //   mainCategory: [
  //     "stream music",
  //     "kindle e-readers",
  //     "amazon appstore",
  //     "give a gift card",
  //     "amazon live",
  //     "international shopping",
  //   ],
  //   subCategory: [],
  // });
  const categoriesData = await readFile("./data/products-report.json", "utf8");
  let categories = JSON.parse(categoriesData);

  categories = categories.filter((category) => category.numberOfProducts);

  const startTime = performance.now();
  await writeFile("./data/data.json", "[");
  const numberOfItems = await getAllCategoriesData(categories, 5000, 3);
  await appendFile("./data/data.json", "]");
  const endTime = performance.now();

  // console.log("Total items: ", categoryData.length);
  console.log(
    `web scraping took ${Math.round(
      (endTime - startTime) / 1000
    )} Seconds to complete.`
  );
  console.log("Total Data Fetched: ", numberOfItems);
})();

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getAllCategoriesData(
  categories,
  totalItemsCount,
  numberOfCores
) {
  categories = setNumberOfTakes(categories, totalItemsCount);
  await writeFile(
    "./data/products-takes-report.json",
    JSON.stringify(categories)
  );
  console.log("Done With Setting Number Of Takes From Each Category..");
  let numboerOfItems = 0;

  for (
    let categoryIndex = 0;
    categoryIndex < categories.length;
    categoryIndex += numberOfCores
  ) {
    const workers = [];
    for (let workerIndex = 0; workerIndex < numberOfCores; workerIndex++) {
      workers[workerIndex] = createWorker(
        categories[categoryIndex + workerIndex]
      );
    }

    const data = await Promise.allSettled(workers);
    console.log("All Threads Has Finished An Iteration...");

    for (const [index, categoryRes] of data.entries()) {
      if (categoryRes.status === "fulfilled") {
        const category = {
          title: categories[categoryIndex + index]["sub-category"],
          data: categoryRes.value,
        };
        await appendFile("./data/data.json", JSON.stringify(category));
        await appendFile("./data/data.json", ",");
        numboerOfItems += category.data.length;
      }
    }

    console.log("Number of items so far: ", numboerOfItems);
  }
  return numboerOfItems;
}

function setNumberOfTakes(categories, totalCount) {
  try {
    const countPerCategory = Math.floor(totalCount / categories.length);

    let categoriesWithSpare = categories.filter(
      (category) => category.numberOfProducts > countPerCategory
    );

    const categoriesWithShortage =
      categories.filter((category) => {
        if (category.numberOfProducts < countPerCategory) {
          category.numberOfTakes = category.numberOfProducts;
          return true;
        }
      }) ?? [];

    let shortageCount =
      categoriesWithShortage.length > 0 &&
      categoriesWithShortage.reduce(
        (shortageTotal, category) =>
          (shortageTotal += countPerCategory - category.numberOfProducts),
        0
      );
    let addedCountToSpare =
      Math.ceil(shortageCount / categoriesWithSpare.length) ?? 0;

    do {
      categoriesWithSpare = categoriesWithSpare.map((category, i) => {
        let numberNeeded = countPerCategory + addedCountToSpare;
        if (category.numberOfProducts > numberNeeded) {
          category.numberOfTakes = numberNeeded;
          shortageCount -= addedCountToSpare;
          category.numberOfTakes = numberNeeded;
        } else {
          let availableToSpare = category.numberOfProducts - countPerCategory;
          shortageCount -= availableToSpare;
          category.numberOfTakes = countPerCategory + availableToSpare;
        }
        return category;
      });
    } while (shortageCount > 0);

    return [...categoriesWithSpare, ...categoriesWithShortage];
  } catch (error) {
    console.log(error.message);
  }
}

function createWorker(categoryPage) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./utils/getCategoryData.js", {
      workerData: categoryPage,
    });
    worker.on("message", (categoryData) => {
      worker.terminate();
      resolve(categoryData);
    });
    worker.on("error", (err) => {
      worker.terminate();
      reject(err.message || "Something went wrong...");
    });
  });
}
