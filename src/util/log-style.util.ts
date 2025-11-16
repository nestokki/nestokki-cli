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

export const logSuccess = (domainName: string, fileTypes: string[]): void => {
  console.log(`\n🚀 Successfully created files for 👉 ${domainName}`);
  console.log(`😀 Files you generate: [ ${fileTypes.join(', ')} ]\n`);
};

export const logError = (error: unknown): void => {
  const description = chalk.red('Unexpected error while running prompt:');
  console.error(`❌ ${description}\n`, error);
};
