import axios from 'axios';
import { ClientInterface } from 'figma-js';
import fs from 'fs';
import path from 'path';

import { Config } from '../../types';
import { generateIconTypes } from '../generate-icon-types';
import { generateIconsSprite } from '../generate-icons-sprite';
import { optimizeSvg } from '../optimize-svg';

const naming = (originalName: string) => {
  const formattedName = originalName.replace(/ /g, '').replace('/', '-');

  return formattedName;
};

export const generateIcons = async (client: ClientInterface, config: Config) => {
  if (!config?.icons?.exportPath) {
    throw new Error('config -> icons -> exportPath is required field');
  }
  const pathIconsFolder = path.join(config?.icons?.exportPath ?? '', 'svg');
  const pathSpriteFolder = path.join(config?.icons?.exportPath ?? '');

  if (!fs.existsSync(pathIconsFolder)) {
    fs.mkdirSync(pathIconsFolder, { recursive: true });
  }

  const download = async function (uri: string, filename: string) {
    const promise = new Promise(async (resolve, reject) => {
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
        resolve(filename);
      });
      writer.on('error', reject);
    });

    return promise.then(res => {
      return optimizeSvg(filename).then(() => {
        console.log('Downloaded!', filename);

        return res;
      });
    });
  };

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
