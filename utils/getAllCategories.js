async function getAllCategories(page) {
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

  return categories;
}

export default getAllCategories;
