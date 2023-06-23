const maxLineRuleComment = '/* eslint-disable max-lines */';

const namingConventionRuleComment = '/* eslint-disable @typescript-eslint/naming-convention */';

export const addEslintDisableAtTheTopOfText = (
  content: string,
  options: {
    disabledMaxLines: boolean;
    disabledTypescriptNamingConvention: boolean;
  },
) => {
  return `
    ${options.disabledMaxLines ? maxLineRuleComment : ''}
    ${options.disabledTypescriptNamingConvention ? namingConventionRuleComment : ''}
    ${content}
    `;
};
