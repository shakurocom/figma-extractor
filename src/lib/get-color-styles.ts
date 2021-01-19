import { Color, FileNodesResponse, FullStyleMetadata } from 'figma-js';

function RGBToHex(color: Color) {
  let r = Math.floor(color.r * 255).toString(16);
  let g = Math.floor(color.g * 255).toString(16);
  let b = Math.floor(color.b * 255).toString(16);

  if (r.length === 1) r = '0' + r;
  if (g.length === 1) g = '0' + g;
  if (b.length === 1) b = '0' + b;

  return r + g + b;
}

const RGB_HEX = /^#?(?:([\da-f]{3})[\da-f]?|([\da-f]{6})(?:[\da-f]{2})?)$/i;

const hex2RGB = (str: string) => {
  const [, short, long] = String(str).match(RGB_HEX) || [];

  if (long) {
    const value = Number.parseInt(long, 16);
    return [value >> 16, (value >> 8) & 0xff, value & 0xff];
  } else if (short) {
    return Array.from(short, s => Number.parseInt(s, 16)).map(n => (n << 4) | n);
  }
};

function formattedColor(color: Color, opacity: number) {
  const hex = RGBToHex(color);

  if (opacity) {
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

export const getColorStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const getColorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  const colors = getColorNodes.reduce(
    (acc, item) => ({
      ...acc,
      [(config as any)?.colors?.keyName?.(item?.name) ?? getColorName(item?.name)]: formattedColor(
        (item as any).fills?.[0]?.color,
        (item as any).fills[0]?.opacity,
      ),
    }),
    {},
  );

  return colors;
};
