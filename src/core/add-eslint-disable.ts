const maxLineRuleComment = '/* eslint-disable max-lines */';

const namingConventionRuleComment = '/* eslint-disable @typescript-eslint/naming-convention */';

export const addEslintDisableAtTheTopOfText = (
  content: string,
  rules: Array<'disable-max-lines' | 'disable-typescript-naming-convention'>,
) => {
  return `
    ${rules.includes('disable-max-lines') ? maxLineRuleComment : ''}
    ${rules.includes('disable-typescript-naming-convention') ? namingConventionRuleComment : ''}
    ${content}
    `;
};
