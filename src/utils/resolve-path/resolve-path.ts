//Resolve nested object property using string with dots and brackets
//path: 'data.prop1[prop2]['prop3']["prop4"]'

export default function resolvePath(data: object, path: string) {
  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  var parts = path.split('.');

  for (var i = 0, length = parts.length; i < length; ++i) {
    var key = parts[i];

    if (key in data) {
      data = data[key];
    } else {
      return;
    }
  }

  return data;
}
