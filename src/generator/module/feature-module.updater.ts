import fs from 'fs';
import path from 'path';
import { toKebabCase, toPascalCase } from '../../util/convert-case.util';
import { UpdateOptions } from '../../common/interface';

const ensureNamedImport = (content: string, symbol: string, importPath: string): string => {
  const importRegex = new RegExp(
    `import\\s+{[^}]*\\b${symbol}\\b[^}]*}\\s+from\\s+['"]${importPath}['"]`,
  );
  if (importRegex.test(content)) return content;

  const lines = content.split('\n');
  const importLine = `import { ${symbol} } from '${importPath}';`;
  let lastImportIndex = -1;

  lines.forEach((line, idx) => {
    if (/^import\s.+from\s+['"].+['"];?/.test(line.trim())) lastImportIndex = idx;
  });

  if (lastImportIndex >= 0) lines.splice(lastImportIndex + 1, 0, importLine);
  else lines.unshift(importLine);

  return lines.join('\n');
};

const ensureTypeOrmImport = (content: string): string => {
  const regex = /import\s+{[^}]*\bTypeOrmModule\b[^}]*}\s+from\s+['"]@nestjs\/typeorm['"]/;
  if (regex.test(content)) return content;
  return ensureNamedImport(content, 'TypeOrmModule', '@nestjs/typeorm');
};

const ensureArrayEntries = (content: string, key: string, entries: string[]): string => {
  const arrayRegex = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`);
  const match = content.match(arrayRegex);
  if (!match) return content;

  const arrayContent = match[1];

  const items = arrayContent
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  entries.forEach((entry) => {
    if (!items.includes(entry)) items.push(entry);
  });

  const inline = items.length ? items.join(', ') : '';
  return content.replace(arrayRegex, `${key}: [${inline}]`);
};

const mergeTypeOrmForFeature = (content: string, entity: string): string => {
  const importsRegex = /imports\s*:\s*\[([\s\S]*?)\]/m;
  const match = content.match(importsRegex);
  if (!match) return content;

  const rawItems = match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const typeOrmIdx = rawItems.findIndex((item) => item.startsWith('TypeOrmModule.forFeature'));

  if (typeOrmIdx !== -1) {
    const existing = rawItems[typeOrmIdx];
    const entityMatch = existing.match(/TypeOrmModule\.forFeature\(\s*\[([\s\S]*?)\]\s*\)/);
    const entities = entityMatch
      ? entityMatch[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    if (!entities.includes(entity)) entities.push(entity);
    rawItems[typeOrmIdx] = `TypeOrmModule.forFeature([${entities.join(', ')}])`;
  } else {
    rawItems.push(`TypeOrmModule.forFeature([${entity}])`);
  }

  const inline = rawItems.length ? rawItems.join(', ') : '';
  return content.replace(importsRegex, `imports: [${inline}]`);
};

export const updateFeatureModule = (domainName: string, options: UpdateOptions): void => {
  const domainKebab = toKebabCase(domainName);
  const domainPascal = toPascalCase(domainName);

  const cwd = process.cwd();
  const modulePath = path.join(cwd, 'src', 'api', domainKebab, `${domainKebab}.module.ts`);

  if (!fs.existsSync(modulePath)) return;

  let content = fs.readFileSync(modulePath, 'utf8');

  if (options.addEntity) {
    const entityName = `${domainPascal}Entity`;
    const entityImportPath = `./infrastructure/${domainKebab}.entity`;
    content = ensureNamedImport(content, entityName, entityImportPath);
    content = ensureTypeOrmImport(content);
    content = mergeTypeOrmForFeature(content, entityName);
  }

  const providers: string[] = [];
  const exportsList: string[] = [];
  const controllers: string[] = [];

  if (options.addService) {
    const serviceName = `${domainPascal}Service`;
    const serviceImportPath = `./domain/${domainKebab}.service`;
    content = ensureNamedImport(content, serviceName, serviceImportPath);
    providers.push(serviceName);
    exportsList.push(serviceName);
  }

  if (options.addRepository) {
    const repositoryName = `${domainPascal}Repository`;
    const repositoryImportPath = `./infrastructure/${domainKebab}.repository`;
    content = ensureNamedImport(content, repositoryName, repositoryImportPath);
    providers.push(repositoryName);
  }

  if (options.addUseCase) {
    const useCaseName = `Find${domainPascal}UseCase`;
    const useCaseImportPath = `./application/find-${domainKebab}.use-case`;
    content = ensureNamedImport(content, useCaseName, useCaseImportPath);
    providers.push(useCaseName);
  }

  if (options.addController) {
    const controllerName = `${domainPascal}Controller`;
    const controllerImportPath = `./presentation/${domainKebab}.controller`;
    content = ensureNamedImport(content, controllerName, controllerImportPath);
    controllers.push(controllerName);
  }

  if (providers.length) content = ensureArrayEntries(content, 'providers', providers);
  if (exportsList.length) content = ensureArrayEntries(content, 'exports', exportsList);
  if (controllers.length) content = ensureArrayEntries(content, 'controllers', controllers);

  fs.writeFileSync(modulePath, content, { encoding: 'utf8' });
};
