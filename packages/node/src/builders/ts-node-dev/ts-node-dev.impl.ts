import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { JsonObject, terminal } from '@angular-devkit/core';
import { Logger } from '@angular-devkit/core/src/logger';
import * as fs from 'fs';
import { from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export const enum InspectType {
  None = 'none',
  Inspect = 'inspect',
  InspectBrk = 'inspect-brk'
}

export interface TsNodeDevBuilderOptions extends JsonObject {
  main: string;
  tsConfig: string;
  preferTs: boolean;
  ignoreWatch: string[];
  debug: boolean;
  interval: number;
  debounce: boolean;
  clear: boolean;
  watch: string[];
  inspect: InspectType;
  host: string;
  port: number;
  args: string[];
}

export default createBuilder<TsNodeDevBuilderOptions>(tsNodeDevBuilderHandler);

export function tsNodeDevBuilderHandler(
  options: TsNodeDevBuilderOptions,
  context: BuilderContext
): Observable<BuilderOutput> {
  // TODO : This feels brittle - is there a better way?
  //        Also, what about a global installation?
  //        What about npx?
  const tsNodeDevBin = './node_modules/ts-node-dev/bin/ts-node-dev';

  context.reportStatus('Checking dependencies...');

  if (!fs.existsSync(tsNodeDevBin)) {
    const error = `Error: Unable to find local dependency: ts-node-dev`;

    context.logger.error(error);
    context.logger.info(
      `Try adding this to your workspace with ${terminal.green(
        'npm i -D ts-node-dev'
      )} or ${terminal.green('yarn add -D ts-node-dev')}`
    );
    return of({
      success: false,
      error
    });
  }

  try {
    require('tsconfig-paths');
  } catch {
    const error = `Error: Unable to find dependency: tsconfig-paths`;

    context.logger.error(error);
    context.logger.info(
      `Try adding this to your workspace with ${terminal.green(
        'npm i -D tsconfig-paths'
      )} or ${terminal.green('yarn add -D tsconfig-paths')}`
    );
    return of({
      success: false,
      error
    });
  }

  context.reportStatus('Executing ts-node-dev...');

  const args = getArgs(options);

  const command = `${tsNodeDevBin} ${args.join(' ')}`;

  return from(
    context.scheduleBuilder(
      '@nrwl/workspace:run-commands',
      {
        commands: [{ command }]
      },
      {
        logger: context.logger as Logger
      }
    )
  ).pipe(concatMap(run => run.result));
}

function getArgs(options: TsNodeDevBuilderOptions) {
  const args = ['-r', 'tsconfig-paths/register'];

  if (options.preferTs) {
    args.push('--prefer-ts', 'true');
  }
  if (options.ignoreWatch && options.ignoreWatch.length > 0) {
    args.push('--ignore-watch', options.ignoreWatch.join(','));
  }
  if (options.debug) {
    args.push('--debug');
  }
  if (options.interval) {
    args.push('--interval', options.interval.toString());
  }
  if (options.debounce) {
    args.push('--debounce', options.debounce.toString());
  }
  if (options.clear) {
    args.push('--clear');
  }
  if (options.watch && options.watch.length > 0) {
    args.push('--watch', options.watch.join(','));
  }
  if (options.inspect !== InspectType.None) {
    args.push(`--${options.inspect}=${options.host}:${options.port}`);
  }
  args.push('--project', options.tsConfig);
  if (options.args && options.args.length > 0) {
    args.push(...options.args);
  }
  args.push(options.main);

  return args;
}
