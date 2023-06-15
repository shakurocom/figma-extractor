import { replaceSlashToDash } from './replace-slash-to-dash';

type ThemeName = string;

export type VariablesCollection = Record<string, string>;

export type ThemeCollection = Record<ThemeName, VariablesCollection>;

export const NOT_FOUND_THEME_NAME = '_';
export const DEFAULT_THEME_NAME = '__DEFAULT__';

export const checkConfigAndThrowCommonError = ({
  allowedThemes,
  defaultTheme,
}: {
  allowedThemes?: string[];
  defaultTheme?: string;
}): {
  allowedThemes: string[];
  defaultTheme?: string;
} => {
  if (!Array.isArray(allowedThemes)) {
    throw new Error(
      '`config -> styles -> allowedThemes` field is required when the useTheme is equal true',
    );
  }

  if (allowedThemes.length === 0) {
    throw new Error('`config -> styles -> allowedThemes` field must have one or more theme name');
  }

  if (defaultTheme && !allowedThemes.includes(defaultTheme)) {
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
  defaultTheme,
}: {
  allowedThemes: string[];
  defaultTheme?: string;
}): ThemeCollection => {
  const themesCollection = [...allowedThemes, NOT_FOUND_THEME_NAME].reduce<ThemeCollection>(
    (col, current) => {
      col[current] = {};

      return col;
    },
    {},
  );

  if (!defaultTheme) {
    themesCollection[DEFAULT_THEME_NAME] = {};
  }

  return themesCollection;
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
