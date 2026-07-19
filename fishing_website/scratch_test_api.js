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

  // Check if brands are empty or need seeding
  connection.query('SELECT COUNT(*) as count FROM brands', (err, result) => {
    if (err) {
      console.error(err);
      connection.end();
      return;
    }
    const count = result[0].count;
    console.log('Current brands count in DB:', count);

    if (count === 0) {
      const sql = 'INSERT INTO brands (name, country) VALUES ?';
      const values = [
        ['SHIMANO', 'Nhật Bản'],
        ['DAIWA', 'Nhật Bản'],
        ['ABU GARCIA', 'Mỹ'],
        ['NATUREHIKE', 'Trung Quốc']
      ];
      connection.query(sql, [values], (err, insertRes) => {
        if (err) console.error('Insert error:', err);
        else console.log('Successfully seeded brands into database!');
        connection.end();
      });
    } else {
      console.log('Brands already exist in database, no seeding needed.');
      connection.end();
    }
  });
});
