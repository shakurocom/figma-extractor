import { formattedColor } from './formatted-color';

describe('formattedColor', () => {
  it('should return rgba color format with defined opacity', () => {
    const res = formattedColor({ a: 0.5, r: 0.3, g: 0.45, b: 0 }, 0.3);

    expect(res).toBe('rgba(76, 114, 0, 0.30)');
  });

  it('should return rgba color format with opacity = 0', () => {
    const res = formattedColor({ a: 0.5, r: 0.3, g: 0.45, b: 0 }, 0);

    expect(res).toBe('rgba(76, 114, 0, 0.00)');
  });

  it('should return hex color format when opacity is not defined', () => {
    const res = formattedColor({ a: 0.5, r: 0.3, g: 0.45, b: 0 });

    expect(res).toBe('#4c7200');
  });
});
