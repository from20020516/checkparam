import { Item } from '../utils';
import { Condition } from './condition';
import { normalize, slots, skills } from './constants';

type Filter = (item: Item) => boolean;

export const Build = (cond: Condition): Filter =>
  every(
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

const every = (fs: Filter[]): Filter => {
  return (item: Item): boolean => fs.every(accept => accept(item));
};

type extractor<T> = (item: Item) => T | null;

const extractAndCheck = <T>(
  ext: extractor<T>,
  f: (x: T) => boolean
): Filter => {
  return (item: Item): boolean => {
    const x = ext(item);
    return x ? f(x) : false;
  };
};

const textFilter = (raw: string): Filter => {
  const word = normalize(raw);
  const gte = word.match(/^(.*)>=([-+]?\d+)$/);
  if (gte) {
    const prop = propValue(gte[1]);
    const threshold = Number(gte[2]);
    return extractAndCheck(prop, x => x >= threshold);
  }
  const gt = word.match(/^(.*)>([-+]?\d+)$/);
  if (gt) {
    const prop = propValue(gt[1]);
    const threshold = Number(gt[2]);
    return extractAndCheck(prop, x => x > threshold);
  }
  const lte = word.match(/^(.*)<=([-+]?\d+)$/);
  if (lte) {
    const prop = propValue(lte[1]);
    const threshold = Number(lte[2]);
    return extractAndCheck(prop, x => x <= threshold);
  }
  const lt = word.match(/^(.*)<([-+]?\d+)$/);
  if (lt) {
    const prop = propValue(lt[1]);
    const threshold = Number(lt[2]);
    return extractAndCheck(prop, x => x < threshold);
  }
  const eq = word.match(/^(.*)=([-+]?\d+)$/);
  if (eq) {
    const prop = propValue(eq[1]);
    const value = Number(eq[2]);
    return extractAndCheck(prop, x => x === value);
  }
  const not = word.match(/^-(.*)$/);
  if (not) {
    const val = not[1];
    return extractAndCheck(
      wholeTextLowerCase,
      lc => !lc.includes(val.toLowerCase())
    );
  }
  return extractAndCheck(wholeTextLowerCase, lc =>
    lc.includes(word.toLowerCase())
  );
};

const acceptAlways = () => true;

const jobFilter = (cond: Condition): Filter =>
  cond.job_flags > 0
    ? extractAndCheck(
        item => item._jobs,
        that => (that & cond.job_flags) > 0
      )
    : acceptAlways;

const slotNames = slots.reduce((acc, s) => acc.set(1 << s.id, s.ja), new Map());
const skillNames = skills.reduce((acc, s) => acc.set(s.id, s.ja), new Map());

const ear1 = 1 << 11;
const ear2 = 1 << 12;
const ring1 = 1 << 13;
const ring2 = 1 << 14;
const ears = ear1 | ear2;
const rings = ring1 | ring2;

const extractType: extractor<string> = (item: Item): string | null => {
  if (item.skill) {
    return skillNames.get(item.skill) ?? null;
  }
  if (item._slots) {
    const slot = item._slots;
    return slot === ears
      ? '耳'
      : slot === rings
      ? '指'
      : slotNames.get(slot) ?? null;
  }
  return null;
};

const typeFilter = (cond: Condition): Filter => {
  return cond.types.size > 0
    ? extractAndCheck(extractType, t => cond.types.has(t))
    : acceptAlways;
};

const levelFilter = (cond: Condition): Filter =>
  cond.minLevel
    ? extractAndCheck(
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

const wholeTextLowerCase: extractor<string> = (item: Item) =>
  [item.name, item.description].join().toLowerCase();
