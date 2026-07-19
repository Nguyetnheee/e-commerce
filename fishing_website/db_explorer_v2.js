const mysql = require('mysql2');

const config = {
  host: 'reseau.proxy.rlwy.net',
  port: 42598,
  user: 'root',
  password: 'jfLzvkLQWsSioUFKRnycCZmssWOynecD',
  database: 'railway'
};

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Connected!');

  connection.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error(err);
      connection.end();
      return;
    }
    console.log('Tables:', tables);

    connection.query('SELECT * FROM products', (err, products) => {
      if (err) console.error('Error products:', err);
      else console.log('Products count:', products.length, 'sample:', products.slice(0, 3));

      connection.query('SELECT * FROM variants', (err, variants) => {
        if (err) console.error('Error variants:', err);
        else console.log('Variants count:', variants.length, 'sample:', variants.slice(0, 3));

        connection.end();
      });
    });
  });
});
