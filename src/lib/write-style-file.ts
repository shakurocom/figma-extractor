import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

import { Config } from '@/types';

const fileLengthRuleDisableComment = '/* eslint-disable max-lines */';

const namingConventionRuleDisableComment =
  '/* eslint-disable @typescript-eslint/naming-convention */';

// NOTE: temporarily changed writeFile to writeFileSync to make testing easier:
// it is unclear how to test callback version without introducing promises.
// But even with promises, the logic seems to "just write" contents without returning the promise itself,
// which is confusing a bit, because it is impossible to handle promise fulfillment.
export const writeStyleFile = (template: string, fileName: string, config: Config) => {
  try {
    fs.writeFileSync(
      path.join(config?.styles?.exportPath || '', fileName),
      `
      ${fileLengthRuleDisableComment}
      ${namingConventionRuleDisableComment}
      ${template}
      `,
    );
  } catch {
    console.log(`Formatting ${fileName} file...`);
  }

  // NOTE: this code should still be invoked according to the original implementation.
  shell.exec(
    `yarn eslint ${path.join(path.join(config?.styles?.exportPath || '', fileName))} --fix`,
  );

  console.log(`Generate ${fileName} is completed`);
};
