import { FileNodesResponse, FullStyleMetadata, StyleType } from 'figma-js';
import fs from 'fs';

import { getColorStyles } from '../../lib/get-color-styles';
import { getEffectStyles } from '../../lib/get-effect-styles';
import { getGradientStyles } from '../../lib/get-gradient-styles';
import { getTextStyles } from '../../lib/get-text-styles';
import { mergeTextStyle } from '../../lib/merge-text-styles';
import { stringifyRecordsWithSort } from '../../lib/stringify';
import { writeStyleFile } from '../../lib/write-style-file';

// eslint-disable-next-line @typescript-eslint/naming-convention
type StyleTypePredicate = (item: { style_type: StyleType }) => boolean;

const getStyleTypePredicate = (styleType: StyleType): StyleTypePredicate => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return ({ style_type }) => style_type === styleType;
};

const isStyleTypeFill = getStyleTypePredicate('FILL');
const isStyleTypeEffect = getStyleTypePredicate('EFFECT');
const isStyleTypeText = getStyleTypePredicate('TEXT');

export const generateStyles = (
  config: Config,
  styleMetadata: readonly FullStyleMetadata[],
  fileNodes: FileNodesResponse,
) => {
  if (!fs.existsSync(config?.styles?.exportPath)) {
    fs.mkdirSync(config?.styles?.exportPath, { recursive: true });
  }

  const metaColors = styleMetadata.filter(isStyleTypeFill);

  if (!config?.styles?.colors?.disabled) {
    const colors = getColorStyles(metaColors, fileNodes, config);
    const colorTemplate = `module.exports = ${stringifyRecordsWithSort(colors)};`;
    writeStyleFile(colorTemplate, 'colors.js', config);
  }

  if (!config?.styles?.gradients?.disabled) {
    const gradients = getGradientStyles(metaColors, fileNodes, config);
    const gradientsTemplate = `module.exports = ${stringifyRecordsWithSort(gradients)};`;
    writeStyleFile(gradientsTemplate, 'gradients.js', config);
  }

  if (!config?.styles?.effects?.disabled) {
    const metaEffects = styleMetadata.filter(isStyleTypeEffect);
    const effects = getEffectStyles(metaEffects, fileNodes, config);
    const effectTemplate = `module.exports = {boxShadow: ${stringifyRecordsWithSort(effects)}};`;
    writeStyleFile(effectTemplate, 'effects.js', config);
  }

  if (!config?.styles?.textStyles?.disabled) {
    const metaTextStyles = styleMetadata.filter(isStyleTypeText);
    const { fontFamily, textStyles } = getTextStyles(metaTextStyles, fileNodes, config, {
      textStylesBeforeSorting: textStyles => {
        if (!!config?.styles?.textStyles?.merge) {
          if (config?.screens) {
            return mergeTextStyle({ textStyles, screens: config?.screens });
          } else {
            console.warn(
              "Attention! You have merging of text styles is enabled and don't have any screens. Add some screens for correctly working it.",
            );
          }
        }

        return textStyles;
      },
    });
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
