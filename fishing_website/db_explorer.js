// db_explorer.js
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
  console.log('Connected to MySQL successfully!');

  // Query categories
  connection.query('SELECT id, name FROM categories', (err, categories) => {
    if (err) console.error('Error categories:', err);
    else console.log('Categories:', categories);

    // Query brands
    connection.query('SELECT id, name FROM brands', (err, brands) => {
      if (err) console.error('Error brands:', err);
      else console.log('Brands:', brands);

      // Query tags
      connection.query('SELECT id, name FROM tags', (err, tags) => {
        if (err) console.error('Error tags:', err);
        else console.log('Tags:', tags);
        
        connection.end();
      });
    });
  });
});
