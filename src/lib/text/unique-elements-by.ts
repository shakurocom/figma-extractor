export function uniqueElementsBy<T = never>(arr: T[], fn: (a: T, b: T) => void) {
  return arr.reduce<T[]>((acc, v) => {
    if (!acc.some(x => fn(v, x))) acc.push(v);

    return acc;
  }, []);
}
