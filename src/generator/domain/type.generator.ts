import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateType = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);

  const typeName = `${domainNamePascal}Type`;

  const spinner = ora(`Generating for ${typeName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const typeDir = path.join(moduleDir, 'domain');

    fs.mkdirSync(typeDir, { recursive: true });

    const domainFilePath = path.join(typeDir, `${domainNameKebab}.type.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(typeName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/type.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template.replace(/{{domainNamePascal}}/g, domainNamePascal);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(typeName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(typeName));
    throw error;
  }
};
