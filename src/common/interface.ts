import { GenerationCategory, LayerCategory, OrmCategory } from './enum';

export interface GenerationType {
  generationType: GenerationCategory;
}

export interface SelectOrmTypeResponse {
  ormTypeList: OrmCategory[];
}

export interface InputDomainNameResponse {
  domainName: string;
}

export interface SelectLayerTypeResponse {
  layerTypeList: LayerCategory[];
}
