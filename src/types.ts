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
  styles: {
    exportPath: string;
    allowedThemes?: string[];
    defaultTheme?: string;
    colors?: {
      disabled: boolean;
      keyName?: (name?: string, useTheme?: boolean) => string;
      useTheme?: boolean;
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
