import shell from 'shelljs';

// NOTE: temporarily changed writeFile to writeFileSync to make testing easier:
// it is unclear how to test callback version without introducing promises.
// But even with promises, the logic seems to "just write" contents without returning the promise itself,
// which is confusing a bit, because it is impossible to handle promise fulfillment.
export const runFormattingFile = (filePath: string) => {
  // NOTE: this code should still be invoked according to the original implementation.
  shell.exec(`yarn eslint ${filePath} --fix`);

  console.log(`${filePath} is processed by formatting tool`);
};
