type SVGCallback = (config?: import('svgo').Config) => import('svgo').Config;

export type IconConfig = {
  disabled?: boolean;
  nodeIds: string[];
  // custom format icon name
  iconName?: (nameFromFigma: string) => string;
  // custom filter icon callback. It allows skipping some unnecessary icons
  skipIcon?: (name: string) => boolean;
  exportPath: string;
  /**
   * for example:
   * exportPath: './test',
   * exportSubdir: 'sub',
   *
   * will download icons to dir ./test/sub/svg
   */
  exportSubdir?: string;
  // If the field is true, then the SVG sprite will be generated
  generateSprite: boolean;
  // If the field is true, then the file with icons' names as types will be created
  generateTypes: boolean;
  // If the field is true, then the extractor will only generate SVG sprite from local icons
  // else all available icons will be downloaded and the sprite will be generated from them
  localIcons?: boolean;
  // It allows changing svgo config if you need or disable at all
  // if this field is a function, then the function will be run before svgo optimization. And changed config from this function will be passed to svgo optimization
  // if this field is boolean and equals `false` then svgo optimization won't be run at all
  optimizeSvg?: false | SVGCallback;
};

export type Config = {
  // your Figma api access key
  apiKey: string;
  // Figma file id
  fileId: string;
  // path to json variables extracted from figma extension
  jsonVariablesPath: string;
  styles: {
    // The main path for exporting all requested data
    exportPath: string;

    /*
      It will parse returned name of colors or etc. and look for allowed themes at the start of names
      example: for allowedThemes: ['light','dark'] all returned names will be parsed by looking for 'light' or 'dark' at the start of name
      And if color name is 'light/text/text-900' then it will be transformed to 'text/text-900' and relate to the 'light' theme
      All others name which are not found by allowed themes will be overlooked.
     */
    allowedThemes?: string[];

    /**
      It's used like default variables inside generated CSS variables
     */
    defaultTheme?: string;
    colors?: {
      disabled?: boolean;
      // custom key name
      keyName?: (name?: string) => string;
      // collections names from figma local variables
      collectionNames: string[];
      // group names in collection
      groupNames?: string[];
    };
    effects?: {
      disabled?: boolean;
      // custom key name
      keyName?: (name?: string) => string;
      // collections names from figma local variables
      collectionNames: string[];
      // group names in collection
      groupNames?: string[];
    };
    textStyles?: {
      disabled?: boolean;
      // custom key name
      keyName?: (nameFromFigma: string) => string;
      // collections names from figma local variables
      collectionNames: string[];
      // This field is to add extra styles with prefix screens
      addStylesWithPrefixScreen?: boolean;
    };
    responsive?: {
      disabled?: boolean;
      // collections names from figma local variables
      collectionNames: string[];
    };
  };

  // Configuration of icons can have more one setting
  icons: IconConfig | IconConfig[];
};

export type OnlyArgs = 'colors' | 'effects' | 'textStyles' | 'responsive' | 'icons';

export type ThemeVariablesConfig = {
  name: string;
  modes: Mode[];
};

export type Mode = {
  name: string;
  modeId: string;
  variables: Variable[];
};

export type Variable = ColorVariable | StringVariable | FloatVariable;

export type BaseVariable = {
  name: string;
  type: 'COLOR' | 'STRING' | 'FLOAT';
  scopes: VariableScope[];
};

export interface ColorVariable extends BaseVariable {
  type: 'COLOR';
  value: RGBA;
}

export interface StringVariable extends BaseVariable {
  type: 'STRING';
  value: string;
}

export interface FloatVariable extends BaseVariable {
  type: 'FLOAT';
  value: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type VariableScope =
  | 'EFFECT_COLOR'
  | 'SHAPE_FILL'
  | 'FRAME_FILL'
  | 'TEXT_FILL'
  | 'FONT_FAMILY'
  | 'FONT_SIZE'
  | 'FONT_WEIGHT'
  | 'LINE_HEIGHT'
  | 'LETTER_SPACING'
  | 'ALL_SCOPES'
  | 'WIDTH_HEIGHT'
  | 'GAP'
  | 'CORNER_RADIUS';
