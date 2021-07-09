import { Color, FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { RGB_HEX_REGEX } from './color/constants';
import { RGBToHex } from './color/rgb-to-hex/rgb-to-hex';

const hex2RGB = (str: string) => {
  const [, short, long] = String(str).match(RGB_HEX_REGEX) || [];

  if (long) {
    const value = Number.parseInt(long, 16);
    return [value >> 16, (value >> 8) & 0xff, value & 0xff];
  } else if (short) {
    return Array.from(short, s => Number.parseInt(s, 16)).map(n => (n << 4) | n);
  }
};

function formattedColor(color: Color, opacity?: number) {
  const hex = RGBToHex(color);

  if (opacity || opacity === 0) {
    const rgb = hex2RGB(hex);

    return `rgba(${rgb?.join(', ')}, ${opacity.toFixed(2)})`;
  }
  return `#${hex}`;
}

function getColorName(name?: string) {
  // format name from like "primary / blue900" to "blue900"

  const splitName = name?.split(' / ');

  return splitName ? splitName[splitName.length - 1].toLowerCase() : '';
}

export const getGradientStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const getColorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  const gradients = getColorNodes.reduce(
    (acc, item) =>
      (item as any).fills?.[0]?.type === 'GRADIENT_LINEAR'
        ? {
            ...acc,
            [config?.styles?.colors?.keyName?.(item?.name as string) ??
            getColorName(
              item?.name,
            )]: `linear-gradient(${(item as any).fills?.[0]?.gradientStops.map((gradient: any) =>
              formattedColor(gradient?.color, gradient?.color?.a),
            )})`,
          }
        : acc,
    {} as Record<string, string>,
  );

  return gradients;
};
