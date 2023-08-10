import fetchAndLoad from "./fetchAndLoad.js";

async function addTotalItems(items) {
  for (const item of items) {
    try {
      const $ = fetchAndLoad(item.url);
      let itemInfo = $(".s-desktop-toolbar .sg-col-inner .a-spacing-top-small")
        ?.first()
        ?.children("span")
        ?.text();

      let numberOfProductsString = itemInfo
        ?.match(/\d+,?\d+\sresults/)[0]
        ?.replace(/\s?results/, "");
      item.numberOfProducts = convertToNumber(numberOfProductsString);
    } catch (error) {
      console.log(error.message);
    }
  }
}

export default addTotalItems;
function convertToNumber(numberString) {
  return Number(numberString.replace(",", ""));
}
