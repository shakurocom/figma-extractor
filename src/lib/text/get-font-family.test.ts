import { getFontFamily } from './get-font-family';

describe('getFontFamily', () => {
  it('should return correct formatted fonts with and without extra fields', () => {
    expect(
      getFontFamily([
        {
          variables: [
            {
              name: 'title/900/font',
              type: 'STRING',
              scopes: ['FONT_FAMILY'],
              value: 'Inter',
            },
            {
              name: 'title/900/size',
              type: 'FLOAT',
              scopes: ['FONT_SIZE'],
              value: 24,
            },
            {
              name: 'title/900/line',
              type: 'FLOAT',
              scopes: ['LINE_HEIGHT'],
              value: 32,
            },
            {
              name: 'title/900/weight',
              type: 'FLOAT',
              scopes: ['FONT_WEIGHT'],
              value: 600,
            },
          ],
        },
        {
          variables: [
            {
              name: 'title/800/font',
              type: 'STRING',
              scopes: ['FONT_FAMILY'],
              value: 'Inter',
            },
            {
              name: 'title/800/size',
              type: 'FLOAT',
              scopes: ['FONT_SIZE'],
              value: 16,
            },
            {
              name: 'title/800/line',
              type: 'FLOAT',
              scopes: ['LINE_HEIGHT'],
              value: 24,
            },
            {
              name: 'title/800/weight',
              type: 'FLOAT',
              scopes: ['FONT_WEIGHT'],
              value: 500,
            },
          ],
        },
        {
          variables: [
            {
              name: 'title/700/font',
              type: 'STRING',
              scopes: ['FONT_FAMILY'],
              value: 'Roboto',
            },
            {
              name: 'title/700/size',
              type: 'FLOAT',
              scopes: ['FONT_SIZE'],
              value: 14,
            },
            {
              name: 'title/700/line',
              type: 'FLOAT',
              scopes: ['LINE_HEIGHT'],
              value: 24,
            },
            {
              name: 'title/700/weight',
              type: 'FLOAT',
              scopes: ['FONT_WEIGHT'],
              value: 400,
            },
          ],
        },
      ]),
    ).toEqual({
      fontFamily: { font1: 'Inter', font2: 'Roboto' },
      formattedFontFamilyWithAdditionalFonts: {
        font1: { title: "'Inter', Arial, sans-serif", comment: 'used weights: 500, 600' },
        font2: { title: "'Roboto', Arial, sans-serif", comment: 'used weights: 400' },
      },
    });
  });

  it('should return empty created fonts objects', () => {
    expect(getFontFamily([])).toEqual({
      fontFamily: {},
      formattedFontFamilyWithAdditionalFonts: {},
    });
  });
});
