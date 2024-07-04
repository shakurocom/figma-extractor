import { checkFilePath, readFile } from '../utils/fs-util';
import { Variables2JsonAdapter } from './adapters';
import type { ImportVariablesAdapter, ImportVariablesValidatorData } from './types';

const isValidatorDataInstance = (data: unknown): data is ImportVariablesValidatorData =>
  typeof data === 'object' && !!data && 'validateData' in data;

export const createImportVariablesAdapter = async (
  filePath: string,
): Promise<ImportVariablesAdapter> => {
  if (!checkFilePath(filePath)) {
    throw new Error(`File: ${filePath} doesn't exist`);
  }

  const data = await readFile(filePath);

  // TODO: Replace to changeable class name through config
  const adapter = new Variables2JsonAdapter(JSON.parse(data));

  if (isValidatorDataInstance(adapter)) {
    const err = adapter.validateData();
    if (err) {
      throw err;
    }
  }

  return adapter;
};
