import { Config, Mode, ThemeVariablesConfig } from '@/types';

import { mergeResponsive } from '../merge-responsive';
import { groupProperties, transformProperties } from './group-properties';

export const getResponsive = (variables: ThemeVariablesConfig[], config: Config) => {
  const filteredCollections = variables.filter(({ name }) =>
    config?.styles?.responsive?.collectionNames?.includes(name),
  );

  const modes = filteredCollections.reduce<Mode[]>((acc, item) => [...acc, ...item.modes], []);

  const groupedProperties = groupProperties(modes);
  const {
    'screens-media-max': screensMax,
    'screens-media-min': screens,
    ...transformed
  } = transformProperties(groupedProperties) || {};

  const data = Object.entries(transformed || {}).map(([key, value]) => ({ [key]: value }));
  const merged = mergeResponsive({ data, screens });

  return { screens, ...merged };
};
