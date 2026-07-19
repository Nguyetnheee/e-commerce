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

  connection.query('DESCRIBE products', (err, cols) => {
    if (err) console.error(err);
    else console.log('Products columns:', cols);

    connection.query('DESCRIBE product_variants', (err, cols2) => {
      if (err) console.error(err);
      else console.log('Product_variants columns:', cols2);

      connection.query('SELECT * FROM tags', (err, tags) => {
        if (err) console.error(err);
        else console.log('Tags:', tags);

        connection.query('SELECT * FROM product_tags', (err, pt) => {
          if (err) console.error(err);
          else console.log('Product_tags sample:', pt);
          
          connection.end();
        });
      });
    });
  });
});
