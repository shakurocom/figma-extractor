# Figma extractor

Package for extract style system and svg icons from figma.

## Setup

1. Install package `yarn add -D @shakuroinc/figma-extractor`
2. Add file config `figma-extractor.config.js`
3. Run `yarn figma-extract`

> you also should install `eslint` and `typescript` if it's not installed

## Cli API

- `figma-extract` - extract all from figma.
- `figma-extract --only=colors, icons` - extract only colors and icons. The available options `colors, icons, textStyles, effects`.

## Config

Example `figma-extractor.config.js`

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
      apiKey: 'xxxxxx', // your figma api access key
      fileId: 'xxxxxx', // figma file id
      styles: {
        exportPath: './ui/theme',
        colors: {
          // keyName: nameFromFigma => nameFromFigma`, // custom key name
        },
        effects: {
          // keyName: nameFromFigma => nameFromFigma`, // custom key name
        },
        gradients: {
          // keyName: nameFromFigma => nameFromFigma`, // custom key name
        },
        textStyles: {
          keyName: nameFromFigma => `.v-${getTextStyleName(nameFromFigma)}`,
        },
      },
      icons: {
        // disabled: true,
        nodeIds: ['2310:0', '2090:11', '276:18'],
        iconName: name => iconNaming(name), // custom format icon name
        exportPath: './ui/atoms/icon',
        generateSprite: true,
        generateTypes: true,
      },
    };
