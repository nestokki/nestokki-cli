import fs from 'fs';
import path from 'path';

export const getModules = (): string[] => {
  const apiDir = path.join(process.cwd(), 'src', 'api');
  if (!fs.existsSync(apiDir)) return [];

  return fs
    .readdirSync(apiDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((module) => {
      const entityPath = path.join(apiDir, module, 'infrastructure', `${module}.entity.ts`);
      return fs.existsSync(entityPath);
    });
};
