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
  jobs: number;
  type: string;
  category: string;
}
