import { Item } from "../utils";
import { Condition, Query, initial } from "./query";

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
    job_flags: cond.job_flags ^ (1 << bits) /** 指定ジョブのbitを反転させる */
  });
}

export function SetSlot(bits: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    slot_flags:
      cond.slot_flags ^ (1 << bits) /** 指定スロットのbitを反転させる */
  });
}

export function SetSkill(bits: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    skill: cond.skill ^ (1 << bits)
  });
}

export function SetMinLevel(level: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    minLevel: level
  });
}

export const Reset: Action = () => initial();

export function Apply(cond: Condition, item: Item[]): Item[] {
  const q = new Query(cond);
  return item.filter(x => q.accept(x));
}
