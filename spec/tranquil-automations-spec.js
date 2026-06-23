import TranquilAutomations from '../lib/tranquil-automations';

describe('TranquilAutomations', () => {
  let workspaceElement;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    waitsForPromise(() => atom.packages.activatePackage('tranquil-automations'));
  });

  it('activates without error', () => {
    expect(atom.packages.isPackageActive('tranquil-automations')).toBe(true);
  });

  it('provides the tranquil-automations service', () => {
    const service = TranquilAutomations.provideAutomations();
    expect(service).toBeDefined();
    expect(service.githubUrls).toBeDefined();
  });
});
