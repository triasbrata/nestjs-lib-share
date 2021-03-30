import { resolve } from 'path';

export function filterStack(
  stack: string,
  pattern = [], //'!(\\.js:(\\d+):(\\d+)\\)$)'
) {
  const [header, ...stacks] = stack
    .split('\n')
    .map(it => makeRelativePath(it.trim()));
  return [
    header,
    ...stacks.filter(
      it =>
        pattern.reduce((pit, regex) => {
          return pit.match(new RegExp(regex, 'gi'))?.length > 0 ? '' : it;
        }, it).length > 0,
    ),
  ].join('\n');
}
export function makeRelativePath(str: string) {
  return str.replace(resolve('./') + '/', '');
}
