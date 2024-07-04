/* eslint-disable @typescript-eslint/naming-convention */
import type { FileNodesResponse, FullStyleMetadata } from 'figma-js';

import { formattedColor } from './color/formatted-color/formatted-color';
import { getColorStyles } from './get-color-styles';

jest.mock('./color/formatted-color/formatted-color', () => {
  return {
    formattedColor: jest.fn(() => 'formatted color'),
  };
});

describe('getColorStyles', () => {
  it('should return formatted color for a valid figma data', () => {
    const metaColors: FullStyleMetadata[] = [
      {
        style_type: 'FILL',
        node_id: '1',
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
      },
      {
        style_type: 'FILL',
        node_id: '2',
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
      },
      {
        style_type: 'FILL',
        node_id: '3',
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
      },
    ];

    const fileNodes: FileNodesResponse = {
      nodes: {
        '1': {
          document: {
            id: '1',
            name: 'color/brand/100',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'GRADIENT_DIAMOND',
                blendMode: 'NORMAL',
              },
            ],
            strokes: [],
            strokeWeight: 1,
            strokeAlign: 'INSIDE',
            effects: [],
          },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
        '2': {
          document: {
            id: '2',
            name: 'color/brand/200',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                color: { r: 0.3, g: 0.3, b: 0.4, a: 0.1 },
                opacity: 0.1,
                blendMode: 'NORMAL',
              },
            ],
            strokes: [],
            strokeWeight: 1,
            strokeAlign: 'INSIDE',
            effects: [],
          },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
        '3': {
          document: {
            id: '3',
            name: 'color/brand/300',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                color: { r: 0.4, g: 0.4, b: 0.4, a: 1 },
                blendMode: 'NORMAL',
              },
            ],
            strokes: [],
            strokeWeight: 1,
            strokeAlign: 'INSIDE',
            effects: [],
          },
          components: {},
          schemaVersion: 0,
          styles: {},
        },
      },
      lastModified: '',
      name: '',
      role: 'viewer',
      thumbnailUrl: '',
      version: '',
    };

    const keyNameCallback = jest.fn(name => name);

    const res = getColorStyles(metaColors, fileNodes, keyNameCallback);

    expect(res).toEqual({
      'color/brand/200': 'formatted color',
      'color/brand/300': 'formatted color',
    });

    expect(keyNameCallback).toHaveBeenCalledTimes(2);
    expect(keyNameCallback).toHaveBeenNthCalledWith(1, 'color/brand/200');
    expect(keyNameCallback).toHaveBeenNthCalledWith(2, 'color/brand/300');

    expect(formattedColor).toHaveBeenCalledTimes(2);
    expect(formattedColor).toHaveBeenNthCalledWith(1, { r: 0.3, g: 0.3, b: 0.4, a: 0.1 }, 0.1);
    expect(formattedColor).toHaveBeenNthCalledWith(2, { r: 0.4, g: 0.4, b: 0.4, a: 1 }, undefined);
  });
});
