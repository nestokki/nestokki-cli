import chalk from 'chalk';

export const logFailure = (name: string): string => {
  const status = chalk.red.bold('FAILED');
  const targetName = chalk.blueBright(name);
  return `${status} to generate ${targetName}`;
};

export const logConflictError = (name: string, relativePath: string): string => {
  const status = chalk.red.bold('FAILED');
  const targetName = chalk.blueBright(name);
  const description = chalk.red('already exists');
  const targetPath = chalk.gray(relativePath);
  return `${status} ${targetName} ${description} ${targetPath}`;
};

export const logCreated = (name: string, relativePath: string): string => {
  const status = chalk.green.bold('CREATED');
  const targetName = chalk.blueBright(name);
  const targetPath = chalk.gray(relativePath);
  return `${status} ${targetName} ${targetPath}`;
};

export const logSkipped = (name: string, relativePath: string): string => {
  const status = chalk.magenta.bold('SKIPPED');
  const targetName = chalk.blueBright(name);
  const description = chalk.magenta('already generated');
  const targetPath = chalk.gray(relativePath);
  return `${status} ${targetName} ${description} ${targetPath}`;
};

export const logSkippedApi = (names: string[], relativePath: string): string => {
  const status = chalk.magenta.bold('SKIPPED');
  const targetName = [chalk.blueBright(names[0]), chalk.blueBright(names[1])];
  const description = chalk.magenta('already registered in');
  const targetPath = chalk.gray(relativePath);
  return `${status} ${targetName[0]} ${description} ${targetName[1]} ${targetPath}`;
};

export const logUpdated = (names: string[], relativePath: string): string => {
  const status = chalk.yellow.bold('UPDATED');
  const targetName = [chalk.blueBright(names[0]), chalk.blueBright(names[1])];
  const description = chalk.yellow('with');
  const targetPath = chalk.gray(relativePath);
  return `${status} ${targetName[0]} ${description} ${targetName[1]} ${targetPath}`;
};

export const logSuccess = (domainName: string, fileTypes: string[]): void => {
  console.log(`\n🚀 Successfully created files for 👉 ${domainName}`);
  console.log(`😀 Files you generate: [ ${fileTypes.join(', ')} ]\n`);
};

export const logError = (message: string): void => {
  console.error(message);
};

export const logUnhandledError = (error: unknown): void => {
  const description = chalk.red('Unexpected error while running prompt:');
  console.error(`❌ ${description}\n`, error);
};
