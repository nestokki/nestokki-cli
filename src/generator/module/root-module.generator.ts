import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toKebabCase, toPascalCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkippedApi, logUpdated } from '../../util/log-style.util';

export const generateApiModule = (domainName: string): void => {
  const pascal = toPascalCase(domainName);
  const kebab = toKebabCase(domainName);

  const apiClassName = 'ApiModule';
  const domainClassName = `${pascal}Module`;
  const domainNamePascal = pascal;
  const domainNameKebab = kebab;

  const spinner = ora(`Generating for ${apiClassName}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api');

    fs.mkdirSync(moduleDir, { recursive: true });

    const moduleFilePath = path.join(moduleDir, 'api.module.ts');

    if (fs.existsSync(moduleFilePath)) {
      let apiModuleFile = fs.readFileSync(moduleFilePath, 'utf8');

      if (apiModuleFile.includes(domainClassName)) {
        spinner.info(
          logSkippedApi([domainClassName, apiClassName], path.relative(cwd, moduleFilePath)),
        );
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

      spinner.succeed(
        logUpdated([apiClassName, domainClassName], path.relative(cwd, moduleFilePath)),
      );

      return;
    }

    const templatePath = path.join(__dirname, '../../template/api-module.hbs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const content = template
      .replace(/{{domainNamePascal}}/g, domainNamePascal)
      .replace(/{{domainNameKebab}}/g, domainNameKebab)
      .replace(/{{apiClassName}}/g, apiClassName);

    fs.writeFileSync(moduleFilePath, content, { encoding: 'utf8' });

    spinner.succeed(logCreated(apiClassName, path.relative(cwd, moduleFilePath)));
  } catch (error: unknown) {
    spinner.fail(logFailure(domainClassName));
    throw error;
  }
};
