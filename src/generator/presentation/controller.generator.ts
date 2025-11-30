import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { toPascalCase, toKebabCase, toCamelCase, pluralize } from '../../util/convert-case.util';
import { logCreated, logFailure, logSkipped } from '../../util/log-style.util';
import { updateFeatureModule } from '../module/feature-module.updater';

export const generateController = (domainName: string): void => {
  const domainNamePascal = toPascalCase(domainName);
  const domainNameKebab = toKebabCase(domainName);
  const domainNameCamel = toCamelCase(domainName);
  const domainNamePluralKebab = pluralize(toKebabCase(domainName));

  const spinner = ora(`Generating controllers for ${domainNamePascal}...\n`).start();

  try {
    const cwd = process.cwd();

    const moduleDir = path.join(cwd, 'src', 'api', domainNameKebab);
    const commandControllerDir = path.join(moduleDir, 'presentation', 'command');
    const queryControllerDir = path.join(moduleDir, 'presentation', 'query');
    const commandDtoDir = path.join(commandControllerDir, 'dto');
    const queryDtoDir = path.join(queryControllerDir, 'dto');

    fs.mkdirSync(commandDtoDir, { recursive: true });
    fs.mkdirSync(queryDtoDir, { recursive: true });

    const replacements = (template: string): string =>
      template
        .replace(/{{domainNamePascal}}/g, domainNamePascal)
        .replace(/{{domainNameKebab}}/g, domainNameKebab)
        .replace(/{{domainNameCamel}}/g, domainNameCamel)
        .replace(/{{domainNamePluralKebab}}/g, domainNamePluralKebab);

    const files: { name: string; template: string; target: string }[] = [
      {
        name: `${domainNamePascal}CommandController`,
        template: 'controller-command.hbs',
        target: path.join(commandControllerDir, `${domainNameKebab}-command.controller.ts`),
      },
      {
        name: `${domainNamePascal}QueryController`,
        template: 'controller-query.hbs',
        target: path.join(queryControllerDir, `${domainNameKebab}-query.controller.ts`),
      },
      {
        name: `Create${domainNamePascal}RequestDto`,
        template: 'dto-command-create.hbs',
        target: path.join(commandDtoDir, `create-${domainNameKebab}.dto.ts`),
      },
      {
        name: `Update${domainNamePascal}RequestDto`,
        template: 'dto-command-update.hbs',
        target: path.join(commandDtoDir, `update-${domainNameKebab}.dto.ts`),
      },
      {
        name: `Find${domainNamePascal}ResponseDto`,
        template: 'dto-query-find.hbs',
        target: path.join(queryDtoDir, `find-${domainNameKebab}.dto.ts`),
      },
      {
        name: `Find${domainNamePascal}ListResponseDto`,
        template: 'dto-query-find-list.hbs',
        target: path.join(queryDtoDir, `find-${domainNameKebab}-list.dto.ts`),
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

    updateFeatureModule(domainName, { addController: true });

    if (logs.length) logs.forEach((msg) => spinner.succeed(msg));
    else spinner.succeed(`No controllers generated for ${domainNamePascal}`);
  } catch (error: unknown) {
    spinner.fail(logFailure(`${domainNamePascal} controllers`));
    throw error;
  }
};
