import { describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  it('exposes a title signal with the default app name', () => {
    const app = new App();

    expect(app['title']()).toBe('angular-base-project');
  });
});
