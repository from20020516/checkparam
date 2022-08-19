import { Item } from '../utils';
import { TableColumn } from 'react-data-table-component';
import { propValue } from './query';

export function Extra(name: string): TableColumn<Item> {
  const extract = propValue(name);
  return {
    name: name,
    selector: row => extract(row) ?? 0,
    sortable: true,
    width: '10em',
  };
}

export const PropName = (word: string): string => word.replace(/[><=]+[-+]?\d+$/, '');

type Comparator<T> = (a: T, b: T) => number;

export const Sorter = (props: string[]): Comparator<Item> => {
  return (a: Item, b: Item): number => {
    for (const prop of props) {
      const valueOf = propValue(prop);
      const lhs = valueOf(a) ?? 0;
      const rhs = valueOf(b) ?? 0;
      if (lhs > rhs) {
        return -1;
      }
      if (lhs < rhs) {
        return 1;
      }
    }
    return 0;
  };
};
