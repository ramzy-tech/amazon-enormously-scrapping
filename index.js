import puppeteer from "puppeteer";
import fs from "fs/promises";
import getAllCategories from "./utils/getAllCategories.js";
import writeDataToFile from "./utils/writeDataToFile.js";
import filterItems from "./utils/filterItems.js";
import addTotalItems from "./utils/addTotalItems.js";
import metaData from "./metaData.js";
import getCategoryData from "./utils/getCategoryData.js";

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

  const itemsData = await fs.readFile("./data/products-report.json", "utf8");
  let categories = JSON.parse(itemsData);
  console.log(`All items ${categories.length}`);
  // await addTotalItems(categories);
  categories = categories.filter((category) => category.numberOfProducts);

  console.log(`After filter ${categories.length}`);
  // await getCategoryData(categories);

  // await writeDataToFile(categories);
  console.log("Done...");
})();
