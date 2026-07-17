export const appName = 'Figma extractor';
// Public URL of the deployed site (used for metadataBase / OG images).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://figma-extractor.shakuro.workers.dev';
export const appDescription = 'Extract style system and SVG icons from Figma';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'shakurocom',
  repo: 'figma-extractor',
  branch: 'master',
};
