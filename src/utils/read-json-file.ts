import fs from 'fs';

export function readJsonFile<T = any>(filePath: string): T {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
    throw error; // rethrow the error for further handling if needed
  }
}
