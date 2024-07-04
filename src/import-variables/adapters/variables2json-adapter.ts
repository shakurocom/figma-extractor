/* eslint-disable @typescript-eslint/naming-convention */
import type { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import type { DeepWriteable, ImportVariablesAdapter, ImportVariablesValidatorData } from '../types';
import type { Variables2JsonData } from './variables2json-types';
import { variables2JsonZodValidator } from './variables2json-zod-validator';

const isCorrectData = (data: unknown): data is Variables2JsonData => {
  return !!data;
};

type RealVariables = Exclude<
  Variables2JsonData['collections'][0]['modes'][0]['variables'][0],
  { isAlias: true }
>;

const resolveVariable = (
  variable: Variables2JsonData['collections'][0]['modes'][0]['variables'][0],
  mode: Variables2JsonData['collections'][0]['modes'][0]['name'],
  data: Variables2JsonData,
): RealVariables => {
  if (variable.isAlias) {
    const foundCollection = data.collections.find(
      collection => collection.name === variable.value.collection,
    );

    if (!foundCollection) {
      throw new Error(
        `Alias collection not found. Collection: ${variable.value.collection}, alias name: ${variable.value.name}, mode: ${mode}`,
      );
    }

    const foundMode = foundCollection.modes.find(item => item.name === mode);
    if (!foundMode) {
      throw new Error(
        `the mode of alias collection not found. Collection: ${variable.value.collection}, alias name: ${variable.value.name}, mode: ${mode}`,
      );
    }

    const foundVariable = foundMode.variables.find(item => item.name === variable.value.name);
    if (!foundVariable) {
      throw new Error(
        `the mode of alias collection not found. Collection: ${variable.value.collection}, alias name: ${variable.value.name}, mode: ${mode}`,
      );
    }

    return resolveVariable(foundVariable, mode, data);
  }

  return variable;
};

const getFigmaColor = (value: number) => Math.round((value * 100) / 255) / 100;

const getFill = (variable: RealVariables) => {
  switch (variable.type) {
    case 'color':
      return {
        type: 'SOLID',
        color: {
          r: getFigmaColor(variable.value.r),
          g: getFigmaColor(variable.value.g),
          b: getFigmaColor(variable.value.b),
          a: variable.value.a,
        },
        opacity: variable.value.a,
        blendMode: 'NORMAL',
      } as const;
    case 'number':
      return {
        type: 'SOLID',
        value: variable.value,
        blendMode: 'NORMAL',
      } as const;
  }
};

export class Variables2JsonAdapter implements ImportVariablesAdapter, ImportVariablesValidatorData {
  constructor(readonly data: unknown) {}

  validateData = () => {
    try {
      variables2JsonZodValidator(this.data);
    } catch (e: any) {
      return e as Error;
    }

    return undefined;
  };

  get styleMetadata(): FullStyleMetadata[] {
    const result: FullStyleMetadata[] = [];

    if (isCorrectData(this.data)) {
      for (let colIndex = 0; colIndex < this.data.collections.length; colIndex++) {
        const collection = this.data.collections[colIndex];
        for (let modeIndex = 0; modeIndex < collection.modes.length; modeIndex++) {
          const mode = collection.modes[modeIndex];
          for (let varIndex = 0; varIndex < mode.variables.length; varIndex++) {
            const variable = mode.variables[varIndex];
            const node_id = collection.name + mode.name + variable.type + variable.name;
            result.push({
              style_type: 'FILL',
              node_id,
              sort_position: '',
              file_key: '',
              thumbnail_url: '',
              created_at: '',
              updated_at: '',
              user: {
                id: '',
                handle: '',
                img_url: '',
              },
              key: '',
              name: '',
              description: '',
            });
          }
        }
      }
    }

    return result;
  }
  get fileNodes(): FileNodesResponse {
    const result: DeepWriteable<FileNodesResponse> = {
      nodes: {},
      lastModified: '',
      name: '',
      role: 'viewer',
      thumbnailUrl: '',
      version: '',
    };

    if (isCorrectData(this.data)) {
      for (const {
        variables: originalVariable,
        modeName,
        collectionName,
      } of this.getVariableGenerator(this.data.collections)) {
        const id = collectionName + modeName + originalVariable.type + originalVariable.name;

        const variable = resolveVariable(originalVariable, modeName, this.data);

        const fill = getFill(variable);

        result.nodes[id] = {
          document: {
            id,
            name: originalVariable.name,
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [fill],
            strokes: [],
            strokeWeight: 1,
            strokeAlign: 'INSIDE',
            effects: [],
          },
          components: {},
          schemaVersion: 0,
          styles: {},
        };
      }
    }

    return result;
  }

  *getVariableGenerator(collections: Variables2JsonData['collections']) {
    for (let colIndex = 0; colIndex < collections.length; colIndex++) {
      const collection = collections[colIndex];
      for (let modeIndex = 0; modeIndex < collection.modes.length; modeIndex++) {
        const mode = collection.modes[modeIndex];
        for (let varIndex = 0; varIndex < mode.variables.length; varIndex++) {
          yield {
            variables: mode.variables[varIndex],
            modeName: mode.name,
            collectionName: collection.name,
          };
        }
      }
    }
  }
}
