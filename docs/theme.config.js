export default {
  repository: 'https://github.com/shakurocom/figma-extractor',
  docsRepository: 'https://github.com/shakurocom/figma-extractor/documentation',
  branch: 'master', // branch of docs
  path: '/', // path of docs
  titleSuffix: ' – Figma extractor',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null,
  darkMode: true,
  footer: true,
  footerText: <>MIT {new Date().getFullYear()} © Shakuro.</>,
  footerEditOnGitHubLink: true, // will link to the docs repo
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
