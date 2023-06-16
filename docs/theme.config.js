export default {
  project: {
    link: 'https://github.com/shakurocom/figma-extractor',
  },
  docsRepositoryBase: 'https://github.com/shakurocom/figma-extractor/blob/master/docs',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Figma extractor',
    };
  },
  navigation: {
    next: true,
    prev: true,
  },
  darkMode: true,
  footer: {
    text: <>MIT {new Date().getFullYear()} © Shakuro.</>,
  },
  logo: (
    <>
      <span className="hidden mr-2 font-extrabold md:inline">Figma exctractor</span>
      <span className="hidden text-gray-600 font-normal md:inline">
        Extract style system from figma
      </span>
    </>
  ),
  head: (
    <>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <meta content="Figma extractor" name="description" />
      <meta content="Figma extractor" name="og:title" />
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
      <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
      <link href="/site.webmanifest" rel="manifest" />
      <link color="#5bbad5" href="/safari-pinned-tab.svg" rel="mask-icon" />
      <meta content="#da532c" name="msapplication-TileColor" />
      <meta content="#ffffff" name="theme-color" />
    </>
  ),
};
