import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';
import { updateFeatureModule } from '../module/feature-module.updater';

export const generateUseCase = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);

  const useCaseClassName = `${domainNamePascal}UseCase`;

  const spinner = ora(`Generating for ${useCaseClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const useCaseDir = path.join(moduleDir, 'application');

    fs.mkdirSync(useCaseDir, { recursive: true });

    const domainFilePath = path.join(useCaseDir, `find-${domainNameKebab}.use-case.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(useCaseClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/use-case.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{useCaseClassName}}/g, useCaseClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{domainNameCamel}}/g, domainNameCamel);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    updateFeatureModule(domainName, { addUseCase: true });

    spinner.succeed(logCreated(useCaseClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(useCaseClassName));
    throw error;
  }
};
