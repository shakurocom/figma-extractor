import { replaceSlashToDash } from './replace-slash-to-dash';

type ThemeName = string;

export type VariablesCollection = Record<string, string>;

export type ThemeCollection = Record<ThemeName, VariablesCollection>;

export const NOT_FOUND_THEME_NAME = '_';

export const checkConfigAndThrowCommonError = ({
  allowedThemes,
  defaultTheme,
}: {
  allowedThemes?: string[];
  defaultTheme?: string;
}): {
  allowedThemes: string[];
  defaultTheme: string;
} => {
  if (!Array.isArray(allowedThemes)) {
    throw new Error(
      '`config -> styles -> allowedThemes` field is required when the useTheme is equal true',
    );
  }

  if (typeof defaultTheme !== 'string') {
    throw new Error(
      '`config -> styles -> defaultTheme` field is required when the useTheme is equal true',
    );
  }

  if (allowedThemes.length === 0) {
    throw new Error('`config -> styles -> allowedThemes` field must have one or more theme name');
  }

  if (!allowedThemes.includes(defaultTheme)) {
    throw new Error(
      "`config -> styles -> defaultTheme` field must be one of allowedThemes' values",
    );
  }

  return {
    allowedThemes,
    defaultTheme,
  };
};

export const createThemeCollection = ({
  allowedThemes,
}: {
  allowedThemes: string[];
}): ThemeCollection => {
  return [...allowedThemes, NOT_FOUND_THEME_NAME].reduce<ThemeCollection>((col, current) => {
    col[current] = {};

    return col;
  }, {});
};

export const variableNameIsValid = (name: string) => !!name.match(/^[\w\-]+$/);

export const addNewNameToEachTheme = (collection: ThemeCollection, newName: string) => {
  for (const themeName of Object.keys(collection)) {
    if (themeName !== NOT_FOUND_THEME_NAME && !(newName in collection[themeName])) {
      collection[themeName][newName] = '';
    }
  }
};

export function* separateThemes({
  data,
  allowedThemes,
}: {
  data: Record<string, string>;
  allowedThemes: string[];
}) {
  for (const [name, value] of Object.entries(data)) {
    const separatedData = name.split('/');
    if (separatedData.length > 1) {
      const [separatedTheme, ...others] = separatedData;
      if (separatedTheme && allowedThemes?.includes(separatedTheme.trim())) {
        const newName = replaceSlashToDash(others.join('/'));

        yield { newName, theme: separatedTheme.trim(), value };

        continue;
      }
    }

    const newName = replaceSlashToDash(name);

    yield { newName, theme: NOT_FOUND_THEME_NAME, value };
  }
}

export const generateJsVariables = (
  variablesCollection: VariablesCollection,
  defaultVariablesCollection: VariablesCollection,
) => {
  const data: Record<string, string> = {};
  for (const name of Object.keys(variablesCollection)) {
    data[name] = `var(--sh-${name},'${defaultVariablesCollection[name] ?? ''}')`;
  }

  return data;
};

export const generateJsColors = (variablesCollection: VariablesCollection) => {
  const data: Record<string, string> = {};
  for (const [name, value] of Object.entries(variablesCollection)) {
    if (value) {
      data[name] = value;
    }
  }

  return data;
};

export const generateCSSVariables = (
  variablesCollection: VariablesCollection,
  themeName?: ThemeName,
) => {
  const data: string[] = [];
  for (const [name, value] of Object.entries(variablesCollection)) {
    data.push(`--sh-${name}: '${value}';`);
  }
  data.sort((a, b) => {
    if (a === b) {
      return 0;
    }

    return a > b ? 1 : -1;
  });

  if (themeName && themeName !== NOT_FOUND_THEME_NAME) {
    return `
[data-theme='${themeName}'] {
  ${data.join('\n')}
}`;
  } else {
    return `
:root {
  ${data.join('\n')}
}`;
  }
};

export const generateThemeListTS = (themeCollection: ThemeCollection, defaultTheme?: string) => {
  const themes: string[] = Object.keys(themeCollection)
    .filter(theme => {
      return theme !== NOT_FOUND_THEME_NAME;
    })
    .map(theme => `'${theme}'`);

  return `
// THIS FILE IS GENERATED AUTOMATICALLY. DON'T CHANGE IT.

export type DefaultTheme = '${defaultTheme ?? ''}';

export type Theme = ${themes.join(' | ')};  
  `;
};

export function* getRealThemesFromCollection({
  themesCollection,
  defaultTheme,
}: {
  themesCollection: ThemeCollection;
  defaultTheme: string;
}) {
  for (const [themeName, variables] of Object.entries(themesCollection)) {
    if (themeName === NOT_FOUND_THEME_NAME) {
      continue;
    }

    const currentThemeIsDefault = !!themesCollection[defaultTheme] && defaultTheme === themeName;

    yield { themeName, variables, currentThemeIsDefault };
  }
}
