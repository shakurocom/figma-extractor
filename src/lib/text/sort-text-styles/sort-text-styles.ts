export const sortTextStyles = (
  textStyles: {
    [x: string]: {
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      textTransform: string;
      lineHeight: string;
      letterSpacing?: string;
    };
  }[],
) => {
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

  return textStyles.map(
    (currentStyle: {
      [x: string]: {
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        textTransform: string;
        lineHeight: string;
        letterSpacing?: string;
      };
    }) => {
      const style = currentStyle[Object.keys(currentStyle)[0]];

      return `'${Object.keys(currentStyle)[0]}': {
      fontFamily: ${style.fontFamily},
      fontSize: ${style.fontSize},
      fontWeight: ${style.fontWeight},
      textTransform: "${style.textTransform}",
      lineHeight: ${style.lineHeight},
      ${style.letterSpacing ? 'letterSpacing: ' + style.letterSpacing + ',' : ''}
      ${renderMedia(style)}
    }`;
    },
  );
};

function renderMedia(style: Record<string, any>) {
  return Object.keys(style)
    .filter(key => key.startsWith('@media'))
    .map(key => {
      return `'${key}': {
      fontFamily: ${style[key].fontFamily},
      fontSize: ${style[key].fontSize},
      fontWeight: ${style[key].fontWeight},
      textTransform: "${style[key].textTransform}",
      lineHeight: ${style[key].lineHeight},
      ${style[key].letterSpacing ? 'letterSpacing: ' + style[key].letterSpacing + ',' : ''}
    }`;
    })
    .join(',');
}
