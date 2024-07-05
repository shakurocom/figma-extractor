import type { FileNodesResponse, FullStyleMetadata } from 'figma-js';
import fs from 'fs';
import path from 'path';

import { Variables2JsonAdapter } from './adapters';
import { createImportVariablesAdapter } from './create-adapter';
import type { ImportVariablesAdapter, ImportVariablesValidatorData } from './types';

class MockAdapter implements ImportVariablesAdapter {
  data: unknown;
  get styleMetadata(): FullStyleMetadata[] {
    throw new Error('Method not implemented.');
  }
  get fileNodes(): FileNodesResponse {
    throw new Error('Method not implemented.');
  }
}

const mockValidateData = jest.fn(() => {});
class MockValidator implements ImportVariablesValidatorData {
  validateData() {
    return mockValidateData() as any;
  }
}

describe('createImportVariablesAdapter', () => {
  afterEach(() => {
    mockValidateData.mockReset();
  });
  it('should return a default adapter', async () => {
    const realData = fs.readFileSync(path.join(__dirname, './fixtures/variables.json'), {
      encoding: 'utf-8',
    });

    return createImportVariablesAdapter(JSON.parse(realData)).then(adapter => {
      expect(adapter).toBeInstanceOf(Variables2JsonAdapter);
    });
  });

  it('should return a external adapter', async () => {
    return createImportVariablesAdapter({ abc: 1 }, MockAdapter).then(adapter => {
      expect(adapter).toBeInstanceOf(MockAdapter);
    });
  });

  it('should run validation function', () => {
    mockValidateData.mockImplementationOnce(() => undefined);

    return createImportVariablesAdapter({ abc: 1 }, MockValidator as any).then(adapter => {
      expect(mockValidateData).toHaveBeenCalled();
      expect(adapter).toBeInstanceOf(MockValidator);
    });
  });

  it('should throw the error if the passed file is not valid json', () => {
    mockValidateData.mockImplementationOnce(() => new Error('not valid'));

    return createImportVariablesAdapter({ abc: 1 }, MockValidator as any).catch(err => {
      expect(mockValidateData).toHaveBeenCalled();
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('not valid');
    });
  });
});
