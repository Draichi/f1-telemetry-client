import sqlite3 from "sqlite3";
const dbName = "foo";

/**
 * Connect to a sqlite DB. Create the database if there isn't one yet.
 *
 * Open a connection to a SQLite DB (either a DB file or an in-memory DB).
 * When a database is accessed by multiple connections, and one of the
 * processes modifies the database, the SQLite database is locked until that
 * transaction is committed.
 *
 * @param {string} db the database name
 * @returns {sqlite3.Database} the database connection
 */
function connectToDatabase(db = null) {
  let myDb;
  if (db == null) {
    myDb = ":memory:";
  } else {
    myDb = `${dbName}.db`;
  }
  const connection = new sqlite3.Database(myDb, (error) => {
    if (error) {
      throw new Error(error);
    }
  });

  return connection;
}

/**
 * (re)open a sqlite database connection when needed.
 * A database connection must be open when we want to perform a database query
 * but we are in one of the following situations:
 * 1) there is no connection
 * 2) the connection is closed
 *
 * @param {sqlite3.Database} conn the database connection
 */
function connect(conn) {
  try {
    conn.execute('SELECT name FROM sqlite_temp_master WHERE type="table";');
  } catch (error) {
    conn = connectToDatabase(dbName);
  }
  return conn;
}

/**
 * Disconnect from the database.
 * @param {string} db the database name
 * @param {sqlite3.Database} conn the database connection
 */
function disconnectFromDb(db = null, conn = null) {
  if (db != dbName) {
    throw new Error("You are trying to disconnect from a wrong DB");
  }
  if (conn != null) {
    conn.close();
  }
}

/**
 * Scrub the input string to make it safe to insert into a sqlite database.
 * @param {string} inputString the input string
 * @returns {string} the scrubbed string
 */
function scrub(inputString) {
  return inputString
    .split("")
    .filter((char) => {
      return /[a-zA-Z0-9]/.test(char);
    })
    .join("");
}

/**
 * Create a table in the database.
 * @param {sqlite3.Database} conn
 * @param {string} _tableName
 */
function createTable(conn, _tableName) {
  connect(conn);
  const tableName = scrub(_tableName);
  const sql = `CREATE TABLE ${tableName} (rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE, price REAL, quantity INTEGER)`;
  try {
    conn.exec(sql);
  } catch (error) {
    throw new Error(`Error creating table ${tableName}: ${error}`);
  }
}

/**
 * Insert one item into the database.
 * @param {sqlite3.Database} conn
 * @param {string} name
 * @param {number} price
 * @param {number} quantity
 * @param {string} tableName
 */
function insertOne(conn, name, price, quantity, tableName) {
  connect(conn);
  const sql = `INSERT INTO ${tableName} (name, price, quantity) VALUES (?, ?, ?)`;
  try {
    conn.run(sql, [name, price, quantity]);
  } catch (error) {
    throw new Error(
      `${error}: "${name}" already stored in table "${tableName}"`
    );
  }
}

/**
 * Insert many items into the database.
 * @param {sqlite3.Database} conn
 * @param {Array} items
 * @param {string} tableName
 */
function insertMany(conn, items, tableName) {
  connect(conn);
  const sql = `INSERT INTO ${tableName} (name, price, quantity) VALUES (?, ?, ?)`;
  const entries = [];
  for (const item of items) {
    entries.push({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }
  try {
    conn.run(sql, entries);
  } catch (error) {
    throw new Error(`Error inserting items: ${error}`);
  }
}

/**
 * Select one item from the database.
 * @param {sqlite3.Database} conn
 * @param {string} itemName
 * @param {string} tableName
 */
function selectOne(conn, itemName, tableName) {
  connect(conn);
  const sql = `SELECT * FROM ${tableName} WHERE name="${itemName}"`;
  return new Promise((resolve, reject) => {
    conn.get(sql, (err, row) => {
      if (err) {
        reject(new Error(`Error selecting item ${itemName}: ${err}`));
        return;
      }
      resolve(row);
    });
  });
}

/**
 * Select all items from the database.
 * @param {sqlite3.Database} conn
 * @param {string} tableName
 */
function selectAll(conn, tableName) {
  connect(conn);
  const sql = `SELECT * FROM ${tableName}`;

  return new Promise((resolve, reject) => {
    const result = [];
    conn.each(
      sql,
      (err, row) => {
        if (err) {
          reject(new Error(`Error selecting all items: ${err}`));
          return;
        }
        result.push(row);
      },
      (err) => {
        if (err) {
          reject(new Error(`Error completing the query: ${err}`));
          return;
        }
        resolve(result);
      }
    );
  });
}

function updateOne(conn, name, price, quantity, tableName) {
  connect(conn);
  const sqlCheck = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE name=? LIMIT 1)`;
  const sqlUpdate = `UPDATE ${tableName} SET price=?, quantity=? WHERE name=?`;
  const c = conn.run(sqlCheck, [name]);
  const result = c.fetchone();
  if (result[0]) {
    c.execute(sqlUpdate, [price, quantity, name]);
  } else {
    throw new Error(`Item ${name} not found`);
  }
}

function deleteOne(conn, name, tableName) {
  connect(conn);
  const sqlCheck = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE name=? LIMIT 1)`;
  const sqlDelete = `DELETE FROM ${tableName} WHERE name=?`;
  const c = conn.run(sqlCheck, [name]);
  const result = c.fetchone();
  if (result[0]) {
    c.execute(sqlDelete, [name]);
  } else {
    throw new Error(`Item ${name} not found`);
  }
}

async function main() {
  const tableName = "items3";
  const conn = connectToDatabase(true);
  //   createTable(conn, tableName);
  //   insertOne(conn, "foo", 1.0, 10, tableName);
  //   console.log(await selectOne(conn, "jam", tableName));
  console.log(await selectAll(conn, tableName));
  conn.close();
}

main();
