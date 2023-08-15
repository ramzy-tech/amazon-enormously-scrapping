import fetchAndLoad from "./fetchAndLoad.js";
import outputToTestPage from "./outputToTestPage.js";

export default async function getItemDetails(url, numberOfTrys) {
  const itemData = {};
  try {
    const $ = await fetchAndLoad(url, numberOfTrys);
    // const html = $.html();
    itemData.title = $("span#productTitle")?.text().trim();
    if (!itemData.title && numberOfTrys > 0) {
      getItemDetails(url, --numberOfTrys);
      return;
    }
    itemData.price = getItemPrice($);
    itemData.priceBeforeDiscount = $(".basisPrice .a-offscreen")
      ?.first()
      .text();
    itemData.images = getItemImages($);
    itemData.sizes = getItemSizes($);
    itemData.rateCount = $("#acrCustomerReviewText")?.first().text();
    itemData.brand = getItemBrand($);
    itemData.colors = getItemColors($);
    itemData.features = getItemFeatures($);
    itemData.rating = $("#averageCustomerReviews i span")
      ?.first()
      .text()
      .trim();

    return itemData;
  } catch (error) {
    console.log(error.message);
  }
}
const getItemBrand = ($) => {
  if ($(".po-brand .po-break-word").length) {
    return $(".po-brand .po-break-word")?.text();
  } else {
    return $("#bylineInfo")?.text().replace("Brand: ", "");
  }
};

const getItemPrice = ($) => {
  const priceWhole = $(".a-price-whole")?.first().text();
  const priceFraction = $(".a-price-fraction")?.first().text();
  if (priceWhole) return "$" + priceWhole + priceFraction;
  const priceRange = $(".a-price-range .a-price .a-offscreen");
  return priceRange?.first().text() + "-" + priceRange?.last().text();
};
const getItemImages = ($) => {
  const imgs = [];
  $("#altImages img")?.each((i, img) => imgs.push($(img).attr("src")));

  return imgs;
};

const getItemSizes = ($) => {
  const sizes = [];
  let sizesOptions = null;
  if ($('[name="dropdown_selected_size_name"] option').length) {
    sizesOptions = $('[name="dropdown_selected_size_name"] option');
  } else {
    sizesOptions = $("#variation_size_name li p");
  }
  sizesOptions?.each((i, size) => sizes.push($(size).text().trim()));

  return sizes;
};
const getItemColors = ($) => {
  const colors = [];
  const itemImgColors = $("#variation_color_name li img");
  itemImgColors?.each((i, imgColor) => {
    return colors.push($(imgColor).attr("alt"));
  });

  return colors;
};
const getItemFeatures = ($) => {
  const features = [];
  const itemFeatures = $("#feature-bullets .a-list-item");
  itemFeatures?.each((i, itemFeature) => {
    return features.push($(itemFeature).text().trim());
  });

  return features;
};
