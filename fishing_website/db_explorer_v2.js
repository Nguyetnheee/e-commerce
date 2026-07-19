const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'fishing_ecommerce'
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
