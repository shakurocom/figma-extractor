import fs from 'fs';

import { getClient } from './lib/client';
import { getColorStyles } from './lib/get-color-styles';
import { getEffectStyles } from './lib/get-effect-styles';
import { getGradientStyles } from './lib/get-gradient-styles';
import { getTextStyles } from './lib/get-text-styles';
import { writeStyleFile } from './lib/write-style-file';

export const generateStyles = async (config: Config) => {
  const client = getClient(config.apiKey);

  const { meta } = await client.fileStyles(config.fileId).then(({ data }) => data);
  const nodeKeys = meta.styles.map(item => item.node_id);

  const { data: fileNodes } = await client.fileNodes(config.fileId, { ids: nodeKeys });

  if (!fs.existsSync(config?.styles?.exportPath)) {
    fs.mkdirSync(config?.styles?.exportPath, { recursive: true });
  }

  const metaColors = meta.styles.filter(item => item.style_type === 'FILL');

  if (!config?.styles?.colors?.disabled) {
    const colors = await getColorStyles(metaColors, fileNodes, config);
    const colorTemplate = `module.exports = ${JSON.stringify(colors)} ;`;
    writeStyleFile(colorTemplate, 'colors.js', config);
  }

  if (!config?.styles?.gradients?.disabled) {
    const colors = await getGradientStyles(metaColors, fileNodes, config);
    const colorTemplate = `module.exports = ${JSON.stringify(colors)} ;`;
    writeStyleFile(colorTemplate, 'gradients.js', config);
  }

  if (!config?.styles?.effects?.disabled) {
    const metaEffects = meta.styles.filter(item => item.style_type === 'EFFECT');
    const effects = await getEffectStyles(metaEffects, fileNodes, config);
    const effectTemplate = `module.exports = {boxShadow: ${JSON.stringify(effects)}} ;`;
    writeStyleFile(effectTemplate, 'effects.js', config);
  }

  if (!config?.styles?.textStyles?.disabled) {
    const metaTextStyles = meta.styles.filter(item => item.style_type === 'TEXT');
    const { fontFamily, textStyles } = await getTextStyles(metaTextStyles, fileNodes, config);
    const fontFamilyTemplate = JSON.stringify(fontFamily);
    const textStylesTemplate = `{${textStyles.join()}};`;
    writeStyleFile(
      `
      const fontFamily = ${fontFamilyTemplate};
      const textVariants = ${textStylesTemplate};
      module.exports = {fontFamily, textVariants}`,
      'text-styles.js',
      config,
    );
  }

  return false;
};
