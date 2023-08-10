import puppeteer from "puppeteer";
import fs from "fs/promises";
import { Worker } from "node:worker_threads";
import getAllCategoriesInfo from "./utils/getAllCategoriesInfo.js";
import writeDataToFile from "./utils/writeDataToFile.js";
import filterItems from "./utils/filterItems.js";
import addTotalItems from "./utils/addTotalItems.js";
import metaData from "./metaData.js";
import getItemDetails from "./utils/getItemDetails.js";

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
  const categoriesData = await fs.readFile(
    "./data/products-report.json",
    "utf8"
  );
  let categories = JSON.parse(categoriesData);
  // console.log(`All items ${categories.length}`);
  // await addTotalItems(categories);

  // console.log(`After filter ${categories.length}`);

  categories = categories.filter((category) => category.numberOfProducts);

  const startTime = performance.now();
  const categoryData = await getAllCategoriesData(categories, 1200, 3);
  const endTime = performance.now();

  writeDataToFile(categoryData, "./data/data.json");

  // console.log("Total items: ", categoryData.length);
  console.log(
    `web scraping took ${Math.round(
      (endTime - startTime) / 1000
    )} Seconds to complete.`
  );
})();

async function getAllCategoriesData(
  categories,
  totalItemsCount,
  numberOfCores
) {
  const categoriesData = [];
  categories = setNumberOfTakes(categories, totalItemsCount);
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
    data.forEach((categoryRes, index) => {
      if (categoryRes.status === "fulfilled") {
        categoriesData.push({
          title: categories[categoryIndex + index]["main-category"],
          data: categoryRes.value,
        });
      }
    });
    // writeDataToFile(categoriesData, "./sample.json");
  }

  return categoriesData;
}

function setNumberOfTakes(categories, totalCount) {
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
    Math.floor(shortageCount / categoriesWithSpare.length) ?? 0;

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
}

function createWorker(categoryPage) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./utils/getCategoryData.js", {
      workerData: categoryPage,
    });
    worker.on("message", (categoryData) => resolve(categoryData));
    worker.on("error", (err) =>
      reject(err.message || "Something went wrong...")
    );
  });
}
