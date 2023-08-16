import metaData from "../metaData.js";
import * as cheerio from "cheerio";
import writeDataToFile from "./writeDataToFile.js";
import outputToTestPage from "./outputToTestPage.js";
import { delay, getRndInteger } from "../index.js";

async function fetchAndLoad(url) {
  try {
    await delay(getRndInteger(100, 500));
    const responce = await fetch(url, metaData);
    const page = await responce.text();
    if (/automated access to amazon/i.test(page)) {
      console.log("Robot Page Found...");
      debugger;
      return;
    }
    const $ = cheerio.load(page);
    return $;
  } catch (error) {
    console.log(error.message);
  }
}

export default fetchAndLoad;
