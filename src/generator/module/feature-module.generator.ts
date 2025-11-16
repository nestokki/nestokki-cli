import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toSnakeCase } from '../../util/convert-case.util';
import { logConflictError, logCreated, logFailure } from '../../util/log-style.util';

export const generateFeatureModule = (domainName: string): void => {
  const spinner = ora(`Generating for ${domainName}...\n`).start();

  const pascal = toPascalCase(domainName);
  const kebab = toKebabCase(domainName);

  const domainClassName = `${pascal}Module`;
  const domainNamePascal = pascal;
  const domainNameKebab = kebab;

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', kebab);

    fs.mkdirSync(moduleDir, { recursive: true });

    const moduleFilePath = path.join(moduleDir, `${kebab}.module.ts`);

    if (fs.existsSync(moduleFilePath)) {
      throw logConflictError(domainClassName, path.relative(cwd, moduleFilePath));
    }

    const templatePath = path.join(__dirname, '../../template/feature-module.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{domainClassName}}/g, domainClassName);

    fs.writeFileSync(moduleFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(domainClassName, path.relative(cwd, moduleFilePath)));
  } catch (error: unknown) {
    if (typeof error === 'string') spinner.fail(error);
    else spinner.fail(logFailure(domainClassName));
    throw error;
  }
};
