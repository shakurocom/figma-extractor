import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './color/formatted-color/formatted-color';
import { getColorName } from './color/get-color-name/get-color-name';

export const getColorStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const colorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  return colorNodes.reduce(
    (acc, item) =>
      (item as any).fills?.[0]?.type?.includes('GRADIENT')
        ? acc
        : {
            ...acc,
            [config?.styles?.colors?.keyName?.(item?.name as string) ??
            getColorName(item?.name)]: formattedColor(
              (item as any).fills?.[0]?.color,
              (item as any).fills[0]?.opacity,
            ),
          },
    {} as Record<string, string>,
  );
};
