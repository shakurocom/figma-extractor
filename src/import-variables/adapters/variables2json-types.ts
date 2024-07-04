interface Variables2JsonColorVariable {
  name: string;
  type: 'color';
  isAlias: false;
  value: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

interface Variables2JsonColorVariableAlias {
  name: string;
  type: 'color';
  isAlias: true;
  value: {
    collection: string;
    name: string;
  };
}

interface Variables2JsonNumberVariable {
  name: string;
  type: 'number';
  isAlias: false;
  value: number;
}

interface Variables2JsonNumberVariableAlias {
  name: string;
  type: 'number';
  isAlias: true;
  value: {
    collection: string;
    name: string;
  };
}

interface Variables2JsonMode {
  name: string;
  variables: Array<
    | Variables2JsonColorVariable
    | Variables2JsonColorVariableAlias
    | Variables2JsonNumberVariable
    | Variables2JsonNumberVariableAlias
  >;
}

interface Variables2JsonCollection {
  name: string;
  modes: Variables2JsonMode[];
}

export interface Variables2JsonData {
  version: string;
  collections: Variables2JsonCollection[];
}
