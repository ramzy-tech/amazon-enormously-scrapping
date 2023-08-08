import fs from "fs/promises";

async function writeDataToFile(data, filePath) {
  const jsonData = JSON.stringify(data);
  await fs.writeFile("./data/products-report.json", jsonData);
}

export default writeDataToFile;