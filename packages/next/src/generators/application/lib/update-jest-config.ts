import { NormalizedSchema } from './normalize-options';
import { Tree } from '@nrwl/devkit';
import { updateBabelJestConfig } from '@nrwl/react/src/rules/update-babel-jest-config';

export function updateJestConfig(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    return;
  }

  const configPath = `${options.appProjectRoot}/jest.config.js`;
  const originalContent = host.read(configPath).toString();
  const content = originalContent.replace(
    'transform: {',
    "transform: {\n    '^(?!.*\\\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',"
  );
  host.write(configPath, content);

  updateBabelJestConfig(host, options.appProjectRoot, (json) => {
    if (options.style === 'styled-jsx') {
      json.plugins = (json.plugins || []).concat('styled-jsx/babel');
    }
    return json;
  });
}
