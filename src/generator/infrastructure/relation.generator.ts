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

const ensureEntityImport = (content: string, entityName: string, importPath: string): string => {
  const importRegex = new RegExp(
    `import\\s+{\\s*${entityName}\\s*}\\s+from\\s+['"]${importPath}['"]`,
  );
  if (importRegex.test(content)) return content;

  const lines = content.split('\n');
  const importLine = `import { ${entityName} } from '${importPath}';`;
  let lastImportIndex = -1;

  lines.forEach((line, idx) => {
    if (/^import\s.+from\s+['"].+['"];?/.test(line.trim())) lastImportIndex = idx;
  });

  if (lastImportIndex >= 0) lines.splice(lastImportIndex + 1, 0, importLine);
  else lines.unshift(importLine);

  return lines.join('\n');
};

const ensureClassValidatorImport = (content: string, symbols: string[]): string => {
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]class-validator['"];/;
  const symbolSet = new Set(symbols);

  if (!importRegex.test(content)) {
    return `import { ${Array.from(symbolSet).join(', ')} } from 'class-validator';\n${content}`;
  }

  return content.replace(importRegex, (match, p1) => {
    const existing = p1
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existing, ...symbolSet]));
    return `import { ${merged.join(', ')} } from 'class-validator';`;
  });
};

const updateCreateDto = (filePath: string, fkProp: string): void => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  content = ensureClassValidatorImport(content, ['IsNotEmpty', 'IsNumber']);

  const lines = content.split('\n');
  const classIdx = lines.findIndex((line) => line.includes('export class'));
  const firstPropIdx = lines.findIndex((line, idx) => idx > classIdx && line.trim().startsWith('@'));
  const insertIdx = firstPropIdx !== -1 ? firstPropIdx : classIdx + 1;

  const fkBlock = [
    '  @IsNotEmpty()',
    '  @IsNumber()',
    `  ${fkProp}: number;`,
    '',
  ];

  if (!lines.some((line) => line.includes(`${fkProp}:`))) {
    lines.splice(insertIdx, 0, ...fkBlock);
  }

  const returnIdx = lines.findIndex((line) => line.includes('return {'));
  if (returnIdx !== -1 && !lines.slice(returnIdx, returnIdx + 10).some((line) => line.includes(`${fkProp}:`))) {
    lines.splice(returnIdx + 1, 0, `      ${fkProp}: this.${fkProp},`);
  }

  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf8' });
};

const updateCreateCommand = (filePath: string, fkProp: string): void => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const returnIdx = content.indexOf('return {');
  if (returnIdx === -1) return;
  const closingMatch = content.slice(returnIdx).match(/\n(\s*)};/);
  if (!closingMatch || closingMatch.index === undefined) return;

  const closingStart = returnIdx + closingMatch.index + 1; // start of indentation before `};`
  const before = content.slice(0, closingStart);
  const after = content.slice(closingStart);

  if (!before.includes(`${fkProp}:`)) {
    const beforeTrimmed = before.replace(/\s+$/, '');
    const beforeWithComma = beforeTrimmed.endsWith(',') ? beforeTrimmed : `${beforeTrimmed},`;
    const fkLine = `      ${fkProp}: this.props.${fkProp},`;
    content = `${beforeWithComma}\n${fkLine}\n${after}`;
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  }
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

const getInverseRelationType = (relationType: RelationCategory): RelationCategory => {
  switch (relationType) {
    case RelationCategory.MANY_TO_ONE:
      return RelationCategory.ONE_TO_MANY;
    case RelationCategory.ONE_TO_MANY:
      return RelationCategory.MANY_TO_ONE;
    case RelationCategory.ONE_TO_ONE:
    default:
      return RelationCategory.ONE_TO_ONE;
  }
};

const getDecoratorName = (relationType: RelationCategory): string => {
  switch (relationType) {
    case RelationCategory.MANY_TO_ONE:
      return 'ManyToOne';
    case RelationCategory.ONE_TO_MANY:
      return 'OneToMany';
    case RelationCategory.ONE_TO_ONE:
    default:
      return 'OneToOne';
  }
};

const getPropsType = (relationType: RelationCategory, targetDomain: string): string => {
  switch (relationType) {
    case RelationCategory.ONE_TO_MANY:
      return `readonly ${targetDomain}[]`;
    case RelationCategory.MANY_TO_ONE:
    case RelationCategory.ONE_TO_ONE:
    default:
      return `${targetDomain} | null`;
  }
};

