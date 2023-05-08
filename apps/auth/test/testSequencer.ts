// eslint-disable-next-line
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const fileOrders = ['test/init.e2e-spec.ts'];

    return Array.from(tests).sort((testA, testB) => {
      // eslint-disable-next-line
      const pathA = testA.path.replace(`${process.cwd()}/`, '');
      // eslint-disable-next-line
      const pathB = testB.path.replace(`${process.cwd()}/`, '');

      const indexA = fileOrders.indexOf(pathA) >= 0 ? fileOrders.indexOf(pathA) : 999;
      const indexB = fileOrders.indexOf(pathB) >= 0 ? fileOrders.indexOf(pathB) : 999;
      return indexA > indexB ? 1 : -1;
    });
  }
}

module.exports = CustomSequencer;
