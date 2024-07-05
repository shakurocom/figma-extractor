import { Variables2JsonAdapter } from './adapters';
import type { ImportVariablesAdapter, ImportVariablesValidatorData } from './types';

const isValidatorDataInstance = (data: unknown): data is ImportVariablesValidatorData =>
  typeof data === 'object' && !!data && 'validateData' in data;

export const createImportVariablesAdapter = async (
  data: unknown,
  // TODO: Replace to config adapter and resolve it through importing of external file with adapters
  classAdapter: new (data: unknown) => ImportVariablesAdapter = Variables2JsonAdapter,
): Promise<ImportVariablesAdapter> => {
  const adapter = new classAdapter(data);

  if (isValidatorDataInstance(adapter)) {
    const err = adapter.validateData();
    if (err) {
      throw err;
    }
  }

  return adapter;
};
