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
    const commandActionDir = path.join(commandDir, 'action');
    const queryViewDir = path.join(queryDir, 'view');

    fs.mkdirSync(commandActionDir, { recursive: true });
    fs.mkdirSync(queryDir, { recursive: true });
    fs.mkdirSync(queryViewDir, { recursive: true });

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
        name: `${domainNamePascal}DetailModel`,
        template: 'use-case-query-view-model-detail.hbs',
        target: path.join(queryViewDir, `${domainNameKebab}-detail.model.ts`),
      },
      {
        name: `${domainNamePascal}ListItemModel`,
        template: 'use-case-query-view-model-list-item.hbs',
        target: path.join(queryViewDir, `${domainNameKebab}-list-item.model.ts`),
      },
      {
        name: `Create${domainNamePascal}Command`,
        template: 'use-case-command-action-create.hbs',
        target: path.join(commandActionDir, `create-${domainNameKebab}.command.ts`),
      },
      {
        name: `Update${domainNamePascal}Command`,
        template: 'use-case-command-action-update.hbs',
        target: path.join(commandActionDir, `update-${domainNameKebab}.command.ts`),
      },
    ];

    const successLogs: string[] = [];
    const skippedLogs: string[] = [];

    files.forEach(({ name, template, target }) => {
      const relativePath = path.relative(cwd, target);
      if (fs.existsSync(target)) {
        skippedLogs.push(logSkipped(name, relativePath));
        return;
      }

      const templatePath = path.join(__dirname, '../../template', template);
      const raw = fs.readFileSync(templatePath, 'utf8');
      const content = replacements(raw);

      fs.writeFileSync(target, content, { encoding: 'utf8' });
      successLogs.push(logCreated(name, relativePath));
    });

    updateFeatureModule(domainName, { addUseCase: true });

    if (successLogs.length) successLogs.forEach((msg) => spinner.succeed(msg));
    if (skippedLogs.length) skippedLogs.forEach((msg) => spinner.info(msg));
    if (!successLogs.length && !skippedLogs.length)
      spinner.succeed(`No files generated for ${domainNamePascal}`);
  } catch (error: unknown) {
    spinner.fail(logFailure(`${domainNamePascal} use cases`));
    throw error;
  }
};
