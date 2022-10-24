import { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './color/formatted-color/formatted-color';
import { getColorName } from './color/get-color-name/get-color-name';

export const getGradientStyles = (
  metaColors: FullStyleMetadata[],
  fileNodes: FileNodesResponse,
  config: Config,
) => {
  const colorNodes = metaColors.map(item => fileNodes.nodes[item.node_id]?.document);

  return colorNodes.reduce((acc, item) => {
    const type = (item as any).fills?.[0]?.type;

    if (!type?.includes('GRADIENT')) {
      return acc;
    }

    const key: string =
      config?.styles?.colors?.keyName?.(item?.name as string) ?? getColorName(item?.name);

    if (type === 'GRADIENT_LINEAR') {
      return {
        ...acc,
        [key]: `linear-gradient(${(item as any).fills?.[0]?.gradientStops.map((gradient: any) =>
          formattedColor(gradient?.color, gradient?.color?.a),
        )})`,
      };
    }

    if (type === 'GRADIENT_RADIAL') {
      return {
        ...acc,
        [key]: `radial-gradient(${(item as any).fills?.[0]?.gradientStops.map((gradient: any) =>
          formattedColor(gradient?.color, gradient?.color?.a),
        )})`,
      };
    }

    // TODO: handle other gradient types
    return acc;
  }, {} as Record<string, string>);
};
