// example
function getTextStyleName(name) {
  // format name from like "Heading / bs-h200 - 80 b" to "bs-h200"

  const splitLeftPart = name?.split(' / ');
  const splitRightPart = splitLeftPart?.[splitLeftPart?.length - 1]
    .split(' ')[0]
    ?.replace('.', '-');

  return splitRightPart || '';
}

const iconNaming = originalName => {
  const formattedName = originalName.replace(/ /g, '').replace('/', '-');

  return formattedName;
};

module.exports = {
  apiKey: 'xxxxxx',
  fileId: 'xxxxxx',
  jsonVariablesPath: './variables.json',
  styles: {
    exportPath: './ui/theme',
    allowedThemes: ['light'], // allowed themes
    defaultTheme: 'light',
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
      keyName: nameFromFigma => `.v-${getTextStyleName(nameFromFigma)}`,
    },
  },
  icons: {
    nodeIds: ['2310:0', '2090:11', '276:18'],
    iconName: name => iconNaming(name), // custom format icon name
    skipIcon: name => !name.startsWith('.'), // custom skip icon name
    exportPath: './ui/atoms/icon',
    generateSprite: true,
    generateTypes: true,
    localIcons: false,
  },
};
