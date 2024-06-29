var items = [];

export function createItems(appItems) {
  items = appItems;
}

export function createItem(name, price, quantity) {
  const results = items.find((item) => item.name === name);

  if (results) {
    throw new Error(`${name} already exists`);
  }

  items.push({ name, price, quantity });
}

export function readItems() {
  return [...items];
}

export function readItem(name) {
  const item = items.find((item) => item.name === name);

  if (item) {
    return item;
  }

  throw new Error(`${name} not found`);
}

export function updateItem(name, price, quantity) {
  const index = items.findIndex((item) => item.name === name);

  if (index === -1) {
    throw new Error(`${name} not found`);
  }

  items[index] = { name, price, quantity };
}

export function deleteItem(name) {
  const index = items.findIndex((item) => item.name === name);

  if (index === -1) {
    throw new Error(`${name} not found`);
  }

  items.splice(index, 1);
}

function main() {
  createItems([
    { name: "bread", price: 10, quantity: 1 },
    { name: "milk", price: 20, quantity: 2 },
  ]);

  createItem("Item 3", 30, 3);

  console.log("\n\x1b[36m ----- READ items \x1b[0m");
  console.log(readItems());

  console.log("\n\x1b[1m ----- READ bread \x1b[0m");
  console.log(readItem("bread"));

  console.log("\n\x1b[35m ----- UPDATE bread \x1b[0m");
  updateItem("bread", 15, 1);
  console.log(readItem("bread"));

  console.log("\n\x1b[31m ----- DELETE milk \x1b[0m");
  deleteItem("milk");
  console.log(readItems());
}

// main();
