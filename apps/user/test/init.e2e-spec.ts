import { TestHelper } from '@incognito/toolkit/dist/testHelper';

describe('[Auth] Clean up', () => {
  it('should clean up test data', () => {
    new TestHelper().cleanup();
  });
});
