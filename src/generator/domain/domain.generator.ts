import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateDomain = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);

  const domainClassName = `${domainNamePascal}Domain`;

  const spinner = ora(`Generating for ${domainClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const domainDir = path.join(moduleDir, 'domain', 'model');

    fs.mkdirSync(domainDir, { recursive: true });

    const domainFilePath = path.join(domainDir, `${domainNameKebab}.domain.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(domainClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/domain.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{domainClassName}}/g, domainClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(domainClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(domainClassName));
    throw error;
  }
};
