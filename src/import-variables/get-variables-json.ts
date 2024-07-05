import { checkFilePath, readFile } from '../utils/fs-util';

export const getVariablesJson = async (filePath: string): Promise<unknown> => {
  if (!checkFilePath(filePath)) {
    throw new Error(`File: ${filePath} doesn't exist`);
  }

  const data = await readFile(filePath);

  return JSON.parse(data);
};
