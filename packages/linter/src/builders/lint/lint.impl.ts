import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { Logger } from '@angular-devkit/core/src/logger';
import { from, Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

type LinterFormat =
  | 'checkStyle'
  | 'codeFrame'
  | 'filesList'
  | 'json'
  | 'junit'
  | 'msbuild'
  | 'pmd'
  | 'prose'
  | 'stylish'
  | 'tap'
  | 'verbose'
  | 'vso';

export interface LinterBuilderOptions extends JsonObject {
  linter: string;
  config?: string;
  tsConfig?: string;
  format?: LinterFormat;
  exclude?: string[];
  files?: string[];
  fix?: boolean;
}

export function linterBuilderHandler(
  options: LinterBuilderOptions,
  context: BuilderContext
): Observable<BuilderOutput> {
  if (options.linter === 'tslint') {
    const tslintOptions: any = { ...options, tslintConfig: options.config };
    delete tslintOptions.linter;
    delete tslintOptions.config;
    return from(
      context.scheduleBuilder(
        '@angular-devkit/build-angular:tslint',
        tslintOptions,
        {
          logger: context.logger as Logger
        }
      )
    ).pipe(
      tap(r => console.log(r)),
      concatMap(r => {
        return r.output;
      })
    );
  }

  if (options.linter === 'eslint') {
    const eslintOptions: any = { ...options, eslintConfig: options.config };
    delete eslintOptions.linter;
    delete eslintOptions.config;
    delete eslintOptions.format; // Use whatever the default formatter is
    return from(
      context.scheduleBuilder('@angular-eslint/builder:lint', eslintOptions, {
        logger: context.logger as Logger
      })
    ).pipe(concatMap(r => r.output));
  }

  throw new Error(
    `"${
      options.linter
    }" is not a supported linter option: use either eslint or tslint`
  );
}

export default createBuilder<LinterBuilderOptions>(linterBuilderHandler);
