import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { RelationCategory, OnDeleteCategory } from '../../common/enum';
import { RelationConfig, RelationOptionsResponse } from '../../common/interface';
import { toCamelCase, toPascalCase } from '../../util/convert-case.util';
import { logFailure, logUpdatedRelation } from '../../util/log-style.util';

const ensureImports = (content: string, symbols: string[]): string => {
  if (!symbols.length) return content;
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]typeorm['"]/;
  if (!importRegex.test(content)) {
    return `import { ${symbols.join(', ')} } from 'typeorm';\n${content}`;
  }

  return content.replace(importRegex, (match, p1) => {
    const existing = p1
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existing, ...symbols]));
    return `import { ${merged.join(', ')} } from 'typeorm';`;
  });
};

const mapOnDelete = (option: OnDeleteCategory): string => {
  switch (option) {
    case OnDeleteCategory.CASCADE:
      return 'CASCADE';
    case OnDeleteCategory.SET_NULL:
      return 'SET NULL';
    case OnDeleteCategory.RESTRICT:
    default:
      return 'RESTRICT';
  }
};

const buildOptions = (
  relationType: RelationCategory,
  options: RelationOptionsResponse,
  includeOnDelete: boolean,
): string => {
  const entries: string[] = [];

  if (options.cascade) entries.push('cascade: true');
  if (relationType !== RelationCategory.ONE_TO_MANY && options.nullable)
    entries.push('nullable: true');
  if (includeOnDelete) entries.push(`onDelete: '${mapOnDelete(options.onDelete)}'`);

  if (!entries.length) return '';
  return `{ ${entries.join(', ')} }`;
};

const insertSnippet = (content: string, snippet: string): string => {
  const insertIndex = content.lastIndexOf('}');
  if (insertIndex === -1) throw new Error('Entity class closing brace not found.');
  const prefix = content.slice(0, insertIndex);
  const suffix = content.slice(insertIndex);
  return `${prefix}\n${snippet}\n${suffix}`;
};

const buildPropertyType = (
  relationType: RelationCategory,
  targetEntity: string,
  lazy: boolean,
): string => {
  const collection = relationType === RelationCategory.ONE_TO_MANY;
  if (lazy) return collection ? `Promise<${targetEntity}[]>` : `Promise<${targetEntity}>`;
  return collection ? `${targetEntity}[]` : targetEntity;
};

const buildRelationDecorator = (
  relationType: RelationCategory,
  targetEntity: string,
  targetVar: string,
  targetProperty: string | undefined,
  optionsLiteral: string,
): string => {
  const inverseCallback = targetProperty
    ? `, (${targetVar}) => ${targetVar}.${targetProperty}`
    : '';
  const optionPart = optionsLiteral ? `, ${optionsLiteral}` : '';

  switch (relationType) {
    case RelationCategory.MANY_TO_ONE:
      return `@ManyToOne(() => ${targetEntity}${inverseCallback}${optionPart})`;
    case RelationCategory.ONE_TO_MANY:
      return `@OneToMany(() => ${targetEntity}${inverseCallback}${optionPart})`;
    case RelationCategory.ONE_TO_ONE:
    default:
      return `@OneToOne(() => ${targetEntity}${inverseCallback}${optionPart})`;
  }
};

const addBaseSide = (
  content: string,
  config: RelationConfig,
  baseEntity: string,
  targetEntity: string,
): string => {
  const { relationType, options, targetModule } = config;
  const propertyType = buildPropertyType(relationType, targetEntity, options.lazy);
  const inverseProp = options.bidirectional ? options.inversePropertyName : undefined;
  const targetVar = toCamelCase(targetModule);
  const optionLiteral = buildOptions(
    relationType,
    options,
    relationType !== RelationCategory.ONE_TO_MANY,
  );
  const decorator = buildRelationDecorator(
    relationType,
    targetEntity,
    targetVar,
    inverseProp,
    optionLiteral,
  );

  const joinColumn =
    relationType === RelationCategory.MANY_TO_ONE || relationType === RelationCategory.ONE_TO_ONE
      ? `  @JoinColumn({ name: '${options.fkColumn}' })\n`
      : '';

  const snippet = `  // Relation: ${baseEntity} -> ${targetEntity}\n  ${decorator}\n${joinColumn}  ${options.propertyName}: ${propertyType};`;

  if (content.includes(`${options.propertyName}:`)) {
    throw new Error(`Property "${options.propertyName}" already exists in ${baseEntity}.`);
  }

  const imports: string[] = [];
  if (relationType === RelationCategory.MANY_TO_ONE) imports.push('ManyToOne');
  if (relationType === RelationCategory.ONE_TO_MANY) imports.push('OneToMany');
  if (relationType === RelationCategory.ONE_TO_ONE) imports.push('OneToOne');
  if (joinColumn) imports.push('JoinColumn');

  const updatedImports = ensureImports(content, imports);
  return insertSnippet(updatedImports, snippet);
};

