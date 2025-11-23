import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateRepository = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);

  const repositoryClassName = `${domainNamePascal}Repository`;

  const spinner = ora(`Generating for ${repositoryClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const repositoryDir = path.join(moduleDir, 'infrastructure');

    fs.mkdirSync(repositoryDir, { recursive: true });

    const domainFilePath = path.join(repositoryDir, `${domainNameKebab}.repository.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(repositoryClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/repository.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{repositoryClassName}}/g, repositoryClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{domainNameCamel}}/g, domainNameCamel);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(repositoryClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(repositoryClassName));
    throw error;
  }
};
