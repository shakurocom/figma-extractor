type Config = {
  apiKey: string;
  fileId: string;
  styles: {
    exportPath: string;
    allowedThemes?: string[];
    defaultTheme?: string;
    colors?: {
      disabled: boolean;
      keyName?: (name?: string) => string;
      useTheme?: boolean;
    };
    gradients?: {
      disabled: boolean;
      keyName?: (name: string) => string;
    };
    effects?: {
      disabled: boolean;
      keyName?: (name: string) => string;
      useTheme?: boolean;
    };
    textStyles?: {
      disabled: boolean;
      keyName?: (nameFromFigma: string) => string;
      merge?: boolean;
    };
  };
  icons: {
    disabled: boolean;
    nodeIds: string[];
    iconName: (nameFromFigma: string) => string;
    exportPath: string;
    generateSprite: boolean;
    generateTypes: boolean;
    localIcons?: boolean;
  };
  screens?: {
    [title: string]: number;
  };
};

type OnlyArgs = 'colors' | 'effects' | 'textStyles' | 'gradients' | 'icons';
