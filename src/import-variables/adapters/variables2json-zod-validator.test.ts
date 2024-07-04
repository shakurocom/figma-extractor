import { ZodError } from 'zod';

import { variables2JsonZodValidator } from './variables2json-zod-validator';

describe('variables2JsonZodValidator', () => {
  it('should validate successfully for a valid json data', () => {
    const data = {
      version: '1.0',
      collections: [
        {
          name: 'Global',
          modes: [
            {
              name: 'General',
              variables: [
                {
                  name: 'color/brand/100',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 0,
                    g: 255,
                    b: 255,
                    a: 1,
                  },
                },
                {
                  name: 'color/brand/200',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 22,
                    g: 255,
                    b: 255,
                    a: 0.6,
                  },
                },
                {
                  name: 'colors/brand/300',
                  type: 'color',
                  isAlias: true,
                  value: {
                    collection: 'Global',
                    name: 'color/brand/100',
                  },
                },
                {
                  name: 'spacing/zero',
                  type: 'number',
                  isAlias: false,
                  value: 0,
                },
                {
                  name: 'spacing/one',
                  type: 'number',
                  isAlias: false,
                  value: 1,
                },
                {
                  name: 'spacing/two',
                  type: 'number',
                  isAlias: true,
                  value: {
                    collection: 'Global',
                    name: 'spacing/one',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const res = variables2JsonZodValidator({ ...data, extraField: 'test' });

    expect(res).toEqual(data);
  });

  it('writes test data into a new file', () => {
    const data = {
      version: '1.0',
    };

    expect(() => {
      variables2JsonZodValidator(data);
    }).toThrow(ZodError);
  });
});
