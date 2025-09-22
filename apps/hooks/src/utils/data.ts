const testTriggers: Record<string, JSON> = {};

export function setData(key: string, value: JSON): void {
  testTriggers[key] = value;
}

export function getData(key: string): JSON | undefined {
  return testTriggers[key];
}
export function deleteData(key: string): void {
  delete testTriggers[key];
}
