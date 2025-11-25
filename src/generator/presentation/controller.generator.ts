import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase, pluralize } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';
import { updateFeatureModule } from '../module/feature-module.updater';

export const generateController = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);
  const domainNamePluralKebab = pluralize(toKebabCase(domainName));

  const controllerClassName = `${domainNamePascal}Controller`;

  const spinner = ora(`Generating for ${controllerClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const controllerDir = path.join(moduleDir, 'presentation');

    fs.mkdirSync(controllerDir, { recursive: true });

    const domainFilePath = path.join(controllerDir, `${domainNameKebab}.controller.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(controllerClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/controller.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{controllerClassName}}/g, controllerClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{domainNameCamel}}/g, domainNameCamel)
      .replace(/{{domainNamePluralKebab}}/g, domainNamePluralKebab);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    updateFeatureModule(domainName, { addController: true });

    spinner.succeed(logCreated(controllerClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(controllerClassName));
    throw error;
  }
};
