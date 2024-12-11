import { mergeDeepLeft } from 'ramda';

import { Mode } from '@/types';

export type Category = 'box' | 'container' | 'section' | 'screens';

export type NameProperties = Record<string, string>;

export type GroupedItems = Record<Category, NameProperties>;

export type ThemeResponsive = {
  screens: Record<string, Record<string, string>>;
  container: Record<string, Record<string, string>>;
  box: Record<string, Record<string, string>>;
  section: Record<string, Record<string, string>>;
};

export function groupProperties(modes: Mode[]) {
  return modes.reduce<ThemeResponsive>((acc, item) => {
    const grouped = {} as GroupedItems;

    item.variables.forEach(item => {
      const [category] = item.name.split('/') as [Category];

      if (!grouped[category]) {
        grouped[category] = {} as NameProperties;
      }

      // Skip values equal to 0, for example we don't need `py-0` etc
      if (!item.name.match(/(-|\/)0$/)) {
        grouped[category][item.name.replaceAll('/', '-')] = `${item.value}px`;
      }
    });

    const formatted = Object.entries(grouped).reduce<ThemeResponsive>((acc, [key, value]) => {
      return { ...acc, [key]: { [item.name]: { ...(acc as any)[key], ...value } } };
    }, {} as ThemeResponsive);

    return mergeDeepLeft(acc, formatted);
  }, {} as ThemeResponsive);
}

type TransformedConfig = Record<string, Record<string, string>>;

export const transformProperties = (input: ThemeResponsive): TransformedConfig => {
  const result = {} as TransformedConfig;

  for (const section in input) {
    const sectionConfig = input[section as Category];

    for (const screenSize in sectionConfig) {
      const screenConfig = sectionConfig[screenSize];

      for (const property in screenConfig) {
        if (!result[property]) {
          result[property] = {};
        }
        result[property][screenSize] = screenConfig[property];
      }
    }
  }

  return result;
};
