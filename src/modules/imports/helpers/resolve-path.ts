export function resolvePath(obj: object, path: string) {
  const props = path.split('.');
  // console.log(props);
  let current = obj;
  for (const prop of props) {
    current = current[prop];
  }
  return current;
}
