import puppeteer from "puppeteer";

async function getAllCategories() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
  );
  // Navigate the page to a URL
  await page.goto("https://www.amazon.com/");
  await page.waitForSelector(`#nav-hamburger-menu`);
  await page.click(`#nav-hamburger-menu`);
  await page.waitForSelector(".hmenu-translateX-right");

  let categories = await page.evaluate(() => {
    let items = Array.from(
      document.querySelectorAll(
        ".hmenu-translateX-right .hmenu-item[href*='?']"
      )
    );
    items = items.map((item) => {
      const mainCategory = item
        .closest("ul")
        .querySelector(".hmenu-title").textContent;
      return {
        "main-category": mainCategory,
        "sub-category": item.textContent,
        url: item.getAttribute("href"),
      };
    });
    return items;
  });

  // Update Url for specific items

  categories = categories.map((category) =>
    /http/.test(category.url)
      ? category
      : { ...category, url: `https://www.amazon.com${category.url}` }
  );

  await browser.close();

  return categories;
}

export default getAllCategories;
