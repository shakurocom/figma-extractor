import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './color/formatted-color/formatted-color';

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
