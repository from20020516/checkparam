export type Condition = {
  job_flags: number;
  text: string;
  minLevel: number;
  types: Set<string>;
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

const toggle = <T>(xs: Set<T>, x: T): Set<T> => {
  const ret = new Set(xs);
  ret.has(x) ? ret.delete(x) : ret.add(x);
  return ret;
};

export function SetType(name: string): Action {
  return (cond: Condition): Condition => ({
    ...cond,
    types: toggle(cond.types, name),
  });
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
    minLevel: 0,
    text: '',
    types: new Set(),
  };
}
