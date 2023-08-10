import { writeFileSync } from "fs";
import fs from "fs/promises";

async function writeDataToFile(data, filePath) {
  const jsonData = JSON.stringify(data);
  // writeFileSync(filePath, jsonData);
  await fs.writeFile(filePath, jsonData);
}

export default writeDataToFile;
