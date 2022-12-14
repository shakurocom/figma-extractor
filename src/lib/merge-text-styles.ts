/* eslint-disable @typescript-eslint/no-var-requires */

import { TextStyle } from './get-text-styles';

type Screens = string;

type MediaCacheItem = { media: Screens; data: TextStyle['0'] };

class MediaCollection {
  private cache: { [className: string]: MediaCacheItem[] } = {};

  constructor(private screens: Record<Screens, number>) {}

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
      const media = mediaList
        .sort(this.sort.bind(this))
        .reduce<TextStyle['0']>((collection, current) => {
          if (current.media === 'bs') {
            return {
              ...collection,
              ...current.data,
            };
          }
          const mediaKey = '@media (min-width: ' + this.screens[current.media] + 'px)';

          return {
            ...collection,
            [mediaKey]: current.data,
          };
        }, {} as TextStyle['0']);

      result.push({
        [className]: media,
      });
    });

    return result;
  }

  private sort(a: MediaCacheItem, b: MediaCacheItem) {
    const sizeA = Number(this.screens[a.media]) || 0;
    const sizeB = Number(this.screens[b.media]) || 0;
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
}: {
  screens: Record<Screens, number>;
  textStyles: TextStyle[];
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

  return [...textStyles, ...mediaCollection.export()];
};
