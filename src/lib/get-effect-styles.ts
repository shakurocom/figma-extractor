import { Color, FileNodesResponse, FullStyleMetadata } from 'figma-js';

function rgba(background: Color) {
  return `rgba(${Math.floor(background.r * 255)}, ${Math.floor(background.g * 255)}, ${Math.floor(
    background.b * 255,
  )}, ${background.a.toFixed(2)})`;
}

export const getEffectStyles = (
  metaTextStyles: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  keyNameCallback: (name?: string) => string,
) => {
  const effectStylesNodes = metaTextStyles.map(item => fileNodes.nodes[item.node_id]?.document);

  const effectStyles = effectStylesNodes.reduce(
    (acc, { name, effects }: any) => ({
      ...acc,
      [keyNameCallback(name)]: `${effects[0].offset.x}px ${effects[0].offset.y}px ${
        effects[0].radius
      }px ${rgba(effects[0].color)}`,
    }),
    {} as Record<string, string>,
  );

  return effectStyles;
};
