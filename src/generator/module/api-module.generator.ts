import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toKebabCase, toPascalCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkippedApi, logUpdated } from '../../util/log-style.util';

export const generateApiModule = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);

  const rootClassName = 'ApiModule';
  const domainClassName = `${domainNamePascal}Module`;

  const spinner = ora(`Generating for ${rootClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api');

    fs.mkdirSync(moduleDir, { recursive: true });

    const moduleFilePath = path.join(moduleDir, 'api.module.ts');
    const relativePath = path.relative(cwd, moduleFilePath);

    if (fs.existsSync(moduleFilePath)) {
      let apiModuleFile = fs.readFileSync(moduleFilePath, 'utf8');

      if (apiModuleFile.includes(domainClassName)) {
        spinner.info(logSkippedApi([domainClassName, rootClassName], relativePath));
        return;
      }

      const importLine = `import { ${domainClassName} } from './${domainNameKebab}/${domainNameKebab}.module';`;

      const lastImportMatch = apiModuleFile.match(/(^import .+$)/gm);
      if (lastImportMatch && lastImportMatch.length > 0) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];

        apiModuleFile = apiModuleFile.replace(lastImport, `${lastImport}\n${importLine}`);
      } else {
        apiModuleFile = `${importLine}\n${apiModuleFile}`;
      }

      apiModuleFile = apiModuleFile.replace(/imports:\s*\[([^\]]*)\]/, (_, inner) => {
        const items = inner
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        if (!items.includes(domainClassName)) items.push(domainClassName);

        return `imports: [${items.join(', ')}]`;
      });

      fs.writeFileSync(moduleFilePath, apiModuleFile, 'utf8');

      spinner.succeed(logUpdated([rootClassName, domainClassName], relativePath));

      return;
    }

    const templatePath = path.join(__dirname, '../../template/api-module.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{rootClassName}}/g, rootClassName)
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab);

    fs.writeFileSync(moduleFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(rootClassName, relativePath));
  } catch (error: unknown) {
    spinner.fail(logFailure(domainClassName));
    throw error;
  }
};
