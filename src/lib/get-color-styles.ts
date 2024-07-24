import { Mode, RGBA } from '@/types';

import { formattedColor } from './formatted-color';

export const getColorStyles = (modes: Mode[], keyNameCallback: (name?: string) => string) => {
  const colors = modes.reduce((acc, item) => {
    const variables = item.variables.reduce((accVariables, variable) => {
      return {
        ...accVariables,
        [keyNameCallback(`${item.name}/${variable.name}`)]: formattedColor(variable.value as RGBA),
      };
    }, {});

    return {
      ...acc,
      ...variables,
    };
  }, {});

  return colors as Record<string, string>;
};
