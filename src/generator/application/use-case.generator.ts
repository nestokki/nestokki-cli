import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';
import { updateFeatureModule } from '../module/feature-module.updater';

export const generateUseCase = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);

  const spinner = ora(`Generating use cases for ${domainNamePascal}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const commandDir = path.join(moduleDir, 'application', 'command');
    const queryDir = path.join(moduleDir, 'application', 'query');
    const actionDir = path.join(commandDir, 'action');

    fs.mkdirSync(actionDir, { recursive: true });
    fs.mkdirSync(queryDir, { recursive: true });

    const replacements = (template: string): string =>
      template
        .replace(/{{domainNamePascal}}/g, domainNamePascal)
        .replace(/{{domainNameKebab}}/g, domainNameKebab)
        .replace(/{{domainNameCamel}}/g, domainNameCamel);

    const files: { name: string; template: string; target: string }[] = [
      {
        name: `Create${domainNamePascal}UseCase`,
        template: 'use-case-command-create.hbs',
        target: path.join(commandDir, `create-${domainNameKebab}.use-case.ts`),
      },
      {
        name: `Update${domainNamePascal}UseCase`,
        template: 'use-case-command-update.hbs',
        target: path.join(commandDir, `update-${domainNameKebab}.use-case.ts`),
      },
      {
        name: `Delete${domainNamePascal}UseCase`,
        template: 'use-case-command-delete.hbs',
        target: path.join(commandDir, `delete-${domainNameKebab}.use-case.ts`),
      },
      {
        name: `Find${domainNamePascal}UseCase`,
        template: 'use-case-query-find.hbs',
        target: path.join(queryDir, `find-${domainNameKebab}.use-case.ts`),
      },
      {
        name: `Find${domainNamePascal}ListUseCase`,
        template: 'use-case-query-find-list.hbs',
        target: path.join(queryDir, `find-${domainNameKebab}-list.use-case.ts`),
      },
      {
        name: `Create${domainNamePascal}Command`,
        template: 'use-case-command-action-create.hbs',
        target: path.join(actionDir, `create-${domainNameKebab}.command.ts`),
      },
      {
        name: `Update${domainNamePascal}Command`,
        template: 'use-case-command-action-update.hbs',
        target: path.join(actionDir, `update-${domainNameKebab}.command.ts`),
      },
    ];

    const logs: string[] = [];

    files.forEach(({ name, template, target }) => {
      const relativePath = path.relative(cwd, target);
      if (fs.existsSync(target)) {
        logs.push(logSkipped(name, relativePath));
        return;
      }

      const templatePath = path.join(__dirname, '../../template', template);
      const raw = fs.readFileSync(templatePath, 'utf8');
      const content = replacements(raw);

      fs.writeFileSync(target, content, { encoding: 'utf8' });
      logs.push(logCreated(name, relativePath));
    });

    updateFeatureModule(domainName, { addUseCase: true });

    if (logs.length) logs.forEach((msg) => spinner.succeed(msg));
    else spinner.succeed(`No files generated for ${domainNamePascal}`);
  } catch (error: unknown) {
    spinner.fail(logFailure(`${domainNamePascal} use cases`));
    throw error;
  }
};
