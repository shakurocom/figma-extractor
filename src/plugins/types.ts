import { Core, FigmaData } from '../core';

export type Plugin = (core: Core, data: FigmaData) => Promise<void> | void;
