import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateFeatureModule = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);

  const featureModuleClassName = `${domainNamePascal}Module`;

  const spinner = ora(`Generating for ${featureModuleClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);

    fs.mkdirSync(moduleDir, { recursive: true });

    const moduleFilePath = path.join(moduleDir, `${domainNameKebab}.module.ts`);
    const relativePath = path.relative(cwd, moduleFilePath);

    if (fs.existsSync(moduleFilePath)) {
      spinner.info(logSkipped(featureModuleClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/feature-module.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template.replace(/{{featureModuleClassName}}/g, featureModuleClassName);

    fs.writeFileSync(moduleFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(featureModuleClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(featureModuleClassName));
    throw error;
  }
};
