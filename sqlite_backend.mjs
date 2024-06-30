import sqlite3 from "sqlite3";
const dbName = "foo";

/**
 * Connect to a sqlite DB. Create the database if there isn't one yet.
 *
 * Open a connection to a SQLite DB (either a DB file or an in-memory DB).
 * When a database is accessed by multiple connections, and one of the
 * processes modifies the database, the SQLite database is locked until that
 * transaction is committed.
 */
function connectToDatabase(db = null) {
  let myDb;
  if (db == null) {
    myDb = ":memory:";
    console.log("Connecting to in-memory database");
  } else {
    myDb = `${dbName}.db`;
    console.log(`Connecting to ${dbName} database`);
  }
  const connection = new sqlite3.Database(myDb, (error) => {
    if (error) {
      return console.error(error.message);
    }
    console.log("Connected to SQLite database");
  });

  return connection;
}

/**
 * (re)open a sqlite database connection when needed.
 * A database connection must be open when we want to perform a database query
 * but we are in one of the following situations:
 * 1) there is no connection
 * 2) the connection is closed
 */
function connect(conn) {
  try {
    conn.execute('SELECT name FROM sqlite_master WHERE type="table";');
  } catch (error) {
    conn = connectToDatabase(dbName);
  }
  return conn;
}

function disconnectFromDb(db = null, conn = null) {
  if (db != dbName) {
    console.log("You are trying to disconnect from a wrong DB");
  }
  if (conn != null) {
    conn.close();
  }
}

function createTable(conn, tableName) {
  connect(conn);
  const sql = `CREATE TABLE ${tableName} (rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE, price REAL, quantity INTEGER)`;
  try {
    conn.exec(sql);
  } catch (error) {
    console.error(error);
  }
}

function insertOne(conn, name, price, quantity, tableName) {
  connect(conn);
  const sql = `INSERT INTO ${tableName} (name, price, quantity) VALUES (?, ?, ?)`;
  try {
    conn.run(sql, [name, price, quantity]);
    console.log(`Item ${name} inserted`);
  } catch (error) {
    console.error(error);
  }
}

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
    conn.commit();
  } catch (error) {
    console.error(error);
  }
}

function selectOne(conn, itemName, tableName) {
  connect(conn);
  const sql = `SELECT * FROM ${tableName} WHERE name=${itemName}`;
  const c = conn.get(sql);
  const result = c.fetchone();
  if (result != null) {
    return result;
  } else {
    throw new Error(`Item ${itemName} not found`);
  }
}

function selectAll(conn, tableName) {
  connect(conn);
  const sql = `SELECT * FROM ${tableName}`;
  conn.each(sql, (err, row) => {
    console.log(`Item ${row.name} selected`);
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

function main() {
  const tableName = "items";
  const conn = connectToDatabase();
  createTable(conn, tableName);
  insertOne(conn, "apple", 1.0, 10, tableName);
  insertOne(conn, "banana", 0.5, 20, tableName);
  insertOne(conn, "orange", 1.5, 15, tableName);
  selectAll(conn, tableName);
  conn.close();
}

main();
