export function getId() {
  return Math.ceil(Math.random() * (100000 - 10000) + 10000).toString();
}
