import {
  GenerationCategory,
  LayerCategory,
  OnDeleteCategory,
  RelationCategory,
} from '../common/enum';
import { CheckableChoices, Choices } from '../common/interface';

export const getGenerationTypeChoices = (): Choices[] => {
  return [
    { name: 'Feature Module', value: GenerationCategory.FEATURE },
    { name: 'Entity Relation', value: GenerationCategory.RELATION },
  ];
};

export const getFeatureLayerTypeChoices = (domainName: string): CheckableChoices[] => {
  return [
    { name: `Module (api, ${domainName})`, value: LayerCategory.MODULE, checked: true },
    { name: 'Domain (type, domain, service)', value: LayerCategory.DOMAIN },
    { name: 'Infrastructure (entity, mapper, repository)', value: LayerCategory.INFRASTRUCTURE },
    { name: 'Application (command-action, query, use-case)', value: LayerCategory.APPLICATION },
    {
      name: 'Presentation (command-dto, query-dto, controller)',
      value: LayerCategory.PRESENTATION,
    },
  ];
};

export const getRelationBaseModuleChoices = (modules: string[]): CheckableChoices[] => {
  return modules.map((module) => ({ name: module, value: module }));
};

export const getRelationTargetModuleChoices = (modules: string[], base: string): Choices[] => {
  return modules
    .filter((module) => module !== base)
    .map((target) => ({ name: target, value: target }));
};

export const getRelationTypeChoices = (): Choices[] => {
  return [
    { name: 'ManyToOne', value: RelationCategory.MANY_TO_ONE },
    { name: 'OneToMany', value: RelationCategory.ONE_TO_MANY },
    { name: 'OneToOne', value: RelationCategory.ONE_TO_ONE },
  ];
};

export const getOnDeleteChoices = (): Choices[] => {
  return [
    { name: 'CASCADE', value: OnDeleteCategory.CASCADE },
    { name: 'SET NULL', value: OnDeleteCategory.SET_NULL },
    { name: 'RESTRICT', value: OnDeleteCategory.RESTRICT },
  ];
};

// export const getDatabaseOrmTypeChoices = (): CheckableChoices[] => {
//   return [
//     { name: 'Module (database)', value: OrmCategory.MODULE, checked: true },
//     { name: 'typeorm (options-factory)', value: OrmCategory.TYPEORM },
//     { name: 'prisma (options-factory)', value: OrmCategory.PRISMA },
//   ];
// };

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
