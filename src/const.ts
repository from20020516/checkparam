import { Item, RawItem, Category, SkillCategory } from './types';

const constants: {
  jobs: { id: number; en: string; ja: string; ens: string; jas: string }[];
  skills: {
    id: number;
    en: string;
    ja: string;
    index: number;
    category: SkillCategory;
  }[];
} = require('./constants.json');

export const SlotID = {
  Main: 0,
  Sub: 1 << 1,
  Range: 1 << 2,
  Ammo: 1 << 3,
  Head: 1 << 4,
  Body: 1 << 5,
  Hands: 1 << 6,
  Legs: 1 << 7,
  Feet: 1 << 8,
  Neck: 1 << 9,
  Waist: 1 << 10,
  EarL: 1 << 11,
  EarR: 1 << 12,
  Ear: (1 << 11) | (1 << 12),
  RingL: 1 << 13,
  RingR: 1 << 14,
  Ring: (1 << 13) | (1 << 14),
  Back: 1 << 15,
};

export const SlotName = {
  [SlotID.Head]: '頭',
  [SlotID.Body]: '胴',
  [SlotID.Hands]: '手',
  [SlotID.Legs]: '脚',
  [SlotID.Feet]: '足',
  [SlotID.Neck]: '首',
  [SlotID.Waist]: '腰',
  [SlotID.Ear]: '耳',
  [SlotID.Ring]: '指',
  [SlotID.Back]: '背',
};

// 0:なし と 23:モンストロス を除外
export const Job = constants.jobs.slice(1, -1);

const skills = constants.skills.filter(
  skill =>
    (skill.category === SkillCategory.Combat &&
      !['回避', '受け流し', 'ガード', '投てき'].includes(skill.ja)) ||
    ['管楽器', '弦楽器'].includes(skill.ja)
);

const weapon = skills
  .filter(skill => !['盾', '管楽器', '弦楽器'].includes(skill.ja))
  .map(x => x.ja);

const miscWeapon = {
  Throwing: '投てき',
  Ammo: '矢弾',
  Grip: 'グリップ',
  Wind: '管楽器',
  Stringed: '弦楽器',
} as const;
const shield = '盾';

export const Weapon = [...weapon, ...Object.values(miscWeapon)];

export const Armor = [shield, ...Object.values(SlotName)];

const data: Item[] = require('./items.json');

export const Normalize = (s: string): string =>
  s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );

export const Items = data.map(item => ({
  ...item,
  description: Normalize(item.description),
  name: Normalize(item.name),
}));

const skillName = skills.reduce((acc, s) => acc.set(s.id, s.ja), new Map());

export const ItemType = (item: RawItem): string => {
  if (item.skill) {
    const name = skillName.get(item.skill);
    if (name) {
      return name;
    }
  }
  if (item.slots) {
    switch (item.slots) {
      case SlotID.Sub:
        return item.category === Category.Weapon ? miscWeapon.Grip : shield;
      case SlotID.Range:
        return miscWeapon.Throwing;
      case SlotID.Ammo:
        return miscWeapon.Ammo;
      default:
        return SlotName[item.slots] ?? 'unknown slot';
    }
  }
  return '';
};

const AllJobs = parseInt('11111111111111111111110', 2);

export const JobNames = (flags: number): string => {
  if (flags === AllJobs) {
    return 'All Jobs';
  }
  return Job.filter(x => (1 << x.id) & flags)
    .map(x => x.jas)
    .join('');
};
