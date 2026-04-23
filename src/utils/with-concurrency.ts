export const withConcurrency = <T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> => {
  if (tasks.length === 0) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let started = 0;
    let finished = 0;

    const run = () => {
      while (started < tasks.length && started - finished < limit) {
        const index = started++;
        tasks[index]()
          .then(result => {
            results[index] = result;
            finished++;
            if (finished === tasks.length) resolve(results);
            else run();
          })
          .catch(reject);
      }
    };

    run();
  });
};
