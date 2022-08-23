import { Item } from '../utils';
import { Condition } from './condition';
import { normalize } from './constants';

type Filter = (item: Item) => boolean;

export function Apply(cond: Condition, item: Item[]): Item[] {
  return item.filter(FilterSet(cond));
}

const FilterSet = (cond: Condition): Filter =>
  composeAnd(
    [
      cond.text
        .split(/\s/)
        .filter(x => x !== '')
        .map(x => textFilter(x)),
      [jobFilter(cond)],
      [typeFilter(cond)],
      [levelFilter(cond)],
    ].flatMap(xs => xs)
  );

const composeAnd = (fs: Filter[]): Filter => {
  return (item: Item): boolean => fs.every(accept => accept(item));
};
const composeOr = (fs: Filter[]): Filter => {
  return (item: Item): boolean => fs.some(accept => accept(item));
};

type extractor<T> = (item: Item) => T | null;

const composeExtract = <T>(ext: extractor<T>, f: (x: T) => boolean): Filter => {
  return (item: Item): boolean => {
    const x = ext(item);
    return x ? f(x) : false;
  };
};

const acceptAlways = () => true;

const textFilter = (raw: string): Filter => {
  const word = normalize(raw);
  const gte = word.match(/^(.*)>=([-+]?\d+)$/);
  if (gte) {
    const prop = propValue(gte[1]);
    const threshold = Number(gte[2]);
    return composeExtract(prop, x => x >= threshold);
  }
  const gt = word.match(/^(.*)>([-+]?\d+)$/);
  if (gt) {
    const prop = propValue(gt[1]);
    const threshold = Number(gt[2]);
    return composeExtract(prop, x => x > threshold);
  }
  const lte = word.match(/^(.*)<=([-+]?\d+)$/);
  if (lte) {
    const prop = propValue(lte[1]);
    const threshold = Number(lte[2]);
    return composeExtract(prop, x => x <= threshold);
  }
  const lt = word.match(/^(.*)<([-+]?\d+)$/);
  if (lt) {
    const prop = propValue(lt[1]);
    const threshold = Number(lt[2]);
    return composeExtract(prop, x => x < threshold);
  }
  const eq = word.match(/^(.*)=([-+]?\d+)$/);
  if (eq) {
    const prop = propValue(eq[1]);
    const value = Number(eq[2]);
    return composeExtract(prop, x => x === value);
  }
  const not = word.match(/^-(.*)$/);
  if (not) {
    const val = not[1];
    return composeExtract(wholeTextLowerCase, lc => !lc.includes(val.toLowerCase()));
  }
  return composeExtract(wholeTextLowerCase, lc => lc.includes(word.toLowerCase()));
};

const jobFilter = (cond: Condition): Filter =>
  cond.job_flags > 0
    ? composeExtract(
        item => item._jobs,
        that => (that & cond.job_flags) > 0
      )
    : acceptAlways;

const typeFilter = (cond: Condition): Filter => {
  const fs = [
    cond.slot_flags > 0
      ? [
          composeExtract(
            item => item._slots,
            that => (that & cond.slot_flags) > 0
          ),
        ]
      : [],
    cond.skill.size > 0
      ? [
          composeExtract(
            item => item.skill,
            id => cond.skill.has(id)
          ),
        ]
      : [],
  ].flatMap(xs => xs);
  return fs.length > 0 ? composeOr(fs) : acceptAlways;
};

const levelFilter = (cond: Condition): Filter =>
  cond.minLevel
    ? composeExtract(
        item => (item.item_level > 0 ? item.item_level : item.level),
        that => that >= cond.minLevel
      )
    : acceptAlways;

export function propValue(prop: string): extractor<number> {
  const re = new RegExp(`(^|\\s)${prop}([-+]?\\d+)`, 'i');
  return (item: Item) => {
    const x = item.description.match(re);
    return x ? Number(x[2]) : null;
  };
}

const wholeTextLowerCase: extractor<string> = (item: Item) => [item.name, item.description].join().toLowerCase();
