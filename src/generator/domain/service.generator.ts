import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase, toWords } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateService = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);
  const domainNameWords = toWords(domainName);

  const serviceClassName = `${domainNamePascal}Service`;

  const spinner = ora(`Generating for ${serviceClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const serviceDir = path.join(moduleDir, 'domain');

    fs.mkdirSync(serviceDir, { recursive: true });

    const domainFilePath = path.join(serviceDir, `${domainNameKebab}.service.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(serviceClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/service.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{serviceClassName}}/g, serviceClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{domainNameCamel}}/g, domainNameCamel)
      .replace(/{{domainNameWords}}/g, domainNameWords);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(serviceClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(serviceClassName));
    throw error;
  }
};
