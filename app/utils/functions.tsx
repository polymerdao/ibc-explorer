export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function classLogic(func: () => string): string {
  return func();
}

export function numberWithCommas(input: number): string {
  return input.toLocaleString('en');
}
