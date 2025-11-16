import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toSnakeCase } from '../../util/convert-case.util';
import { logConflictError, logCreated, logFailure } from '../../util/log-style.util';

export const generateEntity = (domainName: string): void => {
  const pascal = toPascalCase(domainName);
  const kebab = toKebabCase(domainName);
  const snake = toSnakeCase(domainName);

  const entityClassName = `${pascal}Entity`;
  const tableNameSnake = snake;

  const spinner = ora(`Generating for ${entityClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', kebab);
    const entityDir = path.join(moduleDir, 'infrastructure');

    fs.mkdirSync(entityDir, { recursive: true });

    const entityFilePath = path.join(entityDir, `${kebab}.entity.ts`);

    if (fs.existsSync(entityFilePath)) {
      throw logConflictError(entityClassName, path.relative(cwd, entityFilePath));
    }

    const templatePath = path.join(__dirname, '../../template/entity.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{tableNameSnake}}/g, tableNameSnake)
      .replace(/{{entityClassName}}/g, entityClassName);

    fs.writeFileSync(entityFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(entityClassName, path.relative(cwd, entityFilePath)));
  } catch (error: unknown) {
    if (typeof error === 'string') spinner.fail(error);
    else spinner.fail(logFailure(entityClassName));
    throw error;
  }
};
