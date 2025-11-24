export enum Commands {
  GENERATE = 'g',
}

export enum GenerationCategory {
  FEATURE = 'feature',
  RELATION = 'relation',
}

export enum LayerCategory {
  MODULE = 'module',
  DOMAIN = 'domain',
  INFRASTRUCTURE = 'infrastructure',
  APPLICATION = 'application',
  PRESENTATION = 'presentation',
}

export enum RelationCategory {
  MANY_TO_ONE = 'manyToOne',
  ONE_TO_MANY = 'oneToMany',
  ONE_TO_ONE = 'oneToOne',
}
export enum OnDeleteCategory {
  CASCADE = 'cascade',
  SET_NULL = 'setNull',
  RESTRICT = 'restrict',
}
