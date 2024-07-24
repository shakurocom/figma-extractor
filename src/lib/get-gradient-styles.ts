import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './formatted-color';

export const getGradientStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  keyNameCallback: (name?: string) => string,
) => {
  const colorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  return colorNodes.reduce(
    (acc, item) => {
      const type = (item as any).fills?.[0]?.type;

      if (!type?.includes('GRADIENT')) {
        return acc;
      }

      const key: string = keyNameCallback(item?.name);

      if (type === 'GRADIENT_LINEAR') {
        return {
          ...acc,
          [key]: `linear-gradient(${(item as any).fills?.[0]?.gradientStops.map((gradient: any) =>
            formattedColor(gradient?.color),
          )})`,
        };
      }

      if (type === 'GRADIENT_RADIAL') {
        return {
          ...acc,
          [key]: `radial-gradient(${(item as any).fills?.[0]?.gradientStops.map((gradient: any) =>
            formattedColor(gradient?.color),
          )})`,
        };
      }

      // TODO: handle other gradient types
      return acc;
    },
    {} as Record<string, string>,
  );
};
