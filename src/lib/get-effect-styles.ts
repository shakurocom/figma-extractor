import { Color, FileNodesResponse, FullStyleMetadata } from 'figma-js';

function rgba(background: Color) {
  return `rgba(${Math.floor(background.r * 255)}, ${Math.floor(background.g * 255)}, ${Math.floor(
    background.b * 255,
  )}, ${background.a.toFixed(2)})`;
}

function getEffectName(name?: string) {
  // format name from like "shadows / shadow 2" to "shadow2"

  const splitLeftPart = name?.split(' / ');
  const splitName = splitLeftPart?.[splitLeftPart?.length - 1]?.replace(' ', '');

  return splitName || '';
}

export const getEffectStyles = (
  metaTextStyles: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const effectStylesNodes = metaTextStyles.map(item => fileNodes.nodes[item.node_id]?.document);

  const effectStyles = effectStylesNodes.reduce(
    (acc, { name, effects }: any) => ({
      ...acc,
      [(config as any)?.effects?.keyName?.(name) || getEffectName(name)]: `${
        effects[0].offset.x
      }px ${effects[0].offset.y}px ${effects[0].radius}px ${rgba(effects[0].color)}`,
    }),
    {},
  );

  return effectStyles;
};