const getGetterReturnType = (relationType: RelationCategory, targetDomain: string): string => {
  switch (relationType) {
    case RelationCategory.ONE_TO_MANY:
      return `readonly ${targetDomain}[] | undefined`;
    case RelationCategory.MANY_TO_ONE:
    case RelationCategory.ONE_TO_ONE:
    default:
      return `${targetDomain} | null | undefined`;
  }
};

const getMappingFunction = (relationType: RelationCategory): 'mapManyToOne' | 'mapOneToMany' => {
  return relationType === RelationCategory.ONE_TO_MANY ? 'mapOneToMany' : 'mapManyToOne';
};

const normalizeImportPath = (fromDir: string, toFile: string): string => {
  const relative = path.relative(fromDir, toFile).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (relative.startsWith('.')) return relative;
  return `./${relative}`;
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
  const fkNullable = options.onDelete === OnDeleteCategory.SET_NULL || options.nullable;
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

  const fkPropName = toCamelCase(options.fkColumn);
  const fkCommentTarget = targetEntity.replace(/Entity$/, '');
  const fkSnippet =
    relationType === RelationCategory.ONE_TO_MANY
      ? ''
      : `  @Column('int', {\n    name: '${options.fkColumn}',\n    unsigned: true,\n    nullable: ${
          fkNullable ? 'true' : 'false'
        },\n    comment: '${fkCommentTarget} FK',\n  })\n  ${fkPropName}: number${
          fkNullable ? ' | null' : ''
        };\n\n`;

  const snippet = `${fkSnippet}  // Relation: ${baseEntity} -> ${targetEntity}\n  ${decorator}\n${joinColumn}  ${options.propertyName}: ${propertyType};`;

  if (content.includes(`${options.propertyName}:`)) {
    throw new Error(`Property "${options.propertyName}" already exists in ${baseEntity}.`);
  }

  const imports: string[] = [];
  if (fkSnippet) imports.push('Column');
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
  const inverseType = getInverseRelationType(relationType);

  const propertyType = buildPropertyType(inverseType, baseEntity, options.lazy);
  const baseVar = toCamelCase(config.baseModule);
  const fkNullable = options.onDelete === OnDeleteCategory.SET_NULL || options.nullable;
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

  const fkPropName = toCamelCase(options.fkColumn);
  const fkCommentTarget = baseEntity.replace(/Entity$/, '');
  const fkSnippet =
    inverseType === RelationCategory.ONE_TO_MANY
      ? ''
      : `  @Column('int', {\n    name: '${options.fkColumn}',\n    unsigned: true,\n    nullable: ${
          fkNullable ? 'true' : 'false'
        },\n    comment: '${fkCommentTarget} FK',\n  })\n  ${fkPropName}: number${
          fkNullable ? ' | null' : ''
        };\n\n`;

  const snippet = `${fkSnippet}  // Relation: ${targetEntity} -> ${baseEntity}\n  ${decorator}\n${joinColumn}  ${inverseProp}: ${propertyType};`;

  const imports: string[] = [];
  if (fkSnippet) imports.push('Column');
  if (inverseType === RelationCategory.MANY_TO_ONE) imports.push('ManyToOne');
  if (inverseType === RelationCategory.ONE_TO_MANY) imports.push('OneToMany');
  if (inverseType === RelationCategory.ONE_TO_ONE) imports.push('OneToOne');
  if (joinColumn) imports.push('JoinColumn');

  const updatedImports = ensureImports(content, imports);
  return insertSnippet(updatedImports, snippet);
};

