//Resolve nested object property using string with dots and brackets
//path: 'data.prop1[prop2]['prop3']["prop4"]'

export default function resolvePath(data: object, path: string) {
  try {
    const properties = parsePath(path);
    let currentPath = data;
    for (const property of properties) {
      currentPath = currentPath[property];
    }

    return currentPath;
  } catch (error) {
    throw new Error(`Error while resolving a path: ${error.message}`);
  }
}

function parsePath(path: string): string[] {
  const regex = /[\[\]\'\"]+/g;
  const cleanedPath = path.replace(regex, '');
  return cleanedPath.split('.');
}
