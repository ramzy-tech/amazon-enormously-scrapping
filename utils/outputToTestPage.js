import metaData from "../metaData.js";
import * as cheerio from "cheerio";
import fs from "fs/promises";

async function outputToTestPage(url) {
  try {
    const responce = await fetch(url, metaData);
    if (!responce.ok) {
      console.log("err test page");
    }
    const page = await responce.text();
    await fs.writeFile("./testPage.html", page);
  } catch (error) {
    console.log(error.message);
  }
}

export default outputToTestPage;
