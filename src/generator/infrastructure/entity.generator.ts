import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toSnakeCase, toCamelCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateEntity = (domainName: string): void => {
  const pascal = toPascalCase(domainName);
  const kebab = toKebabCase(domainName);
  const snake = toSnakeCase(domainName);
  const camel = toCamelCase(domainName);

  const entityClassName = `${pascal}Entity`;
  const domainNameSnake = snake;
  const domainNameCamel = camel;

  const spinner = ora(`Generating for ${entityClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', kebab);
    const entityDir = path.join(moduleDir, 'infrastructure');

    fs.mkdirSync(entityDir, { recursive: true });

    const entityFilePath = path.join(entityDir, `${kebab}.entity.ts`);

    if (fs.existsSync(entityFilePath)) {
      spinner.info(logSkipped(entityClassName, path.relative(cwd, entityFilePath)));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/entity.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{domainNameSnake}}/g, domainNameSnake)
      .replace(/{{domainNameCamel}}/g, domainNameCamel)
      .replace(/{{entityClassName}}/g, entityClassName);

    fs.writeFileSync(entityFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(entityClassName, path.relative(cwd, entityFilePath)));
  } catch (error: unknown) {
    spinner.fail(logFailure(entityClassName));
    throw error;
  }
};
