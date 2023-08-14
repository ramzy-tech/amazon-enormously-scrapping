import metaData from "../metaData.js";
import * as cheerio from "cheerio";
import fs from "fs/promises";

async function outputToTestPage(page, path) {
  try {
    await fs.writeFile(path, page);
  } catch (error) {
    console.log(error.message);
  }
}

export default outputToTestPage;
