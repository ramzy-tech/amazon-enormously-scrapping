import * as cheerio from "cheerio";
import request from "request-promise";

async function fetchAndLoad(url) {
  try {
    const responce = await fetch(url, metaData);
    const page = await responce.text();
    // outputToTestPage(url, "./test.html");
    const $ = cheerio.load(page);
    return $;
  } catch (error) {
    console.log(error.message);
  }
}

export default fetchAndLoad;
