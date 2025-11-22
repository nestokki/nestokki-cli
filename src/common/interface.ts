import { GenerationCategory, LayerCategory, OrmCategory } from './enum';

export interface Choices {
  name: string;
  value: string;
}

export interface CheckableChoices extends Choices {
  checked?: boolean | undefined;
}

export interface SelectedChoices {
  value: string;
  name: string;
  short: string;
  checkedName: string;
  disabled: boolean;
  checked: boolean;
}

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
