import { checkFilePath, readFile } from '../utils/fs-util';
import { getVariablesJson } from './get-variables-json';

jest.mock('../utils/fs-util', () => {
  return {
    checkFilePath: jest.fn(),
    readFile: jest.fn(),
  };
});

describe('getVariablesJson', () => {
  afterEach(() => {
    (checkFilePath as jest.Mock).mockReset();
    (readFile as jest.Mock).mockReset();
  });

  it('should return a correct json data', async () => {
    (checkFilePath as jest.Mock).mockReturnValue(true);
    (readFile as jest.Mock).mockImplementationOnce(() => Promise.resolve('{"abc":1}'));

    return getVariablesJson('/variables.json').then(adapter => {
      expect(checkFilePath).toHaveBeenCalledWith('/variables.json');
      expect(readFile).toHaveBeenCalledWith('/variables.json');
      expect(adapter).toEqual({ abc: 1 });
    });
  });

  it("should throw the error if the passed file doesn't exist", () => {
    (checkFilePath as jest.Mock).mockReturnValue(false);

    return getVariablesJson('/variables.json').catch(err => {
      expect(checkFilePath).toHaveBeenCalledWith('/variables.json');
      expect(readFile).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("File: /variables.json doesn't exist");
    });
  });

  it('should throw the error if the parsing of the passed file has errors', () => {
    (checkFilePath as jest.Mock).mockReturnValue(true);
    (readFile as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Parsing error');
    });

    return getVariablesJson('/variables.json').catch(err => {
      expect(checkFilePath).toHaveBeenCalledWith('/variables.json');
      expect(readFile).toHaveBeenCalledWith('/variables.json');
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Parsing error');
    });
  });
});
