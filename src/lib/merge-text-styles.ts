/* eslint-disable @typescript-eslint/no-var-requires */

import { TextStyle } from './get-text-styles';

type Screens = string;

type MediaCacheItem = { media: Screens; data: TextStyle['0'] };

class MediaCollection {
  private cache: { [className: string]: MediaCacheItem[] } = {};

  constructor(private screens: Record<Screens, string | number>) {}

  add(className: string, data: MediaCacheItem) {
    if (!Array.isArray(this.cache[className])) {
      this.cache[className] = [];
    }
    this.cache[className] = [...this.cache[className], data];
  }

  export() {
    const result: TextStyle[] = [];
    Object.keys(this.cache).map(className => {
      const mediaList = this.cache[className];
      const media = mediaList.sort(this.sort.bind(this)).reduce<TextStyle['0']>(
        (collection, current) => {
          if (current.media === 'bs') {
            return {
              ...collection,
              ...current.data,
            };
          }
          const screen = this.screens[current.media];
          const mediaScreenSize =
            typeof screen === 'string' && screen.match(/[\d]+px$/i) ? screen : screen + 'px';

          const mediaKey = `@media (min-width: ${mediaScreenSize})`;
          const prevScreenData = Object.keys(collection).at(-1)?.startsWith('@media (min-width')
            ? Object.values(collection).at(-1)
            : collection;

          // skip MQ data if previous query data is the same as data in current MQ
          if (JSON.stringify(prevScreenData, null, 2) === JSON.stringify(current.data, null, 2)) {
            return collection;
          }

          return {
            ...collection,
            [mediaKey]: current.data,
          };
        },
        {} as TextStyle['0'],
      );

      result.push({
        [className]: media,
      });
    });

    return result;
  }

  private sort(a: MediaCacheItem, b: MediaCacheItem) {
    const screenA = this.screens[a.media];
    const screenB = this.screens[b.media];

    const sizeA = (typeof screenA === 'string' ? parseInt(screenA, 10) : screenA) || 0;
    const sizeB = (typeof screenB === 'string' ? parseInt(screenB, 10) : screenB) || 0;

    if (sizeA === sizeB) {
      return 0;
    }

    return sizeA > sizeB ? 1 : -1;
  }
}

const findMediaTypeFromClassName = (className: string, screens: Screens[]) => {
  for (let i = 0; i < screens.length; i++) {
    const regExp = new RegExp('(.+)-' + screens[i]);
    const match = className.match(regExp);
    if (match) {
      return {
        class: match[1],
        media: screens[i],
      };
    }
  }

  return null;
};

/**
 * The function merges text styles with different screen sizes to a single style
 *
 * Detail:
 * If your design system has styles like that:
 * - heading/h500 - bs
 * - heading/h500 - sm
 * - heading/h500 - md
 * - heading/h500 - lg
 * Where the suffixes bd,sm,md and lg are screen sizes
 * This function helps merge such styles to a single style
 * As result, after transformation:
 *    heading/h500 - bs, heading/h500 - sm, heading/h500 - md, heading/h500 - lg
 * we would get such a format:
 *  heading/h500: {
 *    fontSize: ...,
 *    fontWeight: ...,
 *    ...,
 *    '@media (min-width: 600px): {
 *      fontSize: ...,
 *      ...,
 *    },
 *    '@media (min-width: 900px): {
 *      ...,
 *    },
 *    '@media (min-width: 1200px): {
 *      ...,
 *    },
 *  }
 *
 *  Before launching, you need to have correctly a list of screen sizes, like that:
 *  screen: {
 *   bs: 0,
 *   sm: 600,
 *   md: 900,
 *   lg: 1200
 *  }
 *
 *  where `bs` is the base style
 *
 * @param screens - list of available screens
 * @param textStyles
 */
export const mergeTextStyle = ({
  screens,
  textStyles,
  addStylesWithPrefixScreen,
}: {
  screens: Record<Screens, number | string>;
  textStyles: TextStyle[];
  addStylesWithPrefixScreen: boolean;
}): TextStyle[] => {
  const screensKeys = Object.keys(screens) as Screens[];
  const mediaCollection = new MediaCollection(screens);
  textStyles.forEach(textStyle => {
    Object.keys(textStyle).map(key => {
      const foundMediaStyles = findMediaTypeFromClassName(key, screensKeys);
      if (foundMediaStyles) {
        mediaCollection.add(foundMediaStyles.class, {
          media: foundMediaStyles.media,
          data: textStyle[key],
        });
      }
    });
  });

  if (addStylesWithPrefixScreen) {
    return [...textStyles, ...mediaCollection.export()];
  }

  return mediaCollection.export();
};
