import { uniqueElementsBy } from '../unique-elements-by/unique-elements-by';

export const getFontFamily = (textStyles: any) => {
  const uniqFamily: any[] = uniqueElementsBy(
    textStyles,
    (a, b) => a.style.fontFamily == b.style.fontFamily,
  );

  const formattedFontFamilyWithAdditionalFonts = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: `'${item.style.fontFamily}', Arial, sans-serif`,
    }),
    {},
  );

  const formattedFontFamily = uniqFamily.reduce(
    (acc, item, i) => ({
      ...acc,
      [`font${i + 1}`]: item.style.fontFamily,
    }),
    {},
  );

  return { formattedFontFamilyWithAdditionalFonts, fontFamily: formattedFontFamily };
};
