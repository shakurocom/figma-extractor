import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './color/formatted-color/formatted-color';

export const getColorStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  keyNameCallback: (name?: string) => string,
) => {
  const colorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  return colorNodes.reduce(
    (acc, item) =>
      (item as any).fills?.[0]?.type?.includes('GRADIENT')
        ? acc
        : {
            ...acc,
            [keyNameCallback(item?.name)]: formattedColor(
              (item as any).fills?.[0]?.color,
              (item as any).fills[0]?.opacity,
            ),
          },
    {} as Record<string, string>,
  );
};
