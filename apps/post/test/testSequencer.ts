/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const fileOrders = [
      'test/init.e2e-spec.ts',

      'test/user/account.e2e-spec.ts',

      'test/verse/verse.e2e-spec.ts',
      'test/verse/verse-membership.e2e-spec.ts',
      'test/verse/board.e2e-spec.ts'
    ];

    return Array.from(tests).sort((testA, testB) => {
      // @ts-ignore
      const pathA = testA.path.replace(`${process.cwd()}/`, '');
      // @ts-ignore
      const pathB = testB.path.replace(`${process.cwd()}/`, '');

      const indexA = fileOrders.indexOf(pathA) >= 0 ? fileOrders.indexOf(pathA) : 999;
      const indexB = fileOrders.indexOf(pathB) >= 0 ? fileOrders.indexOf(pathB) : 999;
      return indexA > indexB ? 1 : -1;
    });
  }
}

module.exports = CustomSequencer;
