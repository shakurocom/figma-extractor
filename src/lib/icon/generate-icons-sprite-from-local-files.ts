import fs from 'fs';
import path from 'path';

import { Core } from '../../core';
import { generateIconTypes } from '../../lib/generate-icon-types';
import { generateIconsSprite } from '../../lib/generate-icons-sprite';
import { IconConfig } from '../../types';

const getIconNameByFilename = (filename: string): string => filename.split('.')[0];

export const generateIconSpriteFromLocalFiles = (config: IconConfig, log: Core['log']): void => {
  const pathIconsFolder = path.join(config.exportPath ?? '', 'svg');

  if (!fs.existsSync(pathIconsFolder)) {
    throw Error('Attempt to generate icon sprite from non-existent files');
  }

  const pathSpriteFolder = path.join(config.exportPath ?? '');

  if (config.generateTypes) {
    const dirEntries = fs.readdirSync(pathIconsFolder, { withFileTypes: true });

    const iconNames = dirEntries
      .filter(dirEntry => dirEntry.isFile())
      .map(file => file.name)
      .map(getIconNameByFilename);

    log(
      `Start the generation of types for icons. path: '${pathSpriteFolder}' icons names: ${JSON.stringify(
        iconNames,
      )}`,
    );

    generateIconTypes(iconNames, pathSpriteFolder);
  }

  generateIconsSprite(pathSpriteFolder);
};
