import { GenerationCategory, LayerCategory, OnDeleteCategory, RelationCategory } from './enum';

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

export interface InputDomainNameResponse {
  domainName: string;
}

export interface SelectLayerTypeResponse {
  layerTypeList: LayerCategory[];
}

export interface UpdateOptions {
  addEntity?: boolean;
  addService?: boolean;
  addRepository?: boolean;
}

export interface SelectBaseModuleResponse {
  baseModule: string;
}

export interface SelectTargetModuleResponse {
  targetModule: string;
}

export interface SelectRelationTypeResponse {
  relationType: RelationCategory;
}

export interface RelationOptionsResponse {
  propertyName: string;
  fkColumn: string;
  lazy: boolean;
  nullable: boolean;
  cascade: boolean;
  onDelete: OnDeleteCategory;
  bidirectional: boolean;
  inversePropertyName?: string;
}

export interface RelationConfig {
  baseModule: string;
  targetModule: string;
  relationType: RelationCategory;
  options: RelationOptionsResponse;
}
