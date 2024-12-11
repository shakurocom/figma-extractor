/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */

type Screens = string;

type MediaCacheItem = { media: Screens; data: Record<string, string> };

class MediaCollection {
  private cache: { [className: string]: MediaCacheItem[] } = {};

  constructor(private screens: Record<Screens, string | number>) {}

  add(className: string, data: Omit<MediaCacheItem, 'data'> & { data: string }) {
    if (!Array.isArray(this.cache[className])) {
      this.cache[className] = [];
    }
    const style = data as any;
    // className should has following format: {scope}-{prop}-{key}
    // for example: box-pb-10
    if (className.includes('-pt-')) {
      style.data = {
        'padding-top': data.data,
      };
    } else if (className.includes('-pb-')) {
      style.data = {
        'padding-bottom': data.data,
      };
    } else if (className.includes('-pl-')) {
      style.data = {
        'padding-left': data.data,
      };
    } else if (className.includes('-pr-')) {
      style.data = {
        'padding-right': data.data,
      };
    } else if (className.includes('-px-')) {
      style.data = {
        'padding-left': data.data,
        'padding-right': data.data,
      };
    } else if (className.includes('-py-')) {
      style.data = {
        'padding-top': data.data,
        'padding-bottom': data.data,
      };
    } else if (className.includes('-p-')) {
      style.data = { padding: data.data };
    } else if (className.includes('-gap-')) {
      style.data = {
        gap: data.data,
      };
    } else if (className.includes('-max-width-')) {
      style.data = {
        'max-width': data.data,
      };
    } else if (className.includes('-min-width-')) {
      style.data = {
        'min-width': data.data,
      };
    } else {
      console.warn(
        '[warn:merge-responsive] >>> ',
        `'${className}' are not supported for generating any styles`,
      );

      style.data = {};
    }

    this.cache[className] = [...this.cache[className], style];
  }

  export() {
    let result: { [x: string]: { [x: string]: string | Record<string, string> } } = {};
    Object.keys(this.cache).map(className => {
      const mediaList = this.cache[className];
      const media = mediaList
        .sort(this.sort.bind(this))
        .reduce<{ [x: string]: string | Record<string, string> }>(
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

            return {
              ...collection,
              [mediaKey]: current.data,
            };
          },
          {} as Record<string, string>,
        );

      result = {
        ...result,
        [className]: media,
      };
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

/**
 * The function merges text styles with different screen sizes to a single style
 *
 * Detail:
 * If your design system has local variables with modes
 * - shadow/500 - bs
 * - shadow/500 - sm
 * - shadow/500 - md
 * - shadow/500 - lg
 * Where the suffixes bd,sm,md and lg are screen sizes
 * This function helps merge such styles to a single style
 * As result, after transformation:
 *    shadow/500 - bs, shadow/500 - sm, shadow/500 - md, shadow/500 - lg
 * we would get such a format:
 *  shadow/500: {
 *    fontSize: ...,
 *    fontWeight: ...,
 *    ...,
 *    '@media (min-width: 600px): {
 *      box-shadow: ...,
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
 * @param responsive
 */
export const mergeResponsive = ({
  screens,
  data,
}: {
  screens: Record<Screens, number | string>;
  data: {
    [x: string]: Record<string, string>;
  }[];
}) => {
  const mediaCollection = new MediaCollection(screens);
  data.forEach(textStyle => {
    Object.entries(textStyle).map(([className, textStyleScreens]) => {
      Object.entries(textStyleScreens).map(([key, value]) => {
        mediaCollection.add(`.${className}`, {
          media: key,
          data: value,
        });
      });
    });
  });

  return mediaCollection.export();
};
