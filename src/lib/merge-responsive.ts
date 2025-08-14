/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */

type Screens = string;

type MediaCacheItem = { media: Screens; data: Record<string, string> };

type AddMediaCacheItemArg = { media: Screens; value: string };

class MediaCollection {
  private cache: { [className: string]: MediaCacheItem[] } = {};

  constructor(private screens: Record<Screens, string | number>) {}

  add(className: string, { media, value }: AddMediaCacheItemArg) {
    if (!Array.isArray(this.cache[className])) {
      this.cache[className] = [];
    }
    let styles = {};

    // className should has following format: {scope}-{prop}-{key}
    // for example: box-pb-10
    if (className.includes('-pt-') || className.endsWith('-pt')) {
      styles = {
        'padding-top': value,
      };
    } else if (className.includes('-pb-') || className.endsWith('-pb')) {
      styles = {
        'padding-bottom': value,
      };
    } else if (className.includes('-pl-') || className.endsWith('-pl')) {
      styles = {
        'padding-left': value,
      };
    } else if (className.includes('-pr-') || className.endsWith('-pr')) {
      styles = {
        'padding-right': value,
      };
    } else if (className.includes('-px-') || className.endsWith('-px')) {
      styles = {
        'padding-left': value,
        'padding-right': value,
      };
    } else if (className.includes('-py-') || className.endsWith('-py')) {
      styles = {
        'padding-top': value,
        'padding-bottom': value,
      };
    } else if (className.includes('-p-') || className.endsWith('-p')) {
      styles = {
        padding: value,
      };
    } else if (className.includes('-mt-') || className.endsWith('-mt')) {
      styles = {
        'margin-top': value,
      };
    } else if (className.includes('-mb-') || className.endsWith('-mb')) {
      styles = {
        'margin-bottom': value,
      };
    } else if (className.includes('-ml-') || className.endsWith('-ml')) {
      styles = {
        'margin-left': value,
      };
    } else if (className.includes('-mr-') || className.endsWith('-mr')) {
      styles = {
        'margin-right': value,
      };
    } else if (className.includes('-mx-') || className.endsWith('-mx')) {
      styles = {
        'margin-left': value,
        'margin-right': value,
      };
    } else if (className.includes('-my-') || className.endsWith('-my')) {
      styles = {
        'margin-top': value,
        'margin-bottom': value,
      };
    } else if (className.includes('-m-') || className.endsWith('-m')) {
      styles = {
        margin: value,
      };
    } else if (className.includes('-gap-') || className.endsWith('-gap')) {
      styles = {
        gap: value,
      };
    } else if (
      (className.includes('-min-width-') || className.endsWith('-min-width')) &&
      value !== '0px'
    ) {
      styles = {
        'min-width': value,
      };
    } else if (
      (className.includes('-max-width-') || className.endsWith('-max-width')) &&
      value !== '0px'
    ) {
      styles = {
        'max-width': value,
      };
    } else if ((className.includes('-width-') || className.endsWith('-width')) && value !== '0px') {
      styles = {
        width: value,
      };
    } else if (
      (className.includes('-max-height-') || className.endsWith('-max-height')) &&
      value !== '0px'
    ) {
      styles = {
        'max-height': value,
      };
    } else if (
      (className.includes('-min-height-') || className.endsWith('-min-height')) &&
      value !== '0px'
    ) {
      styles = {
        'min-height': value,
      };
    } else if (
      (className.includes('-height-') || className.endsWith('-height')) &&
      value !== '0px'
    ) {
      styles = {
        height: value,
      };
    } else {
      if (value !== '0px') {
        console.warn(
          '[warn:merge-responsive] >>> ',
          `'${className}' are not supported for generating any styles`,
        );
      }
    }

    this.cache[className] = [...this.cache[className], { media, data: styles }];
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
  data.forEach(style => {
    Object.entries(style).map(([className, screens]) => {
      Object.entries(screens).map(addToMediaCollectionByClassName(mediaCollection, className));
    });
  });

  return mediaCollection.export();
};

const addToMediaCollectionByClassName =
  (mediaCollection: MediaCollection, className: string) =>
  ([media, value]: [string, string]) => {
    // map spacing to tw like spacing utils
    if (className.includes('spacing-')) {
      [
        'p',
        'px',
        'py',
        'pt',
        'pb',
        'pl',
        'pr',
        'm',
        'mx',
        'my',
        'mt',
        'mb',
        'ml',
        'mr',
        'gap',
        'max-width',
        'min-width',
      ].forEach(prop => {
        const cn = `.${className}-${prop}`;
        mediaCollection.add(cn, { media, value });
      });
    } else {
      mediaCollection.add(`.${className}`, { media, value });
    }
  };
