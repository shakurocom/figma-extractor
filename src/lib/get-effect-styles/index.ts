import { Color } from 'figma-js';

import { Config, Mode, Variable } from '@/types';

import { formattedColor } from '../formatted-color';
import { getEffectName } from '../get-effect-name';

export type GroupedEffectProperty = {
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: Color;
  colorFrom?: string;
  colorTo?: string;
  type: EffectType;
};

type EffectType = 'backdrop-blur' | 'shadow' | 'blur';

export type EffectStyle = {
  [x: string]: GroupedEffectProperty;
};

const getComplexValue = <T>({
  value,
  postfix = '',
  fallback = '',
}: {
  value: T;
  postfix?: string;
  fallback?: string;
}) => (value !== undefined ? value + postfix : fallback);

function groupEffectProperties(properties: Variable[]) {
  const grouped: { [key: string]: GroupedEffectProperty } = {};

  properties.forEach(prop => {
    const rawGroupName = prop.name.split('/');
    const styleName = rawGroupName.at(-1) as keyof Omit<GroupedEffectProperty, 'type'>;

    const effectTypesWithNestedFields: EffectType[] = ['shadow'];
    const effectType = rawGroupName.at(0) as EffectType;
    const groupName = rawGroupName
      .slice(0, effectTypesWithNestedFields.includes(effectType) ? -1 : rawGroupName.length)
      .join('-');

    if (!grouped[groupName]) {
      grouped[groupName] = {} as GroupedEffectProperty;
    }

    switch (effectType) {
      case 'backdrop-blur':
        grouped[groupName].type = 'backdrop-blur';
        grouped[groupName].blur = prop.value as number;
        break;
      case 'blur':
        grouped[groupName].type = 'blur';
        grouped[groupName].blur = prop.value as number;
        break;
      case 'shadow':
        grouped[groupName].type = 'shadow';
        grouped[groupName][styleName] = prop.value as any;
        break;
    }
  });

  return grouped;
}

export const getEffectStyles = (modes: Mode[], config: Config) => {
  const effectStyles = modes.reduce<{ [x: string]: string }>((acc, item) => {
    const groupedEffectsProperties = groupEffectProperties(item.variables);

    const formattedVariables = Object.entries(groupedEffectsProperties).reduce(
      (acc, [key, value]) => {
        const keyName = config?.styles?.effects?.keyName || getEffectName;

        if (value.type === 'shadow') {
          return {
            ...acc,
            [keyName?.(`${item.name}/${key}`)]: `${value.x}px ${value.y}px ${getComplexValue({
              value: value.blur,
              postfix: 'px',
            })} ${value.spread}px ${formattedColor(value.color)}`,
          };
        }
        if (value.type === 'backdrop-blur' || value.type === 'blur') {
          // for some reason, Figma also divides the value by 2.
          // In figma variables 20px, in css style backdrop-filter: blur(calc(var(--backdrop-blur-200-blur, 20px) / 2));
          // Make sure that the value is divided by two in css.
          return {
            ...acc,
            [keyName?.(`${item.name}/${key}`)]: `${(value.blur || 0) / 2}px`,
          };
        }

        return acc;
      },
      {},
    );

    if (!formattedVariables) return acc;

    return { ...acc, ...formattedVariables };
  }, {});

  return effectStyles;
};
