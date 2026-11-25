/* eslint-disable @typescript-eslint/naming-convention */
import { Config, Mode, ShadowLayersMode, Variable } from '@/types';

import { getEffectStyles } from '.';

const color = (a: number) => ({ r: 0, g: 0, b: 0, a });

const float = (name: string, value: number): Variable => ({
  name,
  type: 'FLOAT',
  scopes: ['ALL_SCOPES'],
  value,
});

const colorVar = (name: string, a: number): Variable => ({
  name,
  type: 'COLOR',
  scopes: ['EFFECT_COLOR'],
  value: color(a),
});

const shadowVars = (prefix: string, [x, y, blur, spread]: number[], a: number, suffix = '') => [
  float(`${prefix}/x${suffix}`, x),
  float(`${prefix}/y${suffix}`, y),
  float(`${prefix}/blur${suffix}`, blur),
  float(`${prefix}/spread${suffix}`, spread),
  colorVar(`${prefix}/color${suffix}`, a),
];

const modes = (variables: Variable[]): Mode[] => [{ name: 'light', modeId: '1', variables }];

const config = (shadowLayers?: ShadowLayersMode) =>
  ({ styles: { effects: { collectionNames: ['effects'], shadowLayers } } }) as Config;

describe('getEffectStyles', () => {
  it('should create a single shadow', () => {
    expect(
      getEffectStyles(modes(shadowVars('shadow/dp100', [0, 8, 20, 0], 0.12)), config()),
    ).toEqual({ 'light/shadow-dp100': '0px 8px 20px 0px rgba(0, 0, 0, 0.12)' });
  });

  it('should treat a numeric segment right after the effect type as a shadow name', () => {
    expect(
      getEffectStyles(modes(shadowVars('shadow/600', [0, 40, 104, -8], 0.1)), config()),
    ).toEqual({ 'light/shadow-600': '0px 40px 104px -8px rgba(0, 0, 0, 0.10)' });
  });

  it('should merge layers from numbered segments ("shadow/m-600/1/x")', () => {
    const variables = [
      ...shadowVars('shadow/m-600/1', [-32, -3, 54, 0], 0.03),
      ...shadowVars('shadow/m-600/2', [1, 2.5, 8, 0], 0.02),
    ];

    expect(getEffectStyles(modes(variables), config('merge'))).toEqual({
      'light/shadow-m-600':
        '-32px -3px 54px 0px rgba(0, 0, 0, 0.03), 1px 2.5px 8px 0px rgba(0, 0, 0, 0.02)',
    });
  });

  it('should merge layers from numbered properties ("shadow/dp75/x_1")', () => {
    const variables = [
      ...shadowVars('shadow/chart/dp75', [0, 0, 0.5, 0], 0.32, '_1'),
      ...shadowVars('shadow/chart/dp75', [0, 3, 6, 0], 0.1, '_2'),
    ];

    expect(getEffectStyles(modes(variables), config('merge'))).toEqual({
      'light/shadow-chart-dp75':
        '0px 0px 0.5px 0px rgba(0, 0, 0, 0.32), 0px 3px 6px 0px rgba(0, 0, 0, 0.10)',
    });
  });

  it('should sort layers numerically', () => {
    const variables = [
      ...shadowVars('shadow/big/10', [10, 10, 10, 0], 0.1),
      ...shadowVars('shadow/big/2', [2, 2, 2, 0], 0.2),
    ];

    expect(getEffectStyles(modes(variables), config('merge'))).toEqual({
      'light/shadow-big':
        '2px 2px 2px 0px rgba(0, 0, 0, 0.20), 10px 10px 10px 0px rgba(0, 0, 0, 0.10)',
    });
  });

  it('should create only per-layer shadows in "split" mode', () => {
    const variables = [
      ...shadowVars('shadow/m-700/1', [22, 22, 80, 0], 0.15),
      ...shadowVars('shadow/m-700/2', [2, 5, 10, 0], 0.06),
    ];

    expect(getEffectStyles(modes(variables), config('split'))).toEqual({
      'light/shadow-m-700-1': '22px 22px 80px 0px rgba(0, 0, 0, 0.15)',
      'light/shadow-m-700-2': '2px 5px 10px 0px rgba(0, 0, 0, 0.06)',
    });
  });

  it('should create merged and per-layer shadows by default', () => {
    const variables = [
      ...shadowVars('shadow/m-700/1', [22, 22, 80, 0], 0.15),
      ...shadowVars('shadow/m-700/2', [2, 5, 10, 0], 0.06),
    ];

    expect(getEffectStyles(modes(variables), config())).toEqual({
      'light/shadow-m-700':
        '22px 22px 80px 0px rgba(0, 0, 0, 0.15), 2px 5px 10px 0px rgba(0, 0, 0, 0.06)',
      'light/shadow-m-700-1': '22px 22px 80px 0px rgba(0, 0, 0, 0.15)',
      'light/shadow-m-700-2': '2px 5px 10px 0px rgba(0, 0, 0, 0.06)',
    });
  });

  it('should use 0 for missing numeric properties', () => {
    const variables = [float('shadow/ring/y', 2), colorVar('shadow/ring/color', 0.5)];

    expect(getEffectStyles(modes(variables), config())).toEqual({
      'light/shadow-ring': '0px 2px 0px 0px rgba(0, 0, 0, 0.50)',
    });
  });

  it('should throw when a shadow layer has no color', () => {
    expect(() => getEffectStyles(modes([float('shadow/m-100/1/x', 0)]), config())).toThrow(
      'Shadow "shadow-m-100-1" has no color variable',
    );
  });

  it('should throw when a shadow mixes plain properties and numbered layers', () => {
    const variables = [
      ...shadowVars('shadow/m-100', [0, 2, 6, 0], 0.06),
      ...shadowVars('shadow/m-100/1', [0, 2, 6, 0], 0.06),
    ];

    expect(() => getEffectStyles(modes(variables), config())).toThrow(
      'Shadow "shadow-m-100" mixes numbered layers and plain properties',
    );
  });

  it('should throw when a merged shadow name collides with another shadow', () => {
    const variables = [
      ...shadowVars('shadow/m-100-1', [0, 2, 6, 0], 0.06),
      ...shadowVars('shadow/m-100/1', [0, 2, 6, 0], 0.06),
    ];

    expect(() => getEffectStyles(modes(variables), config())).toThrow(
      'Effect name "light/shadow-m-100-1" is generated twice in "light" mode',
    );
  });

  it('should warn about unknown shadow properties and skip them', () => {
    const log = jest.fn();
    const variables = [
      ...shadowVars('shadow/dp100', [0, 8, 20, 0], 0.12),
      float('shadow/dp100/opacity', 1),
    ];

    expect(getEffectStyles(modes(variables), config(), log)).toEqual({
      'light/shadow-dp100': '0px 8px 20px 0px rgba(0, 0, 0, 0.12)',
    });
    expect(log).toHaveBeenCalledWith(
      '[warn:effects-theme] >>> ',
      expect.stringContaining('shadow/dp100/opacity'),
    );
  });

  it('should keep blur and backdrop-blur values divided by 2', () => {
    const variables = [float('blur/100', 16), float('backdrop-blur/200', 40)];

    expect(getEffectStyles(modes(variables), config())).toEqual({
      'light/blur-100': '8px',
      'light/backdrop-blur-200': '20px',
    });
  });
});
