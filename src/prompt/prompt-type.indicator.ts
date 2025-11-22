import { GenerationCategory, LayerCategory } from '../common/enum';

export const getGenerationTypeChoices = (): { name: string; value: string }[] => {
  return [
    { name: 'Feature Module', value: GenerationCategory.FEATURE },
    { name: 'Config Module', value: GenerationCategory.CONFIG },
  ];
};

export const getFeatureLayerTypeChoices = (): {
  name: string;
  value: string;
  checked?: boolean;
}[] => {
  return [
    { name: 'Module (api, feature)', value: LayerCategory.MODULE, checked: true },
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
