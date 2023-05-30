import fs from 'fs';
import path from 'path';

const fileLengthRuleDisableComment = '/* eslint-disable max-lines */';

const namingConventionRuleDisableComment =
  '/* eslint-disable @typescript-eslint/naming-convention */';

const defaultOptions = {
  useEslintDisabledRules: true,
};

// NOTE: temporarily changed writeFile to writeFileSync to make testing easier:
// it is unclear how to test callback version without introducing promises.
// But even with promises, the logic seems to "just write" contents without returning the promise itself,
// which is confusing a bit, because it is impossible to handle promise fulfillment.
export const writeFile = (
  template: string,
  filePath: string,
  options?: {
    useEslintDisabledRules?: boolean;
  },
) => {
  const dir = path.dirname(filePath);
  const useEslintDisabledRules = { ...defaultOptions, ...options }.useEslintDisabledRules;

  // Create directory in advance if there is no one
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = useEslintDisabledRules
    ? `
    ${fileLengthRuleDisableComment}
    ${namingConventionRuleDisableComment}
    ${template}
    `
    : template;

  try {
    fs.writeFileSync(filePath, content);
    console.log(`Generate ${filePath} is completed`);
  } catch {
    console.log(`Formatting ${filePath} file...`);
  }
};
