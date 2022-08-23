import { Item } from '../utils';
import { Condition } from './condition';
import { normalize } from './constants';

export function Apply(cond: Condition, item: Item[]): Item[] {
  const f = new FilterSet(cond);
  return item.filter(x => f.accept(x));
}

interface FilterInterface {
  accept(item: Item): boolean;
}

class AllOK implements FilterInterface {
  accept(item: Item): boolean {
    return true;
  }
}

const allOK = new AllOK();

class FilterSet implements FilterInterface {
  private fs: FilterInterface[];

  constructor(cond: Condition) {
    this.fs = [
      ...cond.text.split(/\s/).map(x => textFilter(x)),
      cond.job_flags ? jobFilter(cond.job_flags) : allOK,
      kindFilter(cond),
      cond.minLevel ? minLevelFilter(cond.minLevel) : allOK,
    ];
  }

  accept(item: Item): boolean {
    return this.fs.every((p: FilterInterface) => p.accept(item));
  }
}

function textFilter(raw: string): FilterInterface {
  const word = normalize(raw);
  const gte = word.match(/^(.*)>=([-+]?\d+)$/);
  if (gte) {
    const prop = propValue(gte[1]);
    const threshold = Number(gte[2]);
    return new Filter(prop, x => x >= threshold);
  }
  const gt = word.match(/^(.*)>([-+]?\d+)$/);
  if (gt) {
    const prop = propValue(gt[1]);
    const threshold = Number(gt[2]);
    return new Filter(prop, x => x > threshold);
  }
  const lte = word.match(/^(.*)<=([-+]?\d+)$/);
  if (lte) {
    const prop = propValue(lte[1]);
    const threshold = Number(lte[2]);
    return new Filter(prop, x => x <= threshold);
  }
  const lt = word.match(/^(.*)<([-+]?\d+)$/);
  if (lt) {
    const prop = propValue(lt[1]);
    const threshold = Number(lt[2]);
    return new Filter(prop, x => x < threshold);
  }
  const eq = word.match(/^(.*)=([-+]?\d+)$/);
  if (eq) {
    const prop = propValue(eq[1]);
    const value = Number(eq[2]);
    return new Filter(prop, x => x === value);
  }
  return new Filter(wholeText, x => x.toLowerCase().includes(word.toLowerCase()));
}

type extractor<T> = (item: Item) => T | null;

class Filter<T> implements FilterInterface {
  extract: extractor<T>;
  f: (x: T) => boolean;
  constructor(ext: extractor<T>, f: (x: T) => boolean) {
    this.extract = ext;
    this.f = f;
  }

  accept(item: Item): boolean {
    const x = this.extract(item);
    return x ? this.f(x) : false;
  }
}

class Or implements FilterInterface {
  f: FilterInterface;
  g: FilterInterface;

  constructor(f: FilterInterface, g: FilterInterface) {
    this.f = f;
    this.g = g;
  }
  accept(item: Item): boolean {
    return this.f.accept(item) || this.g.accept(item);
  }
}

export function propValue(prop: string): extractor<number> {
  const re = new RegExp(`(^|\\s)${prop}([-+]?\\d+)`, 'i');
  return (item: Item) => {
    const x = item.description.match(re);
    return x ? Number(x[2]) : null;
  };
}

const wholeText: extractor<string> = (item: Item) => [item.name, item.description].join();

function jobFilter(job_flags: number): Filter<number> {
  return new Filter(
    item => item._jobs,
    that => (that & job_flags) > 0
  );
}

function slotFilter(slot_flags: number): Filter<number> {
  return new Filter(
    item => item._slots,
    that => (that & slot_flags) > 0
  );
}

function skillFilter(skill: Set<number>): Filter<number> {
  return new Filter(
    item => item.skill,
    id => (skill.size > 0 ? skill.has(id) : true)
  );
}

function minLevelFilter(level: number): Filter<number> {
  return new Filter(
    item => (item.item_level > 0 ? item.item_level : item.level),
    that => that >= level
  );
}

function kindFilter(cond: Condition): FilterInterface {
  if (cond.slot_flags && cond.skill.size > 0) {
    return new Or(slotFilter(cond.slot_flags), skillFilter(cond.skill));
  }
  if (cond.slot_flags) {
    return slotFilter(cond.slot_flags);
  }
  if (cond.skill.size > 0) {
    return skillFilter(cond.skill);
  }
  return allOK;
}
