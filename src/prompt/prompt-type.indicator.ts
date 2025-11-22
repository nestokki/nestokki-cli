import { GenerationCategory } from '../common/enum';

export const getGenerationTypeChoices = (): { name: string; value: string }[] => {
  return [
    { name: 'API Module', value: GenerationCategory.API },
    { name: 'Config Module', value: GenerationCategory.CONFIG },
  ];
};

export const getApiFileTypeChoices = (
  category: GenerationCategory,
): { name: string; value: string; checked?: boolean }[] | void => {
  switch (category) {
    case GenerationCategory.API:
      return [
        { name: 'Module (api)', value: 'api-module', checked: true },
        { name: 'Module (feature)', value: 'feature-module' },
        { name: 'Entity (infrastructure)', value: 'entity' },
        { name: 'Mapper (infrastructure)', value: 'mapper' },
        { name: 'Repository (infrastructure)', value: 'repository' },
        { name: 'Domain (domain)', value: 'domain' },
        { name: 'Service (domain)', value: 'service' },
        { name: 'UseCase (application)', value: 'use-case' },
        { name: 'Controller (presentation)', value: 'controller' },
      ];
    case GenerationCategory.CONFIG:
      return [
        { name: 'Module', value: 'module', checked: true },
        { name: 'database (config)', value: 'database' },
        { name: 'jwt (config)', value: 'jwt' },
        { name: 'bcrypt (config)', value: 'bcrypt' },
      ];
    default:
      return;
  }
};
