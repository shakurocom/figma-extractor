import shell from 'shelljs';

export const generateIconsSprite = (path: string) => {
  console.log('Start generation sprite');

  const svgAttrs = '\'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 0 0"\'';

  shell.exec(
    `npx svg-symbol-sprite -i ${path}/svg -o ${path}/sprite.svg -c false -p "" -a ${svgAttrs}`,
    {
      async: true,
    },
  );
  console.log('End generation sprite');
};
