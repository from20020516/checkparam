import { Job } from './const';
import { createBrowserHistory } from 'history';
import { ParsedUrlQuery } from 'querystring';

export type Condition = {
  job_flags: number;
  text: string;
  minLevel: number;
  types: Set<string>;
};

type action = (cond: Condition) => Condition;

export function Reducer(cond: Condition, act: action): Condition {
  return act(cond);
}

export function SetText(s: string): action {
  return (cond: Condition): Condition => ({ ...cond, text: s });
}

export function SetJob(bits: number): action {
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

export function SetType(name: string): action {
  return (cond: Condition): Condition => ({
    ...cond,
    types: toggle(cond.types, name),
  });
}

export function SetMinLevel(level: number): action {
  return (cond: Condition): Condition => ({
    ...cond,
    minLevel: level,
  });
}

export const Reset: action = () => Initial();

export function Initial(): Condition {
  return {
    job_flags: 0,
    minLevel: 0,
    text: '',
    types: new Set(),
  };
}

export const StoreParam = (cond: Condition): void => {
  createBrowserHistory().push({
    search: encode(cond).toString(),
  });
};

export const LoadParam = (query: ParsedUrlQuery): Condition => {
  return decode(query as any);
};

export const jobNames = (cond: Condition, sep = ' '): string => {
  return Job.filter(x => (1 << x.id) & cond.job_flags)
    .map(x => x.jas)
    .join(sep);
};

const typeNames = (cond: Condition, sep = ' '): string => {
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

const decodeFlags = (s: string, table: Map<string, number>, sep = ' '): number => {
  return s
    .split(sep)
    .map(x => table.get(x))
    .filter((id): id is number => typeof id === 'number')
    .reduce((acc, id) => acc | (1 << id), 0);
};

const decodeSet = (s: string, sep = ' '): Set<string> => {
  return s
    .split(sep)
    .filter(t => t !== '')
    .reduce((acc, x) => acc.add(x), new Set<string>());
};

const jobID = Job.reduce((acc, x) => acc.set(x.jas, x.id), new Map());

const decode = (p: ParsedUrlQuery): Condition => {
  const { t, job, minLevel, type } = p
  return {
    text: String(t ?? ''),
    job_flags: decodeFlags(String(job ?? ''), jobID),
    minLevel: Number(minLevel ?? 0),
    types: decodeSet(String(type ?? ''))
  };
};
