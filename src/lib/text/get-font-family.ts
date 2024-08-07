import { Mode, Variable } from '@/types';

import { uniqueElementsBy } from './unique-elements-by';

export const getFontFamily = (modes: Mode[]) => {
  const variables = modes.reduce<Variable[]>((acc, item) => [...acc, ...item.variables], []);
  const uniqFamily = uniqueElementsBy<Variable>(variables, (a, b) => {
    if (a.scopes.includes('FONT_FAMILY') && b.scopes.includes('FONT_FAMILY')) {
      return a.value == b.value;
    }

    return true;
  });

  const formattedFontFamilyWithAdditionalFonts = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: `'${item.value}', Arial, sans-serif`,
    }),
    {},
  );

  const formattedFontFamily = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: item.value,
    }),
    {},
  );

  return { formattedFontFamilyWithAdditionalFonts, fontFamily: formattedFontFamily };
};
