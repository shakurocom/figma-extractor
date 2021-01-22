import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

const uniqueElementsBy = (arr: any[], fn: (a: any, b: any) => void) =>
  arr.reduce((acc, v) => {
    if (!acc.some((x: any) => fn(v, x))) acc.push(v);
    return acc;
  }, []);

function getTextStyleName(name?: string) {
  // format name from like "Heading / bs-h200 - 80 b" to "bs-h200"

  const splitLeftPart = name?.split(' / ');
  const splitRightPart = splitLeftPart?.[splitLeftPart?.length - 1]
    .split(' ')[0]
    ?.replace('.', '-');

  return splitRightPart || '';
}

const getFontFamily = (textStyles: any) => {
  const uniqFamily: any[] = uniqueElementsBy(
    textStyles,
    (a, b) => a.style.fontFamily == b.style.fontFamily,
  );
  const formattedFontFamilyWithAdditionalFonts = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: `'${item.style.fontFamily}', Arial, sans-serif`,
    }),
    {},
  );

  const formattedFontFamily = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: item.style.fontFamily,
    }),
    {},
  );
  return { formattedFontFamilyWithAdditionalFonts, fontFamily: formattedFontFamily };
};

export const getTextStyles = (
  metaTextStyles: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const textStylesNodes = metaTextStyles.map(item => fileNodes.nodes[item.node_id]?.document);
  const { fontFamily, formattedFontFamilyWithAdditionalFonts } = getFontFamily(textStylesNodes);
  const textStyles = textStylesNodes.reduce<string[]>((acc, { name, style }: any) => {
    const fontVar = Object.entries(fontFamily).find(([, value]) => value === style.fontFamily);

    return [
      ...acc,
      `'${config?.styles?.textStyles?.keyName?.(name) || getTextStyleName(name)}': {
    fontFamily: fontFamily.${fontVar?.[0]},
    fontSize: ${style.fontSize},
    fontWeight: ${style.fontWeight},
    textTransform: ${style.textCase && style.textCase === 'UPPER' ? 'uppercase' : 'initial'},
    lineHeight: ${(style.lineHeightPx / style.fontSize).toFixed(2)},
  }`,
    ];
  }, []);

  return { fontFamily: formattedFontFamilyWithAdditionalFonts, textStyles };
};