const updateRelationProps = (
  filePath: string,
  baseModule: string,
  relationType: RelationCategory,
  propertyName: string,
  targetDomain: string,
  importPath: string,
  fkColumn?: string,
): void => {
  let content = fs.readFileSync(filePath, 'utf8');
  const basePascal = toPascalCase(baseModule);
  const relationInterfaceName = `${basePascal}RelationProps`;

  content = content
    .split('\n')
    .filter(
      (line) => !line.trim().startsWith('// manyToOne') && !line.trim().startsWith('// oneToMany'),
    )
    .join('\n');

  content = ensureNamedImport(content, `${targetDomain}Domain`, importPath);

  const lines = content.split('\n');
  const lastImportIdx = lines.reduce((idx, line, i) => (line.startsWith('import') ? i : idx), -1);
  if (lastImportIdx !== -1 && (lines[lastImportIdx + 1]?.trim() ?? '') !== '') {
    lines.splice(lastImportIdx + 1, 0, '');
  }
  let interfaceIndex = lines.findIndex((line) =>
    line.includes(`interface ${relationInterfaceName}`),
  );
  if (interfaceIndex === -1) {
    const defaultInterfaceIndex = lines.findIndex((line) =>
      line.includes(`interface ${basePascal}DefaultProps`),
    );
    let insertIndex = defaultInterfaceIndex !== -1 ? defaultInterfaceIndex + 1 : lines.length;
    if (defaultInterfaceIndex !== -1) {
      while (insertIndex < lines.length && lines[insertIndex].trim() !== '}') insertIndex += 1;
      if (insertIndex < lines.length) insertIndex += 1;
    }
    const relationInterfaceBlock = ['', `interface ${relationInterfaceName} {`, `}`];
    lines.splice(insertIndex, 0, ...relationInterfaceBlock);
    interfaceIndex = insertIndex + 1;
  }

  const relationLine = `  ${propertyName}?: ${getPropsType(
    relationType,
    `${targetDomain}Domain`,
  )};`;

  // avoid duplicate
  const alreadyHas = lines.some((line) => line.includes(`${propertyName}?:`));
  if (!alreadyHas) lines.splice(interfaceIndex + 1, 0, relationLine);

  const needsFk =
    relationType === RelationCategory.MANY_TO_ONE || relationType === RelationCategory.ONE_TO_ONE;
  const fkInterfaceName = `${basePascal}FkProps`;
  const fkPropName = fkColumn ? toCamelCase(fkColumn) : undefined;

  if (needsFk && fkPropName) {
    const fkInterfaceExists = lines.some((line) => line.includes(`interface ${fkInterfaceName}`));
    if (!fkInterfaceExists) {
      const pkInterfaceIndex = lines.findIndex((line) =>
        line.includes(`interface ${basePascal}Pk`),
      );
      let insertIndex = pkInterfaceIndex !== -1 ? pkInterfaceIndex + 1 : 0;

      while (insertIndex < lines.length && !lines[insertIndex].includes('}')) insertIndex += 1;
      if (insertIndex < lines.length) insertIndex += 1;

      const fkInterfaceBlock = ['', `interface ${fkInterfaceName} {`, `}`];
      lines.splice(insertIndex, 0, ...fkInterfaceBlock);
    }

    const fkInterfaceIndex = lines.findIndex((line) =>
      line.includes(`interface ${fkInterfaceName}`),
    );
    const fkCloseIndex = lines.findIndex(
      (line, idx) => idx > fkInterfaceIndex && line.trim() === '}',
    );

    const hasFkProp = lines.some((line) => line.includes(`${fkPropName}:`));
    if (!hasFkProp && fkInterfaceIndex !== -1 && fkCloseIndex !== -1) {
      lines.splice(fkCloseIndex, 0, `  ${fkPropName}: number | null;`);
    }

    const fkTypeName = fkInterfaceName;
    const domainTypeStart = lines.findIndex((line) =>
      line.startsWith(`export type ${basePascal}DomainProps`),
    );

    if (domainTypeStart !== -1) {
      let domainTypeEnd = domainTypeStart;
      while (domainTypeEnd < lines.length && !lines[domainTypeEnd].trim().endsWith(';')) {
        domainTypeEnd += 1;
      }

      const domainBlock = lines.slice(domainTypeStart, domainTypeEnd + 1);
      const hasFkInDomain = domainBlock.some((line) => line.includes(fkTypeName));
      const hasRelationInDomain = domainBlock.some((line) => line.includes(relationInterfaceName));
      if (!hasFkInDomain) {
        const pkLineIdx = lines.findIndex(
          (line, idx) =>
            idx >= domainTypeStart && idx <= domainTypeEnd && line.includes(`${basePascal}Pk &`),
        );
        const insertAt = pkLineIdx !== -1 ? pkLineIdx + 1 : domainTypeStart + 1;
        lines.splice(insertAt, 0, `  ${fkTypeName} &`);
      }
      if (!hasRelationInDomain) {
        const insertAt = domainTypeEnd;
        lines.splice(insertAt, 0, `  ${relationInterfaceName} &`);
        domainTypeEnd += 1;
      }
    }

    const createTypeIndex = lines.findIndex((line) =>
      line.startsWith(`export type ${basePascal}CreateProps =`),
    );
    if (createTypeIndex !== -1 && !lines[createTypeIndex].includes(fkTypeName)) {
      lines[createTypeIndex] = lines[createTypeIndex].replace(
        `= ${basePascal}RequiredProps`,
        `= ${fkTypeName} & ${basePascal}RequiredProps`,
      );
    }
  } else {
    const domainTypeStart = lines.findIndex((line) =>
      line.startsWith(`export type ${basePascal}DomainProps`),
    );
    if (domainTypeStart !== -1) {
      let domainTypeEnd = domainTypeStart;
      while (domainTypeEnd < lines.length && !lines[domainTypeEnd].trim().endsWith(';')) {
        domainTypeEnd += 1;
      }
      const domainBlock = lines.slice(domainTypeStart, domainTypeEnd + 1);
      const hasRelationInDomain = domainBlock.some((line) => line.includes(relationInterfaceName));
      if (!hasRelationInDomain) {
        const insertAt = domainTypeEnd;
        lines.splice(insertAt, 0, `  ${relationInterfaceName} &`);
      }
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), { encoding: 'utf8' });
};

