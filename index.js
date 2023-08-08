import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import getAllCategories from "./utils/getAllCategories.js";
import writeDataToFile from "./utils/writeDataToFile.js";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
  );

  let categories = [];
  try {
    categories = await getAllCategories(page);
  } catch (error) {
    console.log(error.message);
  }

  await writeDataToFile(categories);
  // Start Finding Category Pages`

  // const htmlContent = await page.content();
  // const $ = await cheerio.load(htmlContent);

  // $(".hmenu-item[href^='.*']").each((i, elem) => {
  //   const item = $(elem).text();
  //   console.log(item);
  // });

  console.log("Done...");
  await browser.close();
})();
