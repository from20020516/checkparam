import { Item } from "../utils";

export type Condition = {
  job_flags: number;
  slot_flags: number;
  skill: number;
  text: string;
  minLevel: number;
};

interface Predicate {
  accept(item: Item): boolean;
}

export function initial(): Condition {
  return {
    job_flags: 0,
    slot_flags: 0,
    skill: 0,
    minLevel: 0,
    text: ""
  };
}

export class Query {
  private ps: Predicate[];

  constructor(cond: Condition) {
    this.ps = cond.text.split(/\s/).map(x => textQuery(x)) ?? [];
    if (cond.job_flags) {
      this.ps.push(jobQuery(cond.job_flags));
    }
    if (cond.slot_flags) {
      this.ps.push(slotQuery(cond.slot_flags));
    }
    if (cond.skill) {
      this.ps.push(skillQuery(cond.skill));
    }
    if (cond.minLevel) {
      this.ps.push(minLevelQuery(cond.minLevel));
    }
  }

  accept(item: Item): boolean {
    return this.ps.every((p: Predicate) => p.accept(item));
  }
}

function textQuery(word: string): Predicate {
  const gte = word.match(/^(.*)>=([-+]?\d+)$/);
  if (gte) {
    const ext = propValue(gte[1]);
    const threshold = Number(gte[2]);
    return new Matcher(ext, x => x >= threshold);
  }
  const gt = word.match(/^(.*)>([-+]?\d+)$/);
  if (gt) {
    const ext = propValue(gt[1]);
    const threshold = Number(gt[2]);
    return new Matcher(ext, x => x > threshold);
  }
  const lte = word.match(/^(.*)<=([-+]?\d+)$/);
  if (lte) {
    const ext = propValue(lte[1]);
    const threshold = Number(lte[2]);
    return new Matcher(ext, x => x <= threshold);
  }
  const lt = word.match(/^(.*)<([-+]?\d+)$/);
  if (lt) {
    const ext = propValue(lt[1]);
    const threshold = Number(lt[2]);
    return new Matcher(ext, x => x < threshold);
  }
  const eq = word.match(/^(.*)=([-+]?\d+)$/);
  if (eq) {
    const ext = propValue(eq[1]);
    const value = Number(eq[2]);
    return new Matcher(ext, x => x === value);
  }
  return new Matcher(wholeText, x => x.includes(word));
}

type extractor<T> = (item: Item) => T | null;

class Matcher<T> {
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

export function propValue(prop: string): extractor<number> {
  const re = new RegExp(`(^|\\s)${prop}([-+]\\d+)`);
  return (item: Item) => {
    const x = item.description.match(re);
    return x ? Number(x[2]) : null;
  };
}

const wholeText: extractor<string> = (item: Item) =>
  [item.name, item.description].join();

function jobQuery(job_flags: number): Matcher<number> {
  return new Matcher(
    item => item._jobs,
    that => (that & job_flags) > 0
  );
}

function slotQuery(slot_flags: number): Matcher<number> {
  return new Matcher(
    item => item._slots,
    that => (that & slot_flags) > 0
  );
}

function skillQuery(skill: number): Matcher<number> {
  return new Matcher(
    item => item.skill,
    id => ((1 << id) & skill) > 0
  );
}

function minLevelQuery(level: number): Matcher<number> {
  return new Matcher(
    item => item.item_level ?? item.level,
    that => that >= level
  );
}