const updateDomainGetter = (
  filePath: string,
  propertyName: string,
  relationType: RelationCategory,
  targetDomain: string,
  importPath: string,
): void => {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content
    .split('\n')
    .filter(
      (line) =>
        !line.trim().startsWith('// get manyToOne') && !line.trim().startsWith('// get oneToMany'),
    )
    .join('\n');

  content = ensureNamedImport(content, `${targetDomain}Domain`, importPath);

  if (content.includes(`get ${propertyName}()`)) {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    return;
  }

  const getter = `  get ${propertyName}(): ${getGetterReturnType(
    relationType,
    `${targetDomain}Domain`,
  )} {\n    return this.props.${propertyName};\n  }\n`;

  const createdAtIdx = content.indexOf('get createdAt');
  let insertIndex = -1;
  if (createdAtIdx !== -1) {
    const closeBraceIdx = content.indexOf('}', createdAtIdx);
    if (closeBraceIdx !== -1) {
      const afterClose = content.indexOf('\n', closeBraceIdx);
      insertIndex = afterClose !== -1 ? afterClose + 1 : closeBraceIdx + 1;
    }
  }
  if (insertIndex === -1) {
    insertIndex = content.lastIndexOf('}');
    if (insertIndex === -1) throw new Error(`Class closing brace not found in ${filePath}`);
  }

  const updated = content.slice(0, insertIndex) + getter + content.slice(insertIndex);

  fs.writeFileSync(filePath, updated, { encoding: 'utf8' });
};

