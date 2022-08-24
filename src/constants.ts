import { Item, SkillCategory } from '../utils';
import { Condition } from './condition';

const constants: {
  jobs: { id: number; en: string; ja: string; ens: string; jas: string }[];
  slots: { id: number; en: string; ja: string }[];
  skills: {
    id: number;
    en: string;
    ja: string;
    index: number;
    category: SkillCategory;
  }[];
} = require('./constants.json');

// 0:なし と 23:モンストロス を除外
export const jobs = constants.jobs.slice(1, -1);

export const slots = constants.slots.filter(x => x.id > 0);

export const skills = constants.skills.filter(
  skill =>
    (skill.category === 'Combat' &&
      !['回避', '受け流し', 'ガード'].includes(skill.ja)) ||
    ['管楽器', '弦楽器', '風水鈴'].includes(skill.ja)
);

const data: Item[] = require('./items.json');

export const normalize = (s: string): string =>
  s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );

export const items = data.map(item => ({
  ...item,
  description: normalize(item.description),
  name: normalize(item.name),
}));

const sep = ' ';

const jobNames = (cond: Condition): string => {
  return jobs
    .filter(x => (1 << x.id) & cond.job_flags)
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

export const Encode = (cond: Condition): URLSearchParams => {
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

const intoSet = (s: string): Set<string> => {
  return s
    .split(sep)
    .filter(t => t !== '')
    .reduce((acc, x) => acc.add(x), new Set<string>());
};

export const Decode = (p: URLSearchParams): Condition => {
  return {
    text: p.get('t') ?? '',
    job_flags: decodeFlags(p.get('job') ?? '', Repository.job),
    minLevel: Number(p.get('minLevel')),
    types: intoSet(p.get('type') ?? ''),
  };
};

export const Repository = {
  job: jobs.reduce((acc, x) => acc.set(x.jas, x.id), new Map()),
  skill: skills.reduce((acc, x) => acc.set(x.ja, x.id), new Map()),
  slot: slots.reduce((acc, x) => acc.set(x.ja, x.id), new Map()),
};
