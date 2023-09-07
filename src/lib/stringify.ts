import { sortCollection } from './sort-collection';

export const stringifyRecordsWithSort = (obj: Record<string, any>) => {
  const sorted = sortCollection(obj);

  return JSON.stringify(sorted);
};
