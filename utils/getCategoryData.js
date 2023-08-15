import outputToTestPage from "./outputToTestPage.js";
import getItemDetails from "./getItemDetails.js";
import { parentPort, workerData } from "node:worker_threads";
import fetchAndLoad from "./fetchAndLoad.js";

(async function getCategoryData() {
  const categoryData = [];
  let { url: pageUrl, numberOfTakes: numberOfItems } = workerData;

  console.log("Working On Category ", pageUrl);
  do {
    const nextPage = await getPageItemsData(
      pageUrl,
      categoryData,
      numberOfItems,
      3
    );
    pageUrl = nextPage;
  } while (categoryData.length < numberOfItems);

  console.log("Done with a category");
  parentPort.postMessage(categoryData);
  // return categoryData;
})();

async function getPageItemsData(
  pageUrl,
  categoryData,
  numberOfItems,
  numberOfTrys
) {
  let itemsURLs = [];
  let nextPage = null;
  console.log("Working On Page ", pageUrl);

  try {
    const $ = await fetchAndLoad(pageUrl);
    const items = $("div[data-index]");

    items.each((i, item) =>
      itemsURLs.push($(item).find(".a-link-normal").first().attr("href"))
    );

    if (itemsURLs.length === 0 && numberOfTrys > 0) {
      getPageItemsData(pageUrl, categoryData, numberOfItems, --numberOfTrys);
      return;
    }

    itemsURLs = itemsURLs.filter((itemUrl) => itemUrl);
    itemsURLs = itemsURLs.map((itemUrl) => `https://www.amazon.com/${itemUrl}`);

    console.log("items URLs, ", itemsURLs.length);

    for (const itemUrl of itemsURLs) {
      if (categoryData.length === numberOfItems) break;

      const itemData = await getItemDetails(itemUrl, 3);
      if (itemData) categoryData.push(itemData);
    }
    nextPage = $(".s-pagination-next")?.first().attr("href");
    if (!nextPage) {
      // await outputToTestPage($.html(), "./test.html");
      // debugger;
      throw new Error(`Error on category ${pageUrl}`);
    }
    return `https://www.amazon.com/${nextPage}`;
  } catch (error) {
    console.log(error.message || "Error");
    throw error;
  }
}
