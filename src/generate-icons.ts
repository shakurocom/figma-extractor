import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { getClient } from './lib/client';
import { generateIconTypes } from './lib/generate-icon-types';
import { generateIconsSprite } from './lib/generate-icons-sprite';
import { optimizeSvg } from './lib/optimize-svg';

const naming = (originalName: string) => {
  const formattedName = originalName.replace(/ /g, '').replace('/', '-');

  return formattedName;
};

export const generateIcons = async (config: Config) => {
  const client = getClient(config.apiKey);
  const pathIconsFolder = path.join(config?.icons?.exportPath ?? '', 'svg');
  const pathSpriteFolder = path.join(config?.icons?.exportPath ?? '');

  if (!fs.existsSync(pathIconsFolder)) {
    fs.mkdirSync(pathIconsFolder, { recursive: true });
  }

  const download = async (uri: string, filename: string) =>
    new Promise(async (resolve, reject) => {
      const writer = fs.createWriteStream(filename);
      const response = await axios({
        url: uri,
        method: 'GET',
        responseType: 'stream',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'X-Figma-Token': config.apiKey,
        },
      });

      await response.data.pipe(writer);
      await writer.on('finish', async () => {
        await optimizeSvg(filename);
        console.log('Downloaded!', filename);
        resolve(filename);
      });
      writer.on('error', reject);
    });

  const { data } = await client.fileNodes(config.fileId, { ids: config?.icons?.nodeIds });
  const iconNames: string[] = [];
  const nodes = Object.entries(data.nodes);
  const promises = nodes.map(async ([, value]) => {
    const imagesData: { id: string; name: string }[] = (value as any)?.document?.children?.map(
      (item: any) => {
        const formattedName = config?.icons?.iconName?.(item.name) || naming(item.name);
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

    const result = await imagesData.map(async item => {
      return await download(`${images[item.id]}`, `${pathIconsFolder}/${item.name}.svg`);
    });

    await Promise.all(result);

    return new Promise(res => res(result));
  });

  await Promise.all(promises);

  if (config?.icons?.generateTypes) {
    generateIconTypes(iconNames, pathSpriteFolder);
  }
  if (config?.icons?.generateSprite) {
    generateIconsSprite(pathSpriteFolder);
  }

  return false;
};
