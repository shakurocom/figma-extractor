import { launchPlugins } from './launcher';

describe('launchPlugins', () => {
  it('launches all existed plugins step-by-step', () => {
    const core: any = {
      plugins: [jest.fn(), jest.fn(), jest.fn()],
    };

    const data: any = {};

    launchPlugins(core, data).then(() => {
      expect(core.plugins[0]).toHaveBeenCalled();
      expect(core.plugins[0]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[1]).toHaveBeenCalled();
      expect(core.plugins[1]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[2]).toHaveBeenCalled();
      expect(core.plugins[2]).toHaveBeenCalledWith(core, data);
    });
  });

  it('launches all existed plugins step-by-step with waiting for their promises', () => {
    const core: any = {
      plugins: [
        jest.fn(() => Promise.resolve()),
        jest.fn(() => Promise.resolve()),
        jest.fn(() => Promise.resolve()),
      ],
    };

    const data: any = {};

    launchPlugins(core, data).then(() => {
      expect(core.plugins[0]).toHaveBeenCalled();
      expect(core.plugins[0]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[1]).toHaveBeenCalled();
      expect(core.plugins[1]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[2]).toHaveBeenCalled();
      expect(core.plugins[2]).toHaveBeenCalledWith(core, data);
    });
  });

  it('need to add checking of undefined', () => {
    const core: any = {
      plugins: [jest.fn(() => Promise.resolve()), jest.fn(), undefined],
    };

    const data: any = {};

    launchPlugins(core, data).then(() => {
      expect(core.plugins[0]).toHaveBeenCalled();
      expect(core.plugins[0]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[1]).toHaveBeenCalled();
      expect(core.plugins[1]).toHaveBeenCalledWith(core, data);
      expect(core.plugins[2]).toBeUndefined;
    });
  });
});
