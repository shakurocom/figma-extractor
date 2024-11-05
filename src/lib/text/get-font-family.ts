import { type FloatVariable, Mode, type StringVariable, Variable } from '@/types';

const variableHasWeight = (variable: Variable): variable is FloatVariable =>
  variable.scopes.includes('FONT_WEIGHT');

const variableHasFontFamily = (variable: Variable): variable is StringVariable =>
  variable.scopes.includes('FONT_FAMILY');

export const getFontFamily = (modes: Mode[]) => {
  const variables = modes
    .reduce<Variable[]>((acc, item) => [...acc, ...item.variables], [])
    .reduce<Record<string, { font: string; weight: number }>>((collection, item) => {
      if (variableHasFontFamily(item)) {
        const name = item.name.replace(/\/font$/, '');
        const modifiedItem = !collection[name]
          ? { font: item.value, weight: 0 }
          : { ...collection[name], font: item.value };

        return { ...collection, [name]: modifiedItem };
      }

      if (variableHasWeight(item)) {
        const name = item.name.replace(/\/weight$/, '');
        const modifiedItem = !collection[name]
          ? { font: '', weight: item.value }
          : { ...collection[name], weight: item.value };

        return { ...collection, [name]: modifiedItem };
      }

      return collection;
    }, {});

  const fontAndWeightList = Object.keys(variables).reduce<Record<string, number[]>>(
    (collection, variableTitle) => {
      const item = variables[variableTitle];
      if (item.font && item.weight) {
        const weights: number[] = collection[item.font] ? [...collection[item.font]] : [];
        // If such weight has not been added yet
        if (!weights.includes(item.weight)) {
          weights.push(item.weight);
        }

        return {
          ...collection,
          [item.font]: weights,
        };
      }

      return collection;
    },
    {},
  );

  const formattedFontFamilyWithAdditionalFonts = Object.keys(fontAndWeightList).reduce<
    Record<string, { title: string; comment: string }>
  >((acc, fontName, i) => {
    const weights = fontAndWeightList[fontName] || [];

    return {
      ...acc,
      [`font${i + 1}`]: {
        title: `'${fontName}', Arial, sans-serif`,
        comment: weights.length > 0 ? `used weights: ${weights.sort().join(', ')}` : '',
      },
    };
  }, {});

  const formattedFontFamily = Object.keys(fontAndWeightList).reduce<Record<string, string>>(
    (acc, fontName, i) => ({
      ...acc,
      [`font${i + 1}`]: fontName,
    }),
    {},
  );

  return { formattedFontFamilyWithAdditionalFonts, fontFamily: formattedFontFamily };
};
