import { Config, Mode, ThemeVariablesConfig, Variable } from '@/types';

import { getFontFamily } from './text/get-font-family';
import { getTextStyleName } from './text/get-text-style-name';

export type GroupedFontProperty = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
};

export type TextStyle = {
  [x: string]: GroupedFontProperty;
};

function groupFontProperties(properties: Variable[]) {
  const grouped: { [key: string]: GroupedFontProperty } = {};

  properties.forEach(prop => {
    const groupName = prop.name.split('/').slice(0, 2).join('-');
    if (!grouped[groupName]) {
      grouped[groupName] = {} as GroupedFontProperty;
    }

    switch (prop.scopes[0]) {
      case 'FONT_FAMILY':
        grouped[groupName].fontFamily = prop.value as string;
        break;
      // FIXME: temp hack - need to remove. designer should pick correct scope
      case 'ALL_SCOPES':
        grouped[groupName].fontFamily = prop.value as string;
        break;
      case 'FONT_SIZE':
        grouped[groupName].fontSize = prop.value as number;
        break;
      case 'FONT_WEIGHT':
        grouped[groupName].fontWeight = prop.value as number;
        break;
      case 'LINE_HEIGHT':
        grouped[groupName].lineHeight = prop.value as number;
        break;
      case 'LETTER_SPACING':
        grouped[groupName].letterSpacing = prop.value as number;
        break;
    }
  });

  return grouped;
}

export const getTextStyles = (variables: ThemeVariablesConfig[], config: Config) => {
  const filteredCollections = variables.filter(({ name }) =>
    config?.styles?.textStyles?.collectionNames?.includes(name),
  );

  const modes = filteredCollections.reduce<Mode[]>((acc, item) => [...acc, ...item.modes], []);
  const { fontFamily, formattedFontFamilyWithAdditionalFonts } = getFontFamily(modes);

  const textStyles = modes.reduce<{ [x: string]: GroupedFontProperty }[]>((acc, item) => {
    const groupedFontProperties = groupFontProperties(item.variables);

    const formattedVariables = Object.entries(groupedFontProperties).map(([key, value]) => {
      const fontVar = Object.entries(fontFamily).find(([, font]) => font === value.fontFamily);
      const keyName = config?.styles?.textStyles?.keyName || getTextStyleName;

      return {
        [keyName?.(`${key}/${item.name}`)]: {
          ...value,
          fontFamily: `fontFamily.${fontVar?.[0]}`,
          lineHeight: `${((value.lineHeight || 0) / value.fontSize || 1).toFixed(2)}` as any,
        },
      };
    });

    return [...acc, ...formattedVariables];
  }, []);

  return { fontFamily: formattedFontFamilyWithAdditionalFonts, textStyles };
};
