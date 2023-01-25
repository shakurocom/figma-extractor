export const convertLetterSpacing = (
  fontSize: number,
  letterSpacing: number,
  toConvert: 'em' | 'px',
) => {
  switch (toConvert) {
    case 'em':
      return (letterSpacing / fontSize).toFixed(2) + 'em';
    case 'px':
      return letterSpacing + 'px';
    default:
      return letterSpacing;
  }
};
