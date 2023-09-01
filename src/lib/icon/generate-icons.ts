import { ClientInterface } from 'figma-js';
import fs from 'fs';
import path from 'path';
import { type Config as ConfigSVG } from 'svgo';

import { Config, IconConfig } from '../../types';
import { downloadStreamingToFile } from '../download-streaming-to-file';
import { generateIconTypes } from '../generate-icon-types';
import { generateIconsSprite } from '../generate-icons-sprite';
import { defaultSVGConfig, optimizeSvg } from '../optimize-svg';

const isSvgCallback = (obj: any): obj is (config?: ConfigSVG) => ConfigSVG =>
  typeof obj === 'function';

const naming = (originalName: string) => {
  const formattedName = originalName.replace(/ /g, '').replace('/', '-');

  return formattedName;
};

export const generateIcons = async (
  client: ClientInterface,
  iconConfig: IconConfig,
  config: Config,
) => {
  if (!iconConfig.exportPath) {
    throw new Error('config -> icons -> exportPath is required field');
  }
  const pathIconsFolder = path.join(iconConfig.exportPath ?? '', 'svg');
  const pathSpriteFolder = path.join(iconConfig.exportPath ?? '');

  if (!fs.existsSync(pathIconsFolder)) {
    fs.mkdirSync(pathIconsFolder, { recursive: true });
  }

  let enableOptimizeSvg = true;
  let svgConfig: ConfigSVG = { ...defaultSVGConfig };
  if (iconConfig.optimizeSvg === false) {
    enableOptimizeSvg = false;
  } else if (isSvgCallback(iconConfig.optimizeSvg)) {
    svgConfig = iconConfig.optimizeSvg({ ...defaultSVGConfig });
  }

  const { data } = await client.fileNodes(config.fileId, { ids: iconConfig.nodeIds });
  const iconNames: string[] = [];
  const nodes = Object.values(data.nodes);
  for (const value of nodes) {
    const imagesData: { id: string; name: string }[] = (value as any)?.document?.children?.map(
      (item: any) => {
        const formattedName = iconConfig.iconName?.(item.name) || naming(item.name);
        iconNames.push(formattedName);

        return {
          id: item.id,
          name: formattedName,
        };
      },
    );

    const imageIds = imagesData.map((item: any) => item.id);
    const {
      data: { images },
    } = await client.fileImages(config.fileId, { ids: imageIds, format: 'svg' });

    for (const item of imagesData) {
      const filename = `${pathIconsFolder}/${item.name}.svg`;
      await downloadStreamingToFile(`${images[item.id]}`, filename, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'X-Figma-Token': config.apiKey,
      });

      if (enableOptimizeSvg) {
        await optimizeSvg(filename, svgConfig);
      }

      console.log('Downloaded!', filename);
    }
  }

  if (iconConfig.generateTypes) {
    generateIconTypes(iconNames, pathSpriteFolder);
  }
  if (iconConfig.generateSprite) {
    generateIconsSprite(pathSpriteFolder);
  }

  return false;
};
