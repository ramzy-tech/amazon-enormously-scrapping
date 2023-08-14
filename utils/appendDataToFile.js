import { appendFile } from "fs/promises";

async function appendDataToFile(data, filePath) {
  const jsonData = JSON.stringify(data);
  appendFile(filePath, jsonData);
}

export default appendDataToFile;
