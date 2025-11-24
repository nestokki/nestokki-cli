export const toPascalCase = (name: string): string => {
  return name
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .split('-')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
};

export const toKebabCase = (name: string): string => {
  return name
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .split('-')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .join('-');
};

export const toSnakeCase = (name: string): string => {
  return name
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .split('-')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .join('_');
};

export const toCamelCase = (name: string): string => {
  return name
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .split('-')
    .filter(Boolean)
    .map((part, i) => {
      const lower = part.toLowerCase();
      return i === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join('');
};

export const toWords = (name: string): string => {
  return name
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .split('-')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .join(' ');
};

export const pluralize = (word: string): string => {
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (word.endsWith('f')) return `${word.slice(0, -1)}ves`;
  if (word.endsWith('fe')) return `${word.slice(0, -2)}ves`;
  return `${word}s`;
};
