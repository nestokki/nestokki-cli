import { GenerationCategory } from './enum';

export interface GenerationType {
  generationType: GenerationCategory;
}

export interface DomainName {
  domainName: string;
}

export interface ApiFileType {
  apiFileTypes: string[];
}
