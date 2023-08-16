import puppeteer from "puppeteer";
import fs from "fs/promises";
import { Worker } from "node:worker_threads";
import getAllCategoriesInfo from "./utils/getAllCategoriesInfo.js";
import writeDataToFile from "./utils/writeDataToFile.js";
import filterItems from "./utils/filterItems.js";
import addTotalItems from "./utils/addTotalItems.js";
import metaData from "./metaData.js";
import getItemDetails from "./utils/getItemDetails.js";
import appendDataToFile from "./utils/appendDataToFile.js";
import { getCategoryData } from "./utils/getCategoryData.js";

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
  // const categoriesData = await fs.readFile(
  //   "./data/products-report.json",
  //   "utf8"
  // );
  // let categories = JSON.parse(categoriesData);

  // categories = categories.filter((category) => category.numberOfProducts);

  const startTime = performance.now();
  let { categoryData, total, drops } = await getCategoryData(
    "https://www.amazon.com/s?i=specialty-aps&bbn=16225009011&rh=n%3A%2116225009011%2Cn%3A281407&ref=nav_em__nav_desktop_sa_intl_accessories_and_supplies_0_2_5_2",
    600
  );
  if (categoryData.length)
    await fs.writeFile("./data/data.json", JSON.stringify(categoryData));

  const endTime = performance.now();

  // console.log("Total items: ", categoryData.length);
  console.log(
    `web scraping took ${Math.round(
      (endTime - startTime) / (1000 * 60)
    )} Minutes to complete.`
  );
  total = Number.isNaN(total) && 0;
  drops = Number.isNaN(drops) && 0;
  console.log("Total items: ", total);
  console.log("Total drops: ", drops);
  const Percentage = Math.round((total / drops) * 100);
  console.log("Percentage: ", Number.isNaN(Percentage) && 0);
})();

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getAllCategoriesData(
  categories,
  totalItemsCount,
  numberOfCores
) {
  categories = setNumberOfTakes(categories, totalItemsCount);
  console.log("Done With Setting Number Of Takes From Each Category..");
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
    data.forEach(async (categoryRes, index) => {
      if (categoryRes.status === "fulfilled") {
        const category = {
          title: categories[categoryIndex + index]["sub-category"],
          data: categoryRes.value,
        };
        await appendDataToFile(category, "./data/data.json");
        await appendDataToFile(",", "./data/data.json");
      }
    });
    await delay(100);
  }
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
