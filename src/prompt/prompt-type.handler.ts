import inquirer from 'inquirer';
import { getApiFileTypeChoices, getGenerationTypeChoices } from './prompt-type.indicator';
import { ApiFileType, DomainName, GenerationType } from '../common/interface';
import { GenerationCategory } from '../common/enum';

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

export const handleApiDomainName = async (): Promise<DomainName> => {
  return await inquirer.prompt<DomainName>([
    {
      type: 'input',
      name: 'domainName',
      message: 'Enter the domain name to generate (kebab-case only):',
      validate: (input: string) => {
        if (!input.trim()) return '😥 Domain name is required.';
        if (!/^[a-z][a-z0-9-]*$/.test(input.trim())) {
          return '😥 Kebab-case only. (e.g. user, board-comment)';
        }
        return true;
      },
    },
  ]);
};

export const handleApiFileType = async (category: GenerationCategory): Promise<ApiFileType> => {
  return await inquirer.prompt<ApiFileType>([
    {
      type: 'checkbox',
      name: 'apiFileTypes',
      message: 'Which file would you like to generate?',
      loop: false,
      choices: getApiFileTypeChoices(category),
      validate: (choices: string[]) => {
        if (!choices.length) return '😥 You must select at least one file type.';
        return true;
      },
    },
  ]);
};
