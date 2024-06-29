import {
  createItem,
  createItems,
  readItems,
  readItem,
  updateItem,
  deleteItem,
} from "./basicBackend.mjs";

export class ModelBasic {
  constructor(applicationItems) {
    this._itemType = "product";
    this.createItems(applicationItems);
  }

  get itemType() {
    return this._itemType;
  }

  set itemType(value) {
    this._itemType = value;
  }

  createItem(name, price, quantity) {
    return createItem(name, price, quantity);
  }

  createItems(applicationItems) {
    return createItems(applicationItems);
  }

  readItems() {
    return readItems();
  }

  readItem(name) {
    return readItem(name);
  }

  updateItem(name, price, quantity) {
    return updateItem(name, price, quantity);
  }

  deleteItem(name) {
    return deleteItem(name);
  }
}

export class ModelView {
  showBulletPointList(itemType, items) {
    console.log(
      `\n\x1b[33m ----- ${itemType?.toUpperCase()} LIST ----- \x1b[0m`
    );
    items.forEach((item) => {
      console.log(`\x1b[32m • ${item.name} \x1b[0m`);
    });
  }

  showNumberPointList(itemType, items) {
    console.log(
      `\n\x1b[33m ----- ${itemType?.toUpperCase()} LIST ----- \x1b[0m`
    );
    items.forEach((item, index) => {
      console.log(`\x1b[32m ${index + 1}. ${item.name} \x1b[0m`);
    });
  }

  showItem(itemType, item, itemInfo) {
    console.log(
      "//////////////////////////////////////////////////////////////"
    );
    console.log(
      `\n\x1b[33m Good news, we have some ${item?.name?.toUpperCase()}! \x1b[0m`
    );
    console.log(
      `\x1b[32m ${itemType?.toUpperCase()} INFO: ${JSON.stringify(
        itemInfo
      )} \x1b[0m`
    );
    console.log(
      "//////////////////////////////////////////////////////////////"
    );
  }
  displayMissingItemError(item, error) {
    console.log(
      "**************************************************************"
    );
    console.log(
      `\x1b[31m We are sorry, we have no ${item?.toUpperCase()}! \x1b[0m`
    );
    console.log(`\x1b[31m ${error} \x1b[0m`);
    console.log(
      "**************************************************************"
    );
  }

  displayItemAlreadyStoredError(item, itemType, error) {
    console.log(
      "**************************************************************"
    );
    console.log(
      `\x1b[31m Hey! We already have ${item?.toUpperCase()} in our ${itemType} list! \x1b[0m`
    );
    console.log(`\x1b[31m ${error} \x1b[0m`);
    console.log(
      "**************************************************************"
    );
  }

  displayItemNotYetStoredError(item, itemType, error) {
    console.log(
      "**************************************************************"
    );
    console.log(
      `\x1b[31m Hey! We don't have ${item?.toUpperCase()} in our ${itemType} list! \x1b[0m`
    );
    console.log(`\x1b[31m ${error} \x1b[0m`);
    console.log(
      "**************************************************************"
    );
  }

  displayItemStored(item, itemType) {
    console.log(
      "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );
    console.log(
      `\x1b[32m Hooray! We have just added some ${item?.toUpperCase()} to our ${itemType} list! \x1b[0m`
    );
    console.log(
      "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );
  }

  displayChangeItemType(older, newer) {
    console.log(
      "---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---"
    );
    console.log(
      `\x1b[32m Change item type from "${older}" to "${newer}" \x1b[0m`
    );
    console.log(
      "---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---"
    );
  }

  displayItemUpdated(item, oPrice, oQuantity, nPrice, nQuantity) {
    console.log(
      "---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---"
    );
    console.log(
      `\x1b[32m Change ${item} price: ${oPrice} --> ${nPrice} \x1b[0m`
    );
    console.log(
      `\x1b[32m Change ${item} quantity: ${oQuantity} --> ${nQuantity} \x1b[0m`
    );
    console.log(
      "---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---"
    );
  }

  displayItemDeletion(name) {
    console.log(
      "--------------------------------------------------------------"
    );
    console.log(`\x1b[32m We have just removed ${name} from our list \x1b[0m`);
    console.log(
      "--------------------------------------------------------------"
    );
  }
}

export class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  showItems(bulletPoints = false) {
    const items = this.model.readItems();
    const itemType = this.model.itemType;

    bulletPoints
      ? this.view.showBulletPointList(itemType, items)
      : this.view.showNumberPointList(itemType, items);
  }

  showItem(itemName) {
    try {
      const item = this.model.readItem(itemName);
      const itemType = this.model.itemType;
      this.view.showItem(itemType, itemName, item);
    } catch (error) {
      this.view.displayMissingItemError(itemName, error);
    }
  }

  insertItem(name, price, quantity) {
    assert(price > 0, "price must be greater than 0");
    assert(quantity >= 0, "quantity must be greater than or equal to 0");

    const itemType = this.model.itemType;
    try {
      this.model.createItem(name, price, quantity);
      this.view.displayItemStored(name, itemType);
    } catch (e) {
      this.view.displayItemAlreadyStoredError(name, itemType, e);
    }
  }

  updateItem(name, price, quantity) {
    assert(price > 0, "price must be greater than 0");
    assert(quantity >= 0, "quantity must be greater than or equal to 0");
    const itemType = this.model.itemType;

    try {
      const older = this.model.readItem(name);
      this.model.updateItem(name, price, quantity);
      this.view.displayItemUpdated(
        name,
        older.price,
        older.quantity,
        price,
        quantity
      );
    } catch (e) {
      this.view.displayItemNotYetStoredError(name, itemType, e);
      // if the item is not yet stored and we performed an update, we have
      // 2 options: do nothing or call insert_item to add it.
      //   this.insertItem(name, price, quantity);
    }
  }

  updateItemType(newItemType) {
    const oldItemType = this.model.itemType;
    this.model.itemType = newItemType;
    this.view.displayChangeItemType(oldItemType, newItemType);
  }

  deleteItem(name) {
    const itemType = this.model.itemType;
    try {
      this.model.deleteItem(name);
      this.view.displayItemDeletion(name);
    } catch (e) {
      this.view.displayItemNotYetStoredError(name, itemType, e);
    }
  }
}

const items = [
  {
    name: "apple",
    price: 1.0,
    quantity: 2,
  },
  {
    name: "banana",
    price: 0.5,
    quantity: 10,
  },
  {
    name: "orange",
    price: 1.5,
    quantity: 5,
  },
];

const c = new Controller(new ModelBasic(items), new ModelView());
