import { StyleType } from 'figma-js';

// eslint-disable-next-line @typescript-eslint/naming-convention
type StyleTypePredicate = (item: { style_type: StyleType }) => boolean;

const getStyleTypePredicate = (styleType: StyleType): StyleTypePredicate => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return ({ style_type }) => style_type === styleType;
};

export const styleTypeUtils = {
  isFill: getStyleTypePredicate('FILL'),
  isEffect: getStyleTypePredicate('EFFECT'),
  isText: getStyleTypePredicate('TEXT'),
};
