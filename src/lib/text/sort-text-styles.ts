import { GroupedFontProperty, TextStyle } from '@/lib/get-text-styles';

export const sortTextStyles = (textStyles: TextStyle[]) => {
  textStyles.sort(function (a, b) {
    const aName = Object.keys(a)[0];
    const bName = Object.keys(b)[0];
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }

    return 0;
  });

  return textStyles.map((currentStyle: TextStyle) => {
    const style = currentStyle[Object.keys(currentStyle)[0]];

    return `'${Object.keys(currentStyle)[0]}': {
      ${renderGeneralStyles(style)}
      ${renderMedia(style)}
    }`;
  });
};

function renderMedia(style: Record<string, any>) {
  return Object.keys(style)
    .filter(key => key.startsWith('@media'))
    .map(key => {
      return `'${key}': {
        ${renderGeneralStyles(style[key])}
    }`;
    })
    .join(',');
}

function renderGeneralStyles(styles: GroupedFontProperty) {
  return `
      ${renderStyle('fontFamily: [value],', styles.fontFamily)}
      ${renderStyle('fontSize: [value],', styles.fontSize)}
      ${renderStyle('fontWeight: [value],', styles.fontWeight)}
      ${renderStyle('lineHeight: [value],', styles.lineHeight)}
      ${renderStyle("letterSpacing: '[value]px',", styles.letterSpacing)}
  `;
}

function renderStyle(styleTemplate: string, value?: string | number) {
  if (value) {
    return styleTemplate.replace('[value]', value.toString());
  }

  return '';
}
