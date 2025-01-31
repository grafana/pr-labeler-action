export const invertMapping = (mapping: { [p: string]: string[] }): { [p: string]: string[] } =>
  Object.entries(mapping).reduce(
    (acc, [key, value]) => {
      for (const val of value) {
        if (acc[val]) {
          acc[val].push(key);
        } else {
          acc[val] = [key];
        }
      }
      return acc;
    },
    {} as { [p: string]: string[] }
  );
