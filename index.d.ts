type Config = {
  apiKey: string;
  fileId: string;
  styles: {
    exportPath: string;
    colors?: {
      disabled: boolean;
      keyName?: (name?: string) => string;
      useTheme?: boolean;
      allowedThemes?: string[];
      defaultTheme?: string;
    };
    gradients?: {
      disabled: boolean;
      keyName?: (name: string) => string;
    };
    effects?: {
      disabled: boolean;
      keyName?: (name: string) => string;
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