const updateMapper = (
  filePath: string,
  propertyName: string,
  relationType: RelationCategory,
  targetMapper: string,
  importPath: string,
  fkColumn?: string,
): void => {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content
    .split('\n')
    .filter(
      (line) =>
        !line.trim().startsWith('// manyToOne:') && !line.trim().startsWith('// oneToMany:'),
    )
    .join('\n');

  content = ensureNamedImport(content, targetMapper, importPath);

  const propsMatch = content.match(/const\s+\w+\s*:\s*[^=]*DomainProps\s*=\s*{/);
  if (!propsMatch || propsMatch.index === undefined) {
    throw new Error(`DomainProps object not found in mapper: ${filePath}`);
  }

  const propsStart = propsMatch.index;
  const propsEnd = content.indexOf('};', propsStart);
  if (propsEnd === -1) {
    throw new Error(`DomainProps object closing not found in mapper: ${filePath}`);
  }

  const lineStart = content.lastIndexOf('\n', propsStart) + 1;
  const indentMatch = content.slice(lineStart, propsStart).match(/^\s*/);
  const indent = indentMatch ? indentMatch[0] : '';

  const before = content.slice(0, propsEnd);
  const after = content.slice(propsEnd + 2); // skip existing };

  const mappingFn = getMappingFunction(relationType);
  const relationLine = `      ${propertyName}: ${mappingFn}(entity.${propertyName}, ${targetMapper}.toDomain),`;
  const needsFk =
    fkColumn &&
    (relationType === RelationCategory.MANY_TO_ONE || relationType === RelationCategory.ONE_TO_ONE);
  const fkPropName = needsFk ? toCamelCase(fkColumn) : undefined;
  const fkLine = fkPropName ? `      ${fkPropName}: entity.${fkPropName},` : undefined;

  const linesToAdd: string[] = [];
  if (fkLine && !before.includes(`${fkPropName}:`)) linesToAdd.push(fkLine);
  if (!before.includes(`${propertyName}:`)) linesToAdd.push(relationLine);

  if (linesToAdd.length) {
    const beforeTrimmed = before.replace(/\s+$/, '');
    const beforeWithComma = beforeTrimmed.endsWith(',') ? beforeTrimmed : `${beforeTrimmed},`;
    const closingLine = `\n${indent}};`;
    content = `${beforeWithComma}\n${linesToAdd.join('\n')}${closingLine}${after}`;
  }

  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
};

export const generateRelation = (config: RelationConfig): void => {
  const { baseModule, targetModule } = config;
  const baseEntity = `${toPascalCase(baseModule)}Entity`;
  const targetEntity = `${toPascalCase(targetModule)}Entity`;
  const inverseTypeForLog = getInverseRelationType(config.relationType);

  const spinner = ora(`Generating relation for ${baseEntity}...\n`).start();

  try {
    const logs: string[] = [];
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

    let updatedBase = addBaseSide(baseContent, config, baseEntity, targetEntity);
    let updatedTarget = addInverseSide(targetContent, config, baseEntity, targetEntity);

    const baseDir = path.dirname(basePath);
    const targetDir = path.dirname(targetPath);

    const importToTarget = path
      .relative(baseDir, targetPath)
      .replace(/\\/g, '/')
      .replace(/\.ts$/, '');
    const importToBase = path
      .relative(targetDir, basePath)
      .replace(/\\/g, '/')
      .replace(/\.ts$/, '');

    const normalizedImportToTarget = importToTarget.startsWith('.')
      ? importToTarget
      : `./${importToTarget}`;
    const normalizedImportToBase = importToBase.startsWith('.')
      ? importToBase
      : `./${importToBase}`;

    updatedBase = ensureEntityImport(updatedBase, targetEntity, normalizedImportToTarget);
    if (updatedTarget !== targetContent) {
      updatedTarget = ensureEntityImport(updatedTarget, baseEntity, normalizedImportToBase);
    }
    logs.push(
      logUpdatedRelation(
        baseEntity,
        path.relative(cwd, basePath),
        'relation added',
        getDecoratorName(config.relationType),
      ),
    );

    // Domain/props/mapper updates for base
    const baseDomainDir = path.join(cwd, 'src', 'api', baseModule, 'domain');
    const basePropsPath = path.join(baseDomainDir, `${baseModule}.type.ts`);
    const baseDomainPath = path.join(baseDomainDir, `${baseModule}.domain.ts`);
    const baseMapperPath = path.join(
      cwd,
      'src',
      'api',
      baseModule,
      'infrastructure',
      `${baseModule}.mapper.ts`,
    );
    const baseDtoPath = path.join(
      cwd,
      'src',
      'api',
      baseModule,
      'presentation',
      'command',
      'dto',
      `create-${baseModule}.dto.ts`,
    );
    const baseCommandPath = path.join(
      cwd,
      'src',
      'api',
      baseModule,
      'application',
      'command',
      'action',
      `create-${baseModule}.command.ts`,
    );

    const targetDomainImportPath = normalizeImportPath(
      baseDomainDir,
      path.join(cwd, 'src', 'api', targetModule, 'domain', `${targetModule}.domain.ts`),
    );
    const targetMapperImportPath = normalizeImportPath(
      path.join(cwd, 'src', 'api', baseModule, 'infrastructure'),
      path.join(cwd, 'src', 'api', targetModule, 'infrastructure', `${targetModule}.mapper.ts`),
    );

    if (!fs.existsSync(basePropsPath)) throw new Error(`Type file not found: ${basePropsPath}`);
    if (!fs.existsSync(baseDomainPath)) throw new Error(`Domain file not found: ${baseDomainPath}`);
    if (!fs.existsSync(baseMapperPath)) throw new Error(`Mapper file not found: ${baseMapperPath}`);

    const targetDomainName = toPascalCase(targetModule);
    updateRelationProps(
      basePropsPath,
      baseModule,
      config.relationType,
      config.options.propertyName,
      targetDomainName,
      targetDomainImportPath,
      config.options.fkColumn,
    );
    updateDomainGetter(
      baseDomainPath,
      config.options.propertyName,
      config.relationType,
      targetDomainName,
      targetDomainImportPath,
    );
    updateMapper(
      baseMapperPath,
      config.options.propertyName,
      config.relationType,
      `${targetDomainName}Mapper`,
      targetMapperImportPath,
      config.options.fkColumn,
    );
    if (
      config.relationType === RelationCategory.MANY_TO_ONE ||
      config.relationType === RelationCategory.ONE_TO_ONE
    ) {
      const fkPropName = toCamelCase(config.options.fkColumn);
      updateCreateDto(baseDtoPath, fkPropName);
      updateCreateCommand(baseCommandPath, fkPropName);
    }
    logs.push(
      logUpdatedRelation(
        `${toPascalCase(baseModule)} props`,
        path.relative(cwd, basePropsPath),
        'relation props added',
        config.options.propertyName,
      ),
    );
    logs.push(
      logUpdatedRelation(
        `${toPascalCase(baseModule)} domain`,
        path.relative(cwd, baseDomainPath),
        'relation getter added',
        config.options.propertyName,
      ),
    );
    logs.push(
      logUpdatedRelation(
        `${toPascalCase(baseModule)} mapper`,
        path.relative(cwd, baseMapperPath),
        'relation mapping added',
        config.options.propertyName,
      ),
    );

    // Domain/props/mapper updates for inverse side
    if (config.options.bidirectional && config.options.inversePropertyName) {
      const inverseType = getInverseRelationType(config.relationType);
      const targetDomainDir = path.join(cwd, 'src', 'api', targetModule, 'domain');
      const targetPropsPath = path.join(targetDomainDir, `${targetModule}.type.ts`);
      const targetDomainPath = path.join(targetDomainDir, `${targetModule}.domain.ts`);
      const targetMapperPath = path.join(
        cwd,
        'src',
        'api',
        targetModule,
        'infrastructure',
        `${targetModule}.mapper.ts`,
      );
      const targetDtoPath = path.join(
        cwd,
        'src',
        'api',
        targetModule,
        'presentation',
        'command',
        'dto',
        `create-${targetModule}.dto.ts`,
      );
      const targetCommandPath = path.join(
        cwd,
        'src',
        'api',
        targetModule,
        'application',
        'command',
        'action',
        `create-${targetModule}.command.ts`,
      );

      const baseDomainImportPath = normalizeImportPath(
        targetDomainDir,
        path.join(cwd, 'src', 'api', baseModule, 'domain', `${baseModule}.domain.ts`),
      );
      const baseMapperImportPath = normalizeImportPath(
        path.join(cwd, 'src', 'api', targetModule, 'infrastructure'),
        path.join(cwd, 'src', 'api', baseModule, 'infrastructure', `${baseModule}.mapper.ts`),
      );

      const baseDomainName = toPascalCase(baseModule);
      updateRelationProps(
        targetPropsPath,
        targetModule,
        inverseType,
        config.options.inversePropertyName,
        baseDomainName,
        baseDomainImportPath,
        config.options.fkColumn,
      );
      updateDomainGetter(
        targetDomainPath,
        config.options.inversePropertyName,
        inverseType,
        baseDomainName,
        baseDomainImportPath,
      );
      updateMapper(
        targetMapperPath,
        config.options.inversePropertyName,
        inverseType,
        `${baseDomainName}Mapper`,
        baseMapperImportPath,
        config.options.fkColumn,
      );
      if (inverseType === RelationCategory.MANY_TO_ONE || inverseType === RelationCategory.ONE_TO_ONE) {
        const fkPropName = toCamelCase(config.options.fkColumn);
        updateCreateDto(targetDtoPath, fkPropName);
        updateCreateCommand(targetCommandPath, fkPropName);
      }
      logs.push(
        logUpdatedRelation(
          `${targetEntity} inverse`,
          path.relative(cwd, targetPath),
          'relation added',
          getDecoratorName(inverseTypeForLog),
        ),
      );
      logs.push(
        logUpdatedRelation(
          `${toPascalCase(targetModule)} props`,
          path.relative(cwd, targetPropsPath),
          'relation props added',
          config.options.inversePropertyName,
        ),
      );
      logs.push(
        logUpdatedRelation(
          `${toPascalCase(targetModule)} domain`,
          path.relative(cwd, targetDomainPath),
          'relation getter added',
          config.options.inversePropertyName,
        ),
      );
      logs.push(
        logUpdatedRelation(
          `${toPascalCase(targetModule)} mapper`,
          path.relative(cwd, targetMapperPath),
          'relation mapping added',
          config.options.inversePropertyName,
        ),
      );
    }

    fs.writeFileSync(basePath, updatedBase, { encoding: 'utf8' });
    fs.writeFileSync(targetPath, updatedTarget, { encoding: 'utf8' });

    if (logs.length) logs.forEach((msg) => spinner.succeed(msg));
    else spinner.succeed('Relation generation completed');
  } catch (error: unknown) {
    spinner.fail(logFailure(`${baseModule} relation`));
    throw error;
  }
};
