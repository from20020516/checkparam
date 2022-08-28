import { parse } from 'lua-json';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { RawItem, Item, SkillCategory } from './src/types';
import { ItemType } from './src/const';

const AllJobs = parseInt('11111111111111111111110', 2);

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
        jobs: item.jobs,
        type: ItemType(item),
        category: item.category,
      };
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
      const constants = {
        jobs: Object.values(jobs),
        skills: Object.values(skills),
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
