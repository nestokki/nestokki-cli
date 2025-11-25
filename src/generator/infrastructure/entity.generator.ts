import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toSnakeCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';
import { updateFeatureModule } from '../module/feature-module.updater';

export const generateEntity = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameSnake = toSnakeCase(domainName);

  const entityClassName = `${domainNamePascal}Entity`;

  const spinner = ora(`Generating for ${entityClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const entityDir = path.join(moduleDir, 'infrastructure');

    fs.mkdirSync(entityDir, { recursive: true });

    const entityFilePath = path.join(entityDir, `${domainNameKebab}.entity.ts`);
    const relativePath = path.relative(cwd, entityFilePath);

    if (fs.existsSync(entityFilePath)) {
      spinner.info(logSkipped(entityClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/entity.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{entityClassName}}/g, entityClassName)
      .replace(/{{domainNameSnake}}/g, domainNameSnake);

    fs.writeFileSync(entityFilePath, content, { encoding: 'utf8' });

    updateFeatureModule(domainName, { addEntity: true });

    spinner.succeed(logCreated(entityClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(entityClassName));
    throw error;
  }
};
