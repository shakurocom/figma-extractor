import { addEslintDisableAtTheTopOfText } from './add-eslint-disable';

describe('addEslintDisableAtTheTopOfText', () => {
  it('should return content with all rules', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        {
          disabledMaxLines: true,
          disabledTypescriptNamingConvention: true,
        },
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
        {
          disabledMaxLines: true,
          disabledTypescriptNamingConvention: false,
        },
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
        {
          disabledMaxLines: false,
          disabledTypescriptNamingConvention: true,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should return content without any rules', () => {
    expect(
      addEslintDisableAtTheTopOfText(
        `any content
    any content
    and more content
    `,
        {
          disabledMaxLines: false,
          disabledTypescriptNamingConvention: false,
        },
      ),
    ).toMatchSnapshot();
  });
});
