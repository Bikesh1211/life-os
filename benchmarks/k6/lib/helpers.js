export function parseTimeout(val) {
  if (typeof val === "number") return val * 1000;
  var match = String(val).match(/^(\d+)s$/);
  return match ? parseInt(match[1], 10) * 1000 : 30000;
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
