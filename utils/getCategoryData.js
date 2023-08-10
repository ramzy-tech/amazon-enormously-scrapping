import outputToTestPage from "./outputToTestPage.js";
import getItemDetails from "./getItemDetails.js";
import { parentPort, workerData } from "node:worker_threads";
import fetchAndLoad from "./fetchAndLoad.js";

(async function getCategoryData() {
  const categoryData = [];
  let { url: pageUrl, numberOfTakes: numberOfItems } = workerData;

  do {
    const nextPage = await getPageItemsData(
      pageUrl,
      categoryData,
      numberOfItems
    );
    pageUrl = nextPage;
  } while (categoryData.length < numberOfItems);

  console.log("Done with a category");
  parentPort.postMessage(categoryData);
  // return categoryData;
})();

async function getPageItemsData(pageUrl, categoryData, numberOfItems) {
  console.log(pageUrl);
  let itemsURLs = [];
  let nextPage = null;

  try {
    const $ = await fetchAndLoad(pageUrl);
    const items = $("div[data-index]");
    items.each((i, item) =>
      itemsURLs.push($(item).find(".a-link-normal").first().attr("href"))
    );
    itemsURLs = itemsURLs.filter((itemUrl) => itemUrl);
    itemsURLs = itemsURLs.map((itemUrl) => `https://www.amazon.com/${itemUrl}`);

    for (const itemUrl of itemsURLs) {
      if (categoryData.length === numberOfItems) break;

      const itemData = await getItemDetails(itemUrl);
      categoryData.push(itemData);
    }
    nextPage = $(".s-pagination-next")?.first().attr("href");
    return `https://www.amazon.com/${nextPage}`;
  } catch (error) {
    console.log(error.message);
  }
}
