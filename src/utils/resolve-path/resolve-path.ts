//Resolve nested object property and array items using string(path) with dots and brackets
//path: 'data.prop1[prop2]['prop3']["prop4"]'

export function resolvePath(data: object, path: string) {
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  let parts = path.split('.');

  for (let i = 0; i < parts.length; i++) {
    let key = parts[i];

    if (key in data) {
      data = data[key];
    } else {
      return;
    }
  }

  return data;
}
