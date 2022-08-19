export type Condition = {
  job_flags: number;
  slot_flags: number;
  skill: Set<number>;
  text: string;
  minLevel: number;
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

export function SetSlot(bits: number): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    slot_flags: cond.slot_flags ^ (1 << bits) /** 指定スロットのbitを反転させる */,
  });
}

const toggle = <T>(xs: Set<T>, x: T): Set<T> => {
  console.log('before', xs, x);
  xs.has(x) ? xs.delete(x) : xs.add(x);
  console.log('after', xs, x);
  return xs;
};

export function SetSkill(skill: number): Action {
  return (cond: Condition): Condition => {
    console.log('SetSkill', skill);
    toggle(cond.skill, skill);
    return cond;
  };
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
    slot_flags: 0,
    skill: new Set(),
    minLevel: 0,
    text: '',
  };
}
