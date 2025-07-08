import shell from 'shelljs';

export const generateIconsSprite = (path: string) => {
  console.log('Start generation sprite');
  shell.exec(`npx svg-sprite-generate -d ${path}/svg -o ${path}/sprite.svg`, {
    async: true,
  });
  console.log('End generation sprite');
};