const addInverseSide = (
  content: string,
  config: RelationConfig,
  baseEntity: string,
  targetEntity: string,
): string => {
  const { relationType, options } = config;
  if (!options.bidirectional || !options.inversePropertyName) return content;

  const baseProp = options.propertyName;
  const inverseProp = options.inversePropertyName;
  const inverseType =
    relationType === RelationCategory.MANY_TO_ONE
      ? RelationCategory.ONE_TO_MANY
      : relationType === RelationCategory.ONE_TO_MANY
      ? RelationCategory.MANY_TO_ONE
      : RelationCategory.ONE_TO_ONE;

  const propertyType = buildPropertyType(inverseType, baseEntity, options.lazy);
  const baseVar = toCamelCase(config.baseModule);
  const optionLiteral = buildOptions(
    inverseType,
    options,
    inverseType !== RelationCategory.ONE_TO_MANY,
  );
  const decorator = buildRelationDecorator(
    inverseType,
    baseEntity,
    baseVar,
    baseProp,
    optionLiteral,
  );
  const joinColumn =
    inverseType === RelationCategory.MANY_TO_ONE || inverseType === RelationCategory.ONE_TO_ONE
      ? `  @JoinColumn({ name: '${options.fkColumn}' })\n`
      : '';

  if (content.includes(`${inverseProp}:`)) {
    throw new Error(`Property "${inverseProp}" already exists in ${targetEntity}.`);
  }

  const snippet = `  // Relation: ${targetEntity} -> ${baseEntity}\n  ${decorator}\n${joinColumn}  ${inverseProp}: ${propertyType};`;

  const imports: string[] = [];
  if (inverseType === RelationCategory.MANY_TO_ONE) imports.push('ManyToOne');
  if (inverseType === RelationCategory.ONE_TO_MANY) imports.push('OneToMany');
  if (inverseType === RelationCategory.ONE_TO_ONE) imports.push('OneToOne');
  if (joinColumn) imports.push('JoinColumn');

  const updatedImports = ensureImports(content, imports);
  return insertSnippet(updatedImports, snippet);
};

export const generateRelation = (config: RelationConfig): void => {
  const { baseModule, targetModule } = config;
  const baseEntity = `${toPascalCase(baseModule)}Entity`;
  const targetEntity = `${toPascalCase(targetModule)}Entity`;

  const spinner = ora(`Generating relation for ${baseEntity}...\n`).start();

  try {
    const cwd = process.cwd();
    const basePath = path.join(
      cwd,
      'src',
      'api',
      baseModule,
      'infrastructure',
      `${baseModule}.entity.ts`,
    );
    const targetPath = path.join(
      cwd,
      'src',
      'api',
      targetModule,
      'infrastructure',
      `${targetModule}.entity.ts`,
    );

    if (!fs.existsSync(basePath)) throw new Error(`Base entity not found: ${basePath}`);
    if (!fs.existsSync(targetPath)) throw new Error(`Target entity not found: ${targetPath}`);

    const baseContent = fs.readFileSync(basePath, 'utf8');
    const targetContent = fs.readFileSync(targetPath, 'utf8');

    const updatedBase = addBaseSide(baseContent, config, baseEntity, targetEntity);
    const updatedTarget = addInverseSide(targetContent, config, baseEntity, targetEntity);

    fs.writeFileSync(basePath, updatedBase, { encoding: 'utf8' });
    fs.writeFileSync(targetPath, updatedTarget, { encoding: 'utf8' });

    spinner.succeed(
      logUpdatedRelation(baseEntity, path.relative(cwd, basePath), 'relation added'),
    );
    if (updatedTarget !== targetContent) {
      spinner.succeed(
        logUpdatedRelation(`${targetEntity} inverse`, path.relative(cwd, targetPath), 'relation added'),
      );
    }
  } catch (error: unknown) {
    spinner.fail(logFailure(`${baseModule} relation`));
    throw error;
  }
};
