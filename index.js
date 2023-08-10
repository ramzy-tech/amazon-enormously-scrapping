import puppeteer from "puppeteer";
import fs from "fs/promises";
import getAllCategories from "./utils/getAllCategories.js";
import writeDataToFile from "./utils/writeDataToFile.js";
import filterItems from "./utils/filterItems.js";
import addTotalItems from "./utils/addTotalItems.js";
import metaData from "./metaData.js";
import getCategoryData from "./utils/getCategoryData.js";
import getItemDetails from "./utils/getItemDetails.js";

(async () => {
  // let categories = [];
  // try {
  //   categories = await getAllCategories();
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
  // categories = categories.filter((category) => category.numberOfProducts);

  // console.log(`After filter ${categories.length}`);

  console.log("start");
  const startTime = performance.now();
  const categoryData = await getCategoryData(categories[0], 3);
  const endTime = performance.now();

  await writeDataToFile(categoryData, "./data.json");
  console.log("Total items: ", categoryData.length);
  console.log(
    `web scraping took ${(endTime - startTime) / 1000} seconds to complete.`
  );
})();
