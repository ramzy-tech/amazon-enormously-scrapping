import outputToTestPage from "./outputToTestPage.js";
import { writeFile } from "node:fs/promises";
import getItemDetails from "./getItemDetails.js";
import { parentPort, workerData } from "node:worker_threads";
import fetchAndLoad from "./fetchAndLoad.js";

export async function getCategoryData(pageUrl, numberOfItems) {
  const categoryData = [];
  let total = 0,
    drops = 0;

  console.log("Working On Category ", pageUrl);
  do {
    const [nextPage, totalItems, totalDrops] = await getPageItemsData(
      pageUrl,
      categoryData,
      numberOfItems,
      3
    );
    total += totalItems;
    drops += totalDrops;
    if (!nextPage) break;
    pageUrl = nextPage;
  } while (categoryData.length < numberOfItems);

  console.log("Done with a category");
  return { categoryData, total, drops };
}

async function getPageItemsData(
  pageUrl,
  categoryData,
  numberOfItems,
  numberOfTrys
) {
  let itemsURLs = [];
  let nextPage = null;
  let totalItems = 0;
  let totalDrops = 0;
  try {
    console.log("Working On Page ", pageUrl);
    const $ = await fetchAndLoad(pageUrl);
    if (!$ && numberOfTrys > 1) {
      await getPageItemsData(
        pageUrl,
        categoryData,
        numberOfItems,
        --numberOfTrys
      );
      return [];
    }

    if (!$) return [];

    const items = $("div[data-index]");
    items.each((i, item) =>
      itemsURLs.push($(item).find(".a-link-normal").first().attr("href"))
    );
    itemsURLs = itemsURLs.filter((itemUrl) => itemUrl);
    itemsURLs = itemsURLs.map((itemUrl) => `https://www.amazon.com/${itemUrl}`);

    console.log("Items URLs Count, ", itemsURLs.length);

    for (const itemUrl of itemsURLs) {
      if (categoryData.length === numberOfItems) break;

      const itemData = await getItemDetails(itemUrl, 1);
      totalItems++;

      itemData ? categoryData.push(itemData) : totalDrops++;
    }

    nextPage = $(".s-pagination-next")?.first().attr("href");
    if (!nextPage) return [null, totalItems, totalDrops];

    return [`https://www.amazon.com/${nextPage}`, totalItems, totalDrops];
  } catch (error) {
    console.log("Page Error");
    console.log(error.message || "Error");
    debugger;
  }
}
