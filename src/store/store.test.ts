import { describe, expect, it } from 'vitest';
import { useStore } from './index';

describe('store reset', () => {
  it('clears the profile and any running block when switching children', () => {
    useStore.getState().setupProfile('Raaga', 'drift', 'Mum');
    useStore.getState().beginBlock({ id: 'p', subjectId: 'history', type: 'learn', minutes: 25 }, false);
    useStore.getState().resetAll();
    expect(useStore.getState().profile).toBeUndefined();
    expect(useStore.getState().activeBlock).toBeUndefined();
  });
});
