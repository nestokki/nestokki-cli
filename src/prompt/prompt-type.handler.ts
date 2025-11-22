import inquirer from 'inquirer';
import { getFeatureLayerTypeChoices, getGenerationTypeChoices } from './prompt-type.indicator';
import {
  InputDomainNameResponse,
  SelectLayerTypeResponse,
  GenerationType,
} from '../common/interface';
import { LayerCategory } from '../common/enum';

export const handleGenerationType = async (): Promise<GenerationType> => {
  return await inquirer.prompt<GenerationType>([
    {
      type: 'list',
      name: 'generationType',
      message: 'What would you like to generate?',
      choices: getGenerationTypeChoices(),
      validate: (choices: string[]) => {
        if (!choices.length) return '😥 You must select at least one generation type.';
        return true;
      },
    },
  ]);
};

export const handleFeatureDomainName = async (): Promise<InputDomainNameResponse> => {
  const kebabRegex = /^[a-z][a-z0-9-]*$/;

  return await inquirer.prompt<InputDomainNameResponse>([
    {
      type: 'input',
      name: 'domainName',
      message: 'Enter the domain name to generate (kebab-case only):',
      validate: (input: string) => {
        if (!input.trim()) return '😥 Domain name is required.';
        if (!kebabRegex.test(input.trim())) return '😥 Kebab-case only. (e.g. user, board-comment)';
        return true;
      },
    },
  ]);
};

export const handleFeatureLayerType = async (): Promise<SelectLayerTypeResponse> => {
  const required = LayerCategory.MODULE;

  return await inquirer.prompt<SelectLayerTypeResponse>([
    {
      type: 'checkbox',
      name: 'layerTypeList',
      message: 'Which file would you like to generate?',
      loop: false,
      choices: getFeatureLayerTypeChoices(),
      validate: (choices: string[]) => {
        if (!choices.length) return '😥 You must select at least one file type.';
        if (!choices.includes(required)) return '😥 Module (api, feature) is a required selection.';
        return true;
      },
    },
  ]);
};
