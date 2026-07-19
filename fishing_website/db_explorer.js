// db_explorer.js
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
