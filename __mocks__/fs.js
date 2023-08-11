import { fs } from 'memfs';

fs.__originalFs = jest.requireActual('fs');
module.exports = fs;
