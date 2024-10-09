import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

// NOTE: temporarily changed writeFile to writeFileSync to make testing easier:
// it is unclear how to test callback version without introducing promises.
// But even with promises, the logic seems to "just write" contents without returning the promise itself,
// which is confusing a bit, because it is impossible to handle promise fulfillment.
export const writeFile = (content: string, filePath: string) => {
  const dir = path.dirname(filePath);

  // Create directory in advance if there is no one
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    fs.writeFileSync(filePath, content);
    shell.exec(`npx eslint ${path.join(filePath)} --fix`);
    console.log(`Generate ${filePath} is completed`);
  } catch {
    console.log(`Formatting ${filePath} file...`);
  }
};
