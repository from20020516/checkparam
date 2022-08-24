import { Job } from './const';
import { createBrowserHistory } from 'history';

export type Condition = {
  job_flags: number;
  text: string;
  minLevel: number;
  types: Set<string>;
};

export type Action = (cond: Condition) => Condition;

export function Reducer(cond: Condition, action: Action): Condition {
  return action(cond);
}

export function SetText(s: string): Action {
  return (cond: Condition): Condition => ({ ...cond, text: s });
}

export function SetJob(bits: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    job_flags: cond.job_flags ^ (1 << bits) /** 指定ジョブのbitを反転させる */,
  });
}

const toggle = <T>(xs: Set<T>, x: T): Set<T> => {
  const ret = new Set(xs);
  ret.has(x) ? ret.delete(x) : ret.add(x);
  return ret;
};

export function SetType(name: string): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    types: toggle(cond.types, name),
  });
}

export function SetMinLevel(level: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    minLevel: level,
  });
}

export const Reset: Action = () => Initial();

export function Initial(): Condition {
  return {
    job_flags: 0,
    minLevel: 0,
    text: '',
    types: new Set(),
  };
}

const sep = ' ';
const jobNames = (cond: Condition): string => {
  return Job.filter(x => (1 << x.id) & cond.job_flags)
    .map(x => x.jas)
    .join(sep);
};

const typeNames = (cond: Condition): string => {
  const tmp: string[] = [];
  cond.types.forEach(x => {
    tmp.push(x);
  });
  return tmp.join(sep);
};

const encode = (cond: Condition): URLSearchParams => {
  const p: { [index: string]: string } = {
    t: cond.text,
    job: jobNames(cond),
    minLevel: cond.minLevel ? String(cond.minLevel) : '',
    type: typeNames(cond),
  };
  const ret = new URLSearchParams();
  Object.keys(p)
    .filter(key => p[key] !== '')
    .forEach(key => {
      ret.append(key, p[key]);
    });
  return ret;
};

const decodeFlags = (s: string, table: Map<string, number>): number => {
  return s
    .split(sep)
    .map(x => table.get(x))
    .filter((id): id is number => typeof id === 'number')
    .reduce((acc, id) => acc | (1 << id), 0);
};

const decodeSet = (s: string): Set<string> => {
  return s
    .split(sep)
    .filter(t => t !== '')
    .reduce((acc, x) => acc.add(x), new Set<string>());
};

const jobID = Job.reduce((acc, x) => acc.set(x.jas, x.id), new Map());

const decode = (p: URLSearchParams): Condition => {
  return {
    text: p.get('t') ?? '',
    job_flags: decodeFlags(p.get('job') ?? '', jobID),
    minLevel: Number(p.get('minLevel')),
    types: decodeSet(p.get('type') ?? ''),
  };
};

export const StoreParam = (cond: Condition): void => {
  createBrowserHistory().push({
    search: encode(cond).toString(),
  });
};
export const LoadParam = (): Condition => {
  return decode(new URLSearchParams(document.location.search));
};
