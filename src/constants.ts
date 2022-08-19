import { SkillCategory } from '../utils';

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
    ['管楽器', '弦楽器'].includes(skill.ja)
);
