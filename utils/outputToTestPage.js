import metaData from "../metaData.js";
import * as cheerio from "cheerio";
import fs from "fs/promises";

async function outputToTestPage(url, path) {
  try {
    const responce = await fetch(url, metaData);
    if (!responce.ok) {
      console.log("err test page");
    }
    const page = await responce.text();
    await fs.writeFile(path, page);
  } catch (error) {
    console.log(error.message);
  }
}

export default outputToTestPage;
