export const stringifyRecordsWithSort = (obj: Record<string, any>) => {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];

      return acc;
    }, {} as Record<string, any>);

  return JSON.stringify(sorted);
};
