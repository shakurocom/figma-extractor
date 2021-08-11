import fs from 'fs';
import path from 'path';

import { generateIconsSprite } from '../../generate-icons-sprite';

export const generateIconSpriteFromLocalFiles = (config: Config): void => {
  const pathIconsFolder = path.join(config?.icons?.exportPath ?? '', 'svg');

  if (!fs.existsSync(pathIconsFolder)) {
    throw Error('Attempt to generate icon sprite from non-existent files');
  }

  const pathSpriteFolder = path.join(config?.icons?.exportPath ?? '');

  generateIconsSprite(pathSpriteFolder);
};
