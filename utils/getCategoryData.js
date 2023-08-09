import metaData from "../metaData.js";
import * as cheerio from "cheerio";
import outputToTestPage from "./outputToTestPage.js";
import getItemDetails from "./getItemDetails.js";

async function getCategoryData(categories) {
  const { url: categoryURL } = categories[0];
  const itemsURLs = [];
  const categoryData = [];
  try {
    const responce = await fetch(categoryURL, metaData);
    const categoryPage = await responce.text();

    const $ = cheerio.load(categoryPage);
    const items = $("div[data-index]");
    items.each((i, item) =>
      itemsURLs.push($(item).find("a").first().attr("href"))
    );

    for (const itemUrl of itemsURLs) {
      if (!itemUrl) return;

      const itemData = await getItemDetails(itemUrl);
      categoryData.push(itemData);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export default getCategoryData;
