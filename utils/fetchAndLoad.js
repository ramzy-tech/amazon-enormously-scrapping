import * as cheerio from "cheerio";
import request from "request-promise";

let numberOfErrorRepeat = 0;

export default async function fetchAndLoad(url) {
  let $ = await load(url);
  while (!$) {
    $ = await load(url);
  }
  numberOfErrorRepeat = 0;
  return $;
}
async function load(url) {
  const options = {
    method: "GET",
    url,
    gzip: true,
    proxy: "http://detogfjc-rotate:o25us94mye0r@p.webshare.io:80",
    transform: function (body) {
      return cheerio.load(body);
    },
    headers: {},
  };
  try {
    await delay(getRndInteger(0, 500));
    const $ = await request(options);
    const html = $.html();

    if (/automated access to amazon/i.test(html)) {
      console.log("Robot Page Found...");
      debugger;
      numberOfErrorRepeat++;
      if (numberOfErrorRepeat > 10) {
        await delay(getRndInteger(1000 * 60 * 3, 1000 * 60 * 8));
        numberOfErrorRepeat = 0;
      }
      return;
    } else {
      return $;
    }
  } catch (error) {
    console.log(error.message);
    debugger;
    numberOfErrorRepeat++;
    if (numberOfErrorRepeat > 10) {
      await delay(getRndInteger(1000 * 60 * 3, 1000 * 60 * 8));
      numberOfErrorRepeat = 0;
    }
    return;
  }
}

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
export function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
