type Config = {
  apiKey: string;
  fileId: string;
  exportStylesPath: string;
  colors?: {
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
  };
  icons: {
    disabled: boolean;
    nodeIds: string[];
    iconName: (nameFromFigma: string) => string;
    exportPath: string;
    generateSprite: boolean;
    generateTypes: boolean;
  };
};

type OnlyArgs = 'colors' | 'effects' | 'textStyles' | 'icons';
