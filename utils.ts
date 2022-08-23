import { parse } from 'lua-json';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { jobs, skills, slots } from './src/constants.json';

export interface RawItem {
  id: number;
  en: string;
  ja: string;
  enl: string;
  jal: string;
  category: Category;
  flags?: number;
  stack?: number;
  targets?: number;
  type?: number;
  cast_time?: number;
  jobs?: number;
  level?: number;
  races?: number;
  slots?: number;
  cast_delay?: number;
  max_charges?: number;
  recast_delay?: number;
  shield_size?: number;
  damage?: number;
  delay?: number;
  skill?: number;
  ammo_type?: AmmoType;
  range_type?: RangeType;
  item_level?: number;
  superior_level?: number;
}
export enum AmmoType {
  Arrow = 'Arrow',
  Bait = 'Bait',
  Bolt = 'Bolt',
  Bullet = 'Bullet',
  Shell = 'Shell',
}
export enum Category {
  Armor = 'Armor',
  Automaton = 'Automaton',
  General = 'General',
  Gil = 'Gil',
  Maze = 'Maze',
  Usable = 'Usable',
  Weapon = 'Weapon',
}
export enum SkillCategory {
  Combat = 'Combat',
  Magic = 'Magic',
  None = 'None',
  Puppet = 'Puppet',
  Synthesis = 'Synthesis',
}
export enum RangeType {
  Bow = 'Bow',
  Cannon = 'Cannon',
  Crossbow = 'Crossbow',
  FishingRod = 'Fishing Rod',
  Gun = 'Gun',
}
export interface Item {
  id: number;
  name: string;
  description: string;
  level: number;
  item_level: number;
  jobs: string;
  _jobs: number;
  _slots: number;
  skill: number;
  type: string;
}

const AllJobs = parseInt('11111111111111111111110', 2);

/**
 * 2進数表記ジョブを文字列表記に変換する
 * @param decimal 17282
 * @returns '戦ナ暗獣竜'
 */
const convertDecimalJobToString = (decimal: number) => {
  const jas = jobs.map(job => job.jas);
  return decimal === AllJobs
    ? 'All Jobs'
    : [...decimal.toString(2)]
        .reverse()
        .reduce(
          (jobstrings, binary, index) =>
            Number(binary) ? [...jobstrings, jas[index]] : jobstrings,
          [] as string[]
        )
        .join('');
};

/** アイテムから装備品を抽出し、アプリケーションで使用する形式に変換する */
const convertRawItem = (item: RawItem) => {
  try {
    if (
      item.slots &&
      item.jobs &&
      item.range_type !== 'Fishing Rod' &&
      item.ammo_type !== 'Bait'
    ) {
      const convertedItem: Item = {
        id: item.id,
        name: item.jal,
        description: item.ja,
        level: item.level!,
        item_level: item.item_level ?? 0,
        jobs: convertDecimalJobToString(item.jobs),
        _jobs: item.jobs,
        _slots: item.slots,
        skill: 0,
        type: '',
      };
      const slot = [
        ...Number(item.slots)
          .toString(2)
          .padStart(16, '0'),
      ]
        .reverse()
        .join('')
        .indexOf('1');
      if (item.category === 'Armor') {
        convertedItem.type += '防具：';
        if (slot === 1) {
          convertedItem.type += `盾：タイプ${item.shield_size}`;
          convertedItem.skill = 30;
        } else {
          convertedItem.type += slots.find(_ => _.id === slot)!.ja;
        }
      } else if (item.category === 'Weapon') {
        convertedItem.type += '武器：';
        convertedItem.skill = item.skill!;
        if (slot === 3) {
          convertedItem.type += item.ammo_type ? '矢弾' : 'アクセサリ';
        } else if (item.skill) {
          convertedItem.type += skills.find(_ => _.id === item.skill)!.ja;
        } else if (item.slots === 2) {
          convertedItem.type += 'グリップ';
        } else if (item.slots === 4) {
          convertedItem.type += 'ストリンガー';
        }
      }
      return convertedItem;
    }
    return undefined;
  } catch (error) {
    console.error(item, error);
    throw error;
  }
};

/** `$ npx ts-node utils.ts [mode]` */
(async ([mode, ...arg]) => {
  switch (mode) {
    /** `src/constants.json`を生成する */
    case 'init':
      const [jobs] = parse(
        await (
          await fetch(
            'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/jobs.lua'
          )
        ).text()
      ) as [{ id: number; en: string; ja: string; ens: string; jas: string }[]];
      const [skills] = parse(
        await (
          await fetch(
            'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/skills.lua'
          )
        ).text()
      ) as [{ id: number; en: string; ja: string; category: SkillCategory }[]];
      const [slots] = parse(
        await (
          await fetch(
            'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/slots.lua'
          )
        ).text()
      ) as [{ id: number; en: string; ja: string }[]];
      const constants = {
        jobs: Object.values(jobs),
        skills: Object.values(skills),
        slots: Object.values(slots)
          .map((slot: any, index) => ({
            ...slot,
            ja: [
              'メイン',
              'サブ',
              'レンジ',
              '矢弾',
              '頭',
              '胴',
              '両手',
              '両脚',
              '両足',
              '首',
              '腰',
              '耳',
              '耳',
              '指',
              '指',
              '背',
            ][index],
          }))
          .filter(slot => !['Right Ear', 'Right Ring'].includes(slot.en)),
      };
      writeFileSync(
        join(__dirname, './src/constants.json'),
        JSON.stringify(constants, null, 4)
      );
      break;
    /** `src/items.json`を生成する */
    case 'items':
      const [raw_items] = parse(
        await (
          await fetch(
            'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/items.lua'
          )
        ).text()
      ) as { [id: number]: RawItem }[];
      const [item_descriptions] = parse(
        await (
          await fetch(
            'https://raw.githubusercontent.com/Windower/Resources/master/resources_data/item_descriptions.lua'
          )
        ).text()
      ) as any[];
      const items = Object.values(raw_items)
        .filter(item => ['Weapon', 'Armor'].includes(item.category))
        .map(item => convertRawItem({ ...item, ...item_descriptions[item.id] }))
        .filter(Boolean);
      writeFileSync(
        join(__dirname, './src/items.json'),
        JSON.stringify(items, null, 4)
      );
      break;
    default:
      throw new Error('UNKNOWN_MODE');
  }
})(process.argv.slice(2));
