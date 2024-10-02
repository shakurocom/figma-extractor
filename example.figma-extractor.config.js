// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires

/**
 * @type {import('@shakuroinc/figma-extractor').Config}
 **/
module.exports = {
  apiKey: 'xxxxxx',
  fileId: 'xxxxxx',
  jsonVariablesPath: './variables.json',
  styles: {
    exportPath: './src/theme',
    allowedThemes: ['light', 'dark'], // allowed themes
    defaultTheme: 'light', // one of the allowed themes which will be meant as default theme
    colors: {
      collectionNames: ['color', 'color_extra'],
      // keyName: nameFromFigma => nameFromFigma`, // custom key name
    },
    responsive: {
      collectionNames: ['responsive', 'responsive_extra'],
      // keyName: nameFromFigma => nameFromFigma`, // custom key name
    },
    effects: {
      collectionNames: ['effects'],
      // keyName: nameFromFigma => nameFromFigma`, // custom key name
    },
    textStyles: {
      collectionNames: ['typography', 'typography_xl'],
      keyName: nameFromFigma => {
        return `.v-${getKeyName(nameFromFigma)}`;
      },
    },
  },
  icons: [
    // black and white icons
    // {
    //   nodeIds: ['522-12152'],
    //   iconName: name => name.replace(/ /g, '').replace('/', '-').toLowerCase(),
    //   exportPath: './atoms/icon',
    //   generateSprite: false,
    //   generateTypes: false,
    //   localIcons: false,
    // },
    // For color icons
    /*{
      nodeIds: [
        // add even one node id
      ],
      iconName: name => name.replace(/ /g, '').replace('/', '-').toLowerCase(),
      exportPath: './atoms/icon',
      optimizeSvg: false,
      generateSprite: false,
      generateTypes: false,
      localIcons: false,
    },*/
    // It's block of the config is to generate sprite and types
    {
      nodeIds: ['522-12152'],
      exportPath: './src/atoms/icon',
      generateSprite: true,
      generateTypes: true,
      localIcons: true,
    },
  ],
};

/** @param {string} name */
function getKeyName(name = '') {
  if (name.toLowerCase().startsWith('ui-kit') || name.toLowerCase().startsWith('ui kit')) {
    return 'INTERNAL_DO_NOT_USE';
  }

  /**
   * format name from like:
   *  "heading/h800 - md" ->  "h800-md"
   *  "heading / h800 - md" ->  "h800-md"
   */
  const resultName = name.split('/').join('-');

  if (!resultName) {
    throw `getKeyName for "${name}" returns an empty string, check getKeyName implementation`;
  }

  return resultName;
}

/** @param {string} name */
function getKeyNameWithTheme(name = '') {
  if (name.toLowerCase().startsWith('ui-kit') || name.toLowerCase().startsWith('ui kit')) {
    return 'INTERNAL_DO_NOT_USE';
  }

  const splittedName = name.split('/');

  /**
   * format name from like:
   *  "dark/heading/h800 - md" ->  "h800-md"
   *  "dark / heading / h800 - md" ->  "h800-md"
   */
  let resultName = splittedName
    .at(-1)
    ?.replace(' - ', '-')
    .split(' ')
    .find(name => name !== '');

  resultName = `${splittedName[0]}/${resultName}`;

  if (!resultName) {
    throw `getKeyNameWithTheme for "${name}" returns an empty string, check getKeyName implementation`;
  }

  // eslint-disable-next-line no-console
  console.log('getKeyNameWithTheme: ', { name, resultName });

  return resultName;
}
