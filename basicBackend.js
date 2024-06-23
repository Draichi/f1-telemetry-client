var items = [];

function createItems(appItems) {
  items = appItems;
}

function createItem(name, price, quantity) {
  results = items.find((item) => item.name === name);

  if (results) {
    throw new Error(`${name} already exists`);
  }

  items.push({ name, price, quantity });
}

function readItems() {
  return [...items];
}

function readItem(name) {
  return items.find((item) => item.name === name);
}
