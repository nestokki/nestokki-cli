import { GenerationCategory, LayerCategory, OrmCategory } from '../common/enum';
import { CheckableChoices, Choices } from '../common/interface';

export const getGenerationTypeChoices = (): Choices[] => {
  return [
    {
      name: 'Database Module (requires dependency e.g. @nestjs/typeorm )',
      value: GenerationCategory.DATABASE,
    },
    {
      name: 'Feature Module (requires dependency e.g. @nestjs/typeorm, typeorm)',
      value: GenerationCategory.FEATURE,
    },
  ];
};

export const getDatabaseOrmTypeChoices = (): CheckableChoices[] => {
  return [
    { name: 'Module (database)', value: OrmCategory.MODULE, checked: true },
    { name: 'typeorm (options-factory)', value: OrmCategory.TYPEORM },
    { name: 'prisma (options-factory)', value: OrmCategory.PRISMA },
  ];
};

export const getFeatureLayerTypeChoices = (domainName: string): CheckableChoices[] => {
  return [
    { name: `Module (api, ${domainName})`, value: LayerCategory.MODULE, checked: true },
    { name: 'Domain (domain, props, service)', value: LayerCategory.DOMAIN },
    { name: 'Infrastructure (entity, mapper, repository)', value: LayerCategory.INFRASTRUCTURE },
    { name: 'Application (use-case)', value: LayerCategory.APPLICATION },
    { name: 'Presentation (controller)', value: LayerCategory.PRESENTATION },
  ];
};

// export const getFeatureLayerTypeChoices = (): {
//   name: string;
//   value: string;
//   checked?: boolean;
// }[] => {
//   return [
//     { name: 'Module (api)', value: 'api-module', checked: true },
//     { name: 'Module (feature)', value: 'feature-module' },
//     { name: 'Entity (infrastructure)', value: 'entity' },
//     { name: 'Mapper (infrastructure)', value: 'mapper' },
//     { name: 'Repository (infrastructure)', value: 'repository' },
//     { name: 'Domain (domain)', value: 'domain' },
//     { name: 'Service (domain)', value: 'service' },
//     { name: 'UseCase (application)', value: 'use-case' },
//     { name: 'Controller (presentation)', value: 'controller' },
//   ];
// };

// export const getApiFileTypeChoices = (
//   category: GenerationCategory,
// ): { name: string; value: string; checked?: boolean }[] | void => {
//   switch (category) {
//     case GenerationCategory.FEATURE:
//       return [
//         { name: 'Module (api)', value: 'api-module', checked: true },
//         { name: 'Module (feature)', value: 'feature-module' },
//         { name: 'Entity (infrastructure)', value: 'entity' },
//         { name: 'Mapper (infrastructure)', value: 'mapper' },
//         { name: 'Repository (infrastructure)', value: 'repository' },
//         { name: 'Domain (domain)', value: 'domain' },
//         { name: 'Service (domain)', value: 'service' },
//         { name: 'UseCase (application)', value: 'use-case' },
//         { name: 'Controller (presentation)', value: 'controller' },
//       ];
//     case GenerationCategory.CONFIG:
//       return [
//         { name: 'Module', value: 'module', checked: true },
//         { name: 'database (config)', value: 'database' },
//         { name: 'jwt (config)', value: 'jwt' },
//         { name: 'bcrypt (config)', value: 'bcrypt' },
//       ];
//     default:
//       return;
//   }
// };
