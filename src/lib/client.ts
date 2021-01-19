import { Client as FigmaClient } from 'figma-js';

export const getClient = (personalAccessToken: string) => FigmaClient({ personalAccessToken });
