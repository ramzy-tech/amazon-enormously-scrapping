import * as cheerio from "cheerio";
import axios from "axios";
import metaData from "../metaData.js";

async function addTotalItems(items) {
  for (const item of items) {
    try {
      const responce = await fetch(item.url, metaData);
      const page = await responce.text();
      const $ = cheerio.load(page);
      let itemInfo = $(".s-desktop-toolbar .sg-col-inner .a-spacing-top-small")
        ?.first()
        ?.children("span")
        ?.text();

      item.numberOfProducts = itemInfo
        ?.match(/\d+,?\d+\sresults/)[0]
        ?.replace(/\s?results/, "");
    } catch (error) {
      console.log(error.message);
    }
  }
}

export default addTotalItems;
