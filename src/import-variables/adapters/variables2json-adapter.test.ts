/* eslint-disable @typescript-eslint/naming-convention */
import { Variables2JsonAdapter } from './variables2json-adapter';

describe('Variables2JsonAdapter', () => {
  it('should return correct styleMetadata', () => {
    const data = {
      version: '1.0',
      collections: [
        {
          name: 'Global',
          modes: [
            {
              name: 'General',
              variables: [
                {
                  name: 'color/brand/100',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 0,
                    g: 255,
                    b: 255,
                    a: 1,
                  },
                },
                {
                  name: 'color/brand/200',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 22,
                    g: 255,
                    b: 255,
                    a: 0.6,
                  },
                },
                {
                  name: 'color/brand/300',
                  type: 'color',
                  isAlias: true,
                  value: {
                    collection: 'Global',
                    name: 'color/brand/100',
                  },
                },
                {
                  name: 'spacing/zero',
                  type: 'number',
                  isAlias: false,
                  value: 0,
                },
                {
                  name: 'spacing/one',
                  type: 'number',
                  isAlias: false,
                  value: 1,
                },
                {
                  name: 'spacing/two',
                  type: 'number',
                  isAlias: true,
                  value: {
                    collection: 'Global',
                    name: 'spacing/one',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const instance = new Variables2JsonAdapter({ ...data, extraField: 'test' });

    expect(instance.styleMetadata).toEqual([
      {
        style_type: 'FILL',
        node_id: 'GlobalGeneralcolorcolor/brand/100',
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
        node_id: 'GlobalGeneralcolorcolor/brand/200',
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
        node_id: 'GlobalGeneralcolorcolor/brand/300',
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
        style_type: 'TEXT',
        node_id: 'GlobalGeneralnumberspacing/zero',
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
        style_type: 'TEXT',
        node_id: 'GlobalGeneralnumberspacing/one',
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
        style_type: 'TEXT',
        node_id: 'GlobalGeneralnumberspacing/two',
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
    ]);
  });

  it('should return empty styleMetadata', () => {
    const data = {
      version: '1.0',
      collections: [],
    };

    const instance = new Variables2JsonAdapter({ ...data, extraField: 'test' });

    expect(instance.styleMetadata).toEqual([]);
  });

  it('should return correct fileNodes', () => {
    const data = {
      version: '1.0',
      collections: [
        {
          name: 'Global',
          modes: [
            {
              name: 'General',
              variables: [
                {
                  name: 'color/brand/100',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 0,
                    g: 244,
                    b: 255,
                    a: 1,
                  },
                },
                {
                  name: 'color/brand/200',
                  type: 'color',
                  isAlias: false,
                  value: {
                    r: 22,
                    g: 200,
                    b: 255,
                    a: 0.6,
                  },
                },
                {
                  name: 'color/brand/300',
                  type: 'color',
                  isAlias: true,
                  value: {
                    collection: 'Global',
                    name: 'color/brand/100',
                  },
                },
                {
                  name: 'spacing/zero',
                  type: 'number',
                  isAlias: false,
                  value: 0,
                },
                {
                  name: 'spacing/one',
                  type: 'number',
                  isAlias: false,
                  value: 1,
                },
                {
                  name: 'spacing/two',
                  type: 'number',
                  isAlias: true,
                  value: {
                    collection: 'Theme',
                    name: 'spacing/1',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'Theme',
          modes: [
            {
              name: 'General',
              variables: [
                {
                  name: 'spacing/1',
                  type: 'number',
                  isAlias: false,
                  value: 8,
                },
              ],
            },
          ],
        },
      ],
    };

    const instance = new Variables2JsonAdapter({ ...data, extraField: 'test' });

    expect(instance.fileNodes).toEqual({
      nodes: {
        'GlobalGeneralcolorcolor/brand/100': {
          document: {
            id: 'GlobalGeneralcolorcolor/brand/100',
            name: 'color/brand/100',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                color: { r: 0, g: 0.96, b: 1, a: 1 },
                opacity: 1,
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
        'GlobalGeneralcolorcolor/brand/200': {
          document: {
            id: 'GlobalGeneralcolorcolor/brand/200',
            name: 'color/brand/200',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                color: { r: 0.09, g: 0.78, b: 1, a: 0.6 },
                opacity: 0.6,
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
        'GlobalGeneralcolorcolor/brand/300': {
          document: {
            id: 'GlobalGeneralcolorcolor/brand/300',
            name: 'color/brand/300',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                color: { r: 0, g: 0.96, b: 1, a: 1 },
                opacity: 1,
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
        'GlobalGeneralnumberspacing/zero': {
          document: {
            id: 'GlobalGeneralnumberspacing/zero',
            name: 'spacing/zero',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                value: 0,
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
        'GlobalGeneralnumberspacing/one': {
          document: {
            id: 'GlobalGeneralnumberspacing/one',
            name: 'spacing/one',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                value: 1,
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
        'GlobalGeneralnumberspacing/two': {
          document: {
            id: 'GlobalGeneralnumberspacing/two',
            name: 'spacing/two',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                value: 8,
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
        'ThemeGeneralnumberspacing/1': {
          document: {
            id: 'ThemeGeneralnumberspacing/1',
            name: 'spacing/1',
            type: 'RECTANGLE',
            blendMode: 'PASS_THROUGH',
            absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
            constraints: { vertical: 'TOP', horizontal: 'LEFT' },
            fills: [
              {
                type: 'SOLID',
                value: 8,
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
    });
  });
});
