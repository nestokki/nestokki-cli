import { GenerationCategory, LayerCategory } from './enum';

export interface GenerationType {
  generationType: GenerationCategory;
}

export interface InputDomainNameResponse {
  domainName: string;
}

export interface SelectLayerTypeResponse {
  layerTypeList: LayerCategory[];
}
