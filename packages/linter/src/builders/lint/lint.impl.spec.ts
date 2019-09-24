import { of } from 'rxjs';
import { linterBuilderHandler, LinterBuilderOptions } from './lint.impl';

describe('LinterBuilderOptions', () => {
  let options: LinterBuilderOptions;
  let context;

  beforeEach(() => {
    context = {
      scheduleBuilder: jest
        .fn()
        .mockReturnValue(Promise.resolve({ output: of('done') }))
    };

    options = {
      linter: 'unknown',
      config: 'config.json',
      tsConfig: 'tsconfig.test.json',
      format: 'prose',
      exclude: ['ignore'],
      files: ['test.js'],
      fix: false
    };
  });

  it('should throw an error if linter is not recognised', () => {
    expect(() => linterBuilderHandler(options, context)).toThrow();
  });

  it('should pass the correct options to the tslint builder', () => {
    options.linter = 'tslint';
    linterBuilderHandler(options, context).subscribe();
    expect(context.scheduleBuilder).toHaveBeenCalledWith(
      '@angular-devkit/build-angular:tslint',
      {
        tslintConfig: 'config.json',
        tsConfig: 'tsconfig.test.json',
        format: 'prose',
        exclude: ['ignore'],
        files: ['test.js'],
        fix: false
      },
      expect.anything()
    );
  });

  it('should pass the correct options to the eslint builder', () => {
    options.linter = 'eslint';
    linterBuilderHandler(options, context).subscribe();
    expect(context.scheduleBuilder).toHaveBeenCalledWith(
      '@angular-eslint/builder:lint',
      {
        eslintConfig: 'config.json',
        tsConfig: 'tsconfig.test.json',
        exclude: ['ignore'],
        files: ['test.js'],
        fix: false
      },
      expect.anything()
    );
  });
});
