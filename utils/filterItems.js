function filterItems(items, filterObject) {
  if (filterObject.mainCategory?.length) {
    items = items.filter(
      (item) => !filterObject.mainCategory.includes(item["main-category"])
    );
  }
  if (filterObject.subCategory?.length) {
    items = items.filter(
      (item) => !filterObject.subCategory.includes(item["sub-category"])
    );
  }
  return items;
}

export default filterItems;
