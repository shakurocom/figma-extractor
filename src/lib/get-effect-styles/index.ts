import { Config, Mode, RGBA, ShadowLayersMode, Variable } from '@/types';

import { formattedColor } from '../formatted-color';
import { getEffectName } from '../get-effect-name';

type ShadowProperty = 'x' | 'y' | 'blur' | 'spread' | 'color';

const SHADOW_PROPERTIES: ShadowProperty[] = ['x', 'y', 'blur', 'spread', 'color'];

export type ShadowLayer = {
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: RGBA;
};

export type GroupedEffectProperty =
  | { type: 'backdrop-blur' | 'blur'; blur?: number }
  | {
      type: 'shadow';
      /**
       * `true` when layers come from numbered variables
       * ("shadow/m-600/1/x" or "shadow/dp75/x_1"), `false` for a plain single shadow ("shadow/dp100/x")
       */
      layered: boolean;
      layers: Map<number, ShadowLayer>;
    };

type EffectType = GroupedEffectProperty['type'];

export type EffectStyle = {
  [x: string]: GroupedEffectProperty;
};

type ParsedShadowName = {
  groupPath: string[];
  property: ShadowProperty;
  layerIndex?: number;
};

/**
 * Parses a shadow variable name. Supported conventions:
 *  "shadow/dp100/x"           -> single shadow "shadow/dp100"
 *  "shadow/marketing/m-600/1/x" -> layer 1 of "shadow/marketing/m-600"
 *  "shadow/chart/dp75/x_1"    -> layer 1 of "shadow/chart/dp75"
 *
 * A numeric segment is treated as a layer index only when a named segment precedes it,
 * so "shadow/600/x" stays a single shadow named "600".
 */
function parseShadowName(name: string): ParsedShadowName | undefined {
  const path = name.split('/');
  const rawProperty = path.at(-1) || '';
  const [, property, suffixIndex] = rawProperty.match(/^([a-z]+)(?:_(\d+))?$/) || [];

  if (!SHADOW_PROPERTIES.includes(property as ShadowProperty)) return undefined;

  const groupPath = path.slice(0, -1);
  if (suffixIndex !== undefined) {
    return { groupPath, property: property as ShadowProperty, layerIndex: Number(suffixIndex) };
  }

  const lastSegment = groupPath.at(-1) || '';
  if (groupPath.length >= 3 && /^\d+$/.test(lastSegment)) {
    return {
      groupPath: groupPath.slice(0, -1),
      property: property as ShadowProperty,
      layerIndex: Number(lastSegment),
    };
  }

  return { groupPath, property: property as ShadowProperty };
}

function groupEffectProperties(properties: Variable[], log?: (...args: any[]) => void) {
  const grouped: EffectStyle = {};

  properties.forEach(prop => {
    const effectType = prop.name.split('/').at(0) as EffectType;

    switch (effectType) {
      case 'backdrop-blur':
      case 'blur': {
        const groupName = prop.name.split('/').join('-');
        grouped[groupName] = { type: effectType, blur: prop.value as number };
        break;
      }
      case 'shadow': {
        const parsed = parseShadowName(prop.name);
        if (!parsed) {
          log?.(
            '[warn:effects-theme] >>> ',
            `Unknown shadow property in "${prop.name}", expected one of: ${SHADOW_PROPERTIES.join(
              ', ',
            )}`,
          );
          break;
        }

        const groupName = parsed.groupPath.join('-');
        const layered = parsed.layerIndex !== undefined;
        const existing = grouped[groupName];
        if (existing && existing.type !== 'shadow') break;

        const group =
          existing ||
          (grouped[groupName] = {
            type: 'shadow',
            layered,
            layers: new Map<number, ShadowLayer>(),
          });

        if (group.layered !== layered) {
          throw new Error(
            `Shadow "${groupName}" mixes numbered layers and plain properties ("${prop.name}"). Use one convention per shadow.`,
          );
        }

        const layerIndex = parsed.layerIndex ?? 0;
        const layer = group.layers.get(layerIndex) || {};
        (layer as Record<ShadowProperty, unknown>)[parsed.property] = prop.value;
        group.layers.set(layerIndex, layer);
        break;
      }
    }
  });

  return grouped;
}

function formatShadowLayer(layer: ShadowLayer, name: string) {
  if (!layer.color) {
    throw new Error(`Shadow "${name}" has no color variable`);
  }

  return `${layer.x ?? 0}px ${layer.y ?? 0}px ${layer.blur ?? 0}px ${
    layer.spread ?? 0
  }px ${formattedColor(layer.color)}`;
}

export const getEffectStyles = (modes: Mode[], config: Config, log?: (...args: any[]) => void) => {
  const shadowLayers: ShadowLayersMode = config?.styles?.effects?.shadowLayers || 'both';
  const keyName = config?.styles?.effects?.keyName || getEffectName;

  const effectStyles = modes.reduce<{ [x: string]: string }>((acc, item) => {
    const groupedEffectsProperties = groupEffectProperties(item.variables, log);
    const formattedVariables: { [x: string]: string } = {};

    const addVariable = (key: string, value: string) => {
      const name = keyName(`${item.name}/${key}`);
      if (formattedVariables[name] !== undefined) {
        throw new Error(
          `Effect name "${name}" is generated twice in "${item.name}" mode, check shadow layer names`,
        );
      }
      formattedVariables[name] = value;
    };

    Object.entries(groupedEffectsProperties).forEach(([key, value]) => {
      if (value.type === 'shadow') {
        const layers = [...value.layers.entries()].sort(([a], [b]) => a - b);

        if (!value.layered) {
          addVariable(key, formatShadowLayer(layers[0][1], key));

          return;
        }

        if (shadowLayers === 'merge' || shadowLayers === 'both') {
          addVariable(
            key,
            layers.map(([index, layer]) => formatShadowLayer(layer, `${key}-${index}`)).join(', '),
          );
        }
        if (shadowLayers === 'split' || shadowLayers === 'both') {
          layers.forEach(([index, layer]) =>
            addVariable(`${key}-${index}`, formatShadowLayer(layer, `${key}-${index}`)),
          );
        }

        return;
      }

      // for some reason, Figma also divides the value by 2.
      // In figma variables 20px, in css style backdrop-filter: blur(calc(var(--backdrop-blur-200-blur, 20px) / 2));
      // Make sure that the value is divided by two in css.
      addVariable(key, `${(value.blur || 0) / 2}px`);
    });

    return { ...acc, ...formattedVariables };
  }, {});

  return effectStyles;
};
