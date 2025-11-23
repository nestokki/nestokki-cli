import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';

export const generateMapper = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);

  const mapperClassName = `${domainNamePascal}Mapper`;

  const spinner = ora(`Generating for ${mapperClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const mapperDir = path.join(moduleDir, 'infrastructure');

    fs.mkdirSync(mapperDir, { recursive: true });

    const domainFilePath = path.join(mapperDir, `${domainNameKebab}.mapper.ts`);
    const relativePath = path.relative(cwd, domainFilePath);

    if (fs.existsSync(domainFilePath)) {
      spinner.info(logSkipped(mapperClassName, relativePath));
      return;
    }

    const templatePath = path.join(__dirname, '../../template/mapper.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{mapperClassName}}/g, mapperClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab);

    fs.writeFileSync(domainFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(mapperClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(mapperClassName));
    throw error;
  }
};
