import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toKebabCase, toPascalCase } from '../../util/convert-case.util';
import { logConflictError, logCreated, logFailure } from '../../util/log-style.util';

export const generateRootModule = (domainName: string): void => {
  const pascal = toPascalCase(domainName);
  const kebab = toKebabCase(domainName);

  const rootClassName = 'ApiModule';
  const domainNamePascal = pascal;
  const domainNameKebab = kebab;

  const spinner = ora(`Generating for ${rootClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api');

    fs.mkdirSync(moduleDir, { recursive: true });

    const moduleFilePath = path.join(moduleDir, 'api.module.ts');

    if (fs.existsSync(moduleFilePath)) {
      throw logConflictError(rootClassName, path.relative(cwd, moduleFilePath));
    }

    const templatePath = path.join(__dirname, '../../template/root-module.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{rootClassName}}/g, rootClassName);

    fs.writeFileSync(moduleFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(rootClassName, path.relative(cwd, moduleFilePath)));
  } catch (error: unknown) {
    if (typeof error === 'string') spinner.fail(error);
    else spinner.fail(logFailure(rootClassName));
    throw error;
  }
};
