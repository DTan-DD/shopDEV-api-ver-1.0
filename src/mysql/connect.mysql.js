const mysql = require("mysql2");

// create connection to pool server
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "test",
  port: 8811,
});

const batchSize = 10000;
const totalSize = 1_000_000;

let currentId = 1;
console.time("::::TIMER::::");
const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const name = `name -${currentId}`;
    const age = currentId;
    const address = `address ${currentId}`;
    values.push([currentId, name, age, address]);
    currentId++;
  }

  if (!values.length) {
    console.timeEnd("::::TIMER::::");
    pool.end((err) => {
      if (err) {
        console.log(`error occurred white running batch`);
      } else {
        console.log(`connection pool closed successfully`);
      }
    });
    return;
  }

  const sql = `INSERT INTO test_table_user (id, name, age, address) VALUES ?`;

  pool.query(sql, [values], async function (err, results) {
    if (err) throw err;
    console.log(`Insert ${results.affectedRows} records!`);
    await insertBatch();
  });
};

insertBatch().catch(console.error);

/**
  CHANGE MASTER TO
  MASTER_HOST='172.19.0.2',
  MASTER_PORT=3306,
  MASTER_USER='root',
  MASTER_PASSWORD='root',
  master_log_file='mysql-bin.000002',
  master_log_pos=157,
  master_connect_retry=60,
  GET_MASTER_PUBLIC_KEY=1;
 */

/**
 * show master/slave status
 * docker inspect _id_container
 * docker exec -it name_container bash -> mysql -uroot -p
 */

/**
 create table orders (
    order_id int,
    order_date date not null,
    total_amount decimal(10,2)
    primary key (order_id, order_date)
 )

 partition by range columns (order_date) (
    partition p0 values less than ('2022-01-01'),
    partition p2023 values less than ('2023-01-01'),
    partition p2024 values less than ('2024-01-01'),
    partition pmax values less than (MAXVALUE),
    )

  -- select data
  explain select  * from orders

  -- insert data
  insert into orders (order_id, order_date, total_amount) values (1, '2021-10-10', 500.900)
  insert into orders (order_id, order_date, total_amount) values (2, '2022-10-10', 500.900)
  insert into orders (order_id, order_date, total_amount) values (3, '2023-10-10', 500.900)
  insert into orders (order_id, order_date, total_amount) values (4, '2024-10-10', 500.900)

  --  select data by range
  explain select * from orders partition (p2023);

  --
  explain select * from orders where order_date >= '2022-01-01' and order_date < '2025-01-01';
 */
