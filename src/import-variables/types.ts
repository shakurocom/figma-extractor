import type { FileNodesResponse, FullStyleMetadata } from 'figma-js';

export interface ImportVariablesAdapter {
  readonly data: unknown;
  get styleMetadata(): FullStyleMetadata[];
  get fileNodes(): FileNodesResponse;
}

export interface ImportVariablesValidatorData {
  validateData: () => Error | undefined;
}

export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
