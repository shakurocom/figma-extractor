import { addEslintDisableAtTheTopOfText } from './add-eslint-disable';

describe('addEslintDisableAtTheTopOfText', () => {
  it('should return content without any rules', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        [],
      ),
    ).toMatchSnapshot();
  });

  it('should return content with all rules', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        ['disable-max-lines', 'disable-typescript-naming-convention'],
      ),
    ).toMatchSnapshot();
  });

  it('should return content with only max-line rule', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        ['disable-max-lines'],
      ),
    ).toMatchSnapshot();
  });

  it('should return content with only naming-convention rule', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        ['disable-typescript-naming-convention'],
      ),
    ).toMatchSnapshot();
  });
});
