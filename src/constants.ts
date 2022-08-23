import { SkillCategory } from '../utils';
import { Item } from '../utils';

const constants: {
  jobs: { id: number; en: string; ja: string; ens: string; jas: string }[];
  slots: { id: number; en: string; ja: string }[];
  skills: { id: number; en: string; ja: string; index: number; category: SkillCategory }[];
} = require('./constants.json');

// 0:なし と 23:モンストロス を除外
export const jobs = constants.jobs.slice(1, -1);

export const slots = constants.slots;

export const skills = constants.skills.filter(
  skill =>
    (skill.category === 'Combat' && !['回避', '受け流し', 'ガード'].includes(skill.ja)) ||
    ['管楽器', '弦楽器', '風水鈴'].includes(skill.ja)
);

const data: Item[] = require('./items.json');

export const normalize = (s: string): string =>
  s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

export const items = data.map(item => ({
  ...item,
  description: normalize(item.description),
  name: normalize(item.name),
}));
