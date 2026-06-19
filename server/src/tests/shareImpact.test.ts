import { describe, it, expect } from 'vitest';
import { buildShareText } from '../../../utils/shareImpact';

describe('shareImpact — message personalization', () => {
  it('names the org and the amount when both are present', () => {
    const t = buildShareText({ donated: 2.4, nonprofitName: 'Stewpot Community Services' });
    expect(t).toContain('$2.4');
    expect(t).toContain('Stewpot Community Services');
    expect(t).not.toContain('undefined');
  });

  it('mentions donation total + savings when there is no org name', () => {
    const t = buildShareText({ donated: 120, saved: 45 });
    expect(t).toContain('$120');
    expect(t).toContain('$45');
  });

  it('falls back to a generic invite when there is no impact yet', () => {
    const t = buildShareText({});
    expect(t.toLowerCase()).toContain('good circles');
    expect(t).not.toContain('$');
  });
});
