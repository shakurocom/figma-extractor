import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';

// statically cached: the search index is pre-rendered at build time
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
