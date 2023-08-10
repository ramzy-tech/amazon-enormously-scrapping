import outputToTestPage from "./outputToTestPage.js";
import getItemDetails from "./getItemDetails.js";
import fetchAndLoad from "./fetchAndLoad.js";

export default async function getCategoryData(category, numberOfItems) {
  const categoryData = [];
  let { url: pageUrl } = category;

  do {
    const nextPage = await getPageItemsData(
      pageUrl,
      categoryData,
      numberOfItems
    );
    pageUrl = nextPage;
  } while (categoryData.length < numberOfItems);

  return categoryData;
}

const getPageItemsData = async (pageUrl, categoryData, numberOfItems) => {
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
};
