import { getMockContext, MockBuilderContext } from '../../utils/testing';
import { InspectType, TsNodeDevBuilderOptions } from './ts-node-dev.impl';

describe('TsNodeDevBuilderOptions', () => {
  let options: TsNodeDevBuilderOptions;
  let context: MockBuilderContext;
  let tsNodeDev: jest.Mock<any>;

  beforeEach(async () => {
    jest.resetModules();

    tsNodeDev = jest.fn();
    tsNodeDev.mockReturnValue(Promise.resolve({}));
    jest.doMock('ts-node-dev', () => tsNodeDev);

    context = await getMockContext();
    context.addTarget(
      {
        project: 'nodeapp',
        target: 'build'
      },
      '@nrwl/node:ts-node-dev'
    );

    options = {
      main: 'main.ts',
      tsConfig: './tsconfig.app.json',
      preferTs: false,
      ignoreWatch: [],
      debug: false,
      interval: 0,
      debounce: false,
      clear: false,
      watch: [],
      inspect: InspectType.Inspect,
      port: 9229,
      host: 'localhost',
      args: []
    };
  });
});
