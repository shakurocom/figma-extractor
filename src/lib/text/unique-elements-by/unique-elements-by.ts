export const uniqueElementsBy = (arr: any[], fn: (a: any, b: any) => void) =>
  arr.reduce((acc, v) => {
    if (!acc.some((x: any) => fn(v, x))) acc.push(v);
    return acc;
  }, []);
