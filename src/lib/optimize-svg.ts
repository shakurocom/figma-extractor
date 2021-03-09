import fs from 'fs';
import { optimize, OptimizeOptions } from 'svgo';

const config: OptimizeOptions = {
  js2svg: { pretty: true },
  plugins: [
    'cleanupAttrs',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    { name: 'removeViewBox', active: false },
    'cleanupEnableBackground',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    'cleanupIDs',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    { name: 'removeRasterImages', active: false },
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['(stroke|fill)'],
      },
    },
  ],
};

export const optimizeSvg = async (file: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        throw err;
      }

      resolve(
        fs.writeFile(
          file,
          optimize(data, { path: file, ...config }).data,
          err => err && console.log('error', reject),
        ),
      );
    });
  });
};
