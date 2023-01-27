import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { getFontFamily } from './text/get-font-family/get-font-family';
import { getTextStyleName } from './text/get-text-style-name/get-text-style-name';
import { sortTextStyles } from './text/sort-text-styles/sort-text-styles';

export type TextStyle = {
  [x: string]: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    textTransform: string;
    lineHeight: string;
  };
};

export const getTextStyles = (
  metaTextStyles: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
  options?: {
    textStylesBeforeSorting?: (textStyles: TextStyle[]) => TextStyle[];
  },
) => {
  const textStylesNodes = metaTextStyles.map(item => fileNodes.nodes[item.node_id]?.document);
  const { fontFamily, formattedFontFamilyWithAdditionalFonts } = getFontFamily(textStylesNodes);

  let textStyles = textStylesNodes.map(({ name, style }: any) => {
    const fontVar = Object.entries(fontFamily).find(([, value]) => value === style.fontFamily);

    const extraStyles: any = {};
    if ('letterSpacing' in style && style.letterSpacing > 0) {
      extraStyles.letterSpacing = style.letterSpacing;
    }

    return {
      [`${config?.styles?.textStyles?.keyName?.(name) || getTextStyleName(name)}`]: {
        fontFamily: `fontFamily.${fontVar?.[0]}`,
        fontSize: `${style.fontSize}`,
        fontWeight: `${style.fontWeight}`,
        textTransform: `${style.textCase && style.textCase === 'UPPER' ? 'uppercase' : 'initial'}`,
        lineHeight: `${(style.lineHeightPx / style.fontSize).toFixed(2)}`,
        ...extraStyles,
      },
    };
  });

  if (options?.textStylesBeforeSorting) {
    textStyles = options?.textStylesBeforeSorting(textStyles);
  }

  const sortedTextStyles = sortTextStyles(textStyles);

  return { fontFamily: formattedFontFamilyWithAdditionalFonts, textStyles: sortedTextStyles };
};
