export default function transformIFrameInstance(instance: any) {
  if (instance === undefined) {
    return undefined;
  } else {
    return {
      id: instance.id,
      ...instance.properties
    };
  }
}
