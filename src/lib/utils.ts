interface CallbackOneParam<T1, T2 = boolean> {
  (param1: T1): T2;
}
export function filterObject<T extends object>(obj: T, callback: CallbackOneParam<string[]>) {
  return Object.fromEntries(Object.entries(obj).filter(([key, val]) => callback([key, val])));
}
