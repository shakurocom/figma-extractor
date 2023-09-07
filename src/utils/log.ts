export const createLog = (enabled: boolean) => {
  return (...args: string[]) => {
    if (enabled) {
      // if the first argument starts from [ then we consider that the first argument is a log title
      if (args && args[0] && args[0][0] === '[') {
        console.log(...args);
      } else {
        console.log('[info] >>> ', ...args);
      }
    }
  };
};
