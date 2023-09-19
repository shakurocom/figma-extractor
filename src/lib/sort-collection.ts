export const sortCollection = (obj: Record<string, any>) => {
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];

        return acc;
      },
      {} as Record<string, any>,
    );
};
