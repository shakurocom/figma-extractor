type SVGCallback = (config?: import('svgo').Config) => import('svgo').Config;

export type IconConfig = {
  disabled: boolean;
  nodeIds: string[];
  iconName: (nameFromFigma: string) => string;
  skipIcon?: (name: string) => boolean;
  exportPath: string;
  generateSprite: boolean;
  generateTypes: boolean;
  localIcons?: boolean;
  optimizeSvg?: false | SVGCallback;
};

export type Config = {
  apiKey: string;
  fileId: string;
  jsonVariablesPath: string;
  styles: {
    exportPath: string;
    allowedThemes?: string[];
    defaultTheme?: string;
    colors?: {
      disabled: boolean;
      keyName?: (name?: string) => string;
      useTheme?: boolean;
      collectionNames: string[];
    };
    gradients?: {
      disabled: boolean;
      keyName?: (name?: string) => string;
    };
    effects?: {
      disabled: boolean;
      keyName?: (name?: string, useTheme?: boolean) => string;
      useTheme?: boolean;
    };
    textStyles?: {
      disabled: boolean;
      keyName?: (nameFromFigma: string) => string;
      merge?: boolean;
    };
  };
  icons: IconConfig | IconConfig[];
  screens?: {
    [title: string]: number | string;
  };
};

export type OnlyArgs = 'colors' | 'effects' | 'textStyles' | 'gradients' | 'icons';

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
