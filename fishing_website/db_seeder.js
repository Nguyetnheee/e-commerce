const mysql = require('mysql2');

const config = {
  host: 'reseau.proxy.rlwy.net',
  port: 42598,
  user: 'root',
  password: 'jfLzvkLQWsSioUFKRnycCZmssWOynecD',
  database: 'railway'
};

const connection = mysql.createConnection(config);

connection.connect(async (err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL successfully!');

  // Describe product_tags first to get column names
  connection.query('DESCRIBE product_tags', async (err, cols) => {
    if (err) {
      console.error('Error describing product_tags:', err);
      connection.end();
      return;
    }
    console.log('product_tags columns:', cols);
    const prodIdCol = cols.find(c => c.Field.toLowerCase().includes('product'))?.Field || 'productid';
    const tagIdCol = cols.find(c => c.Field.toLowerCase().includes('tag'))?.Field || 'tagid';

    // Clear existing products to prevent duplicates or clean start
    console.log('Cleaning existing products and variants...');
    await queryPromise('DELETE FROM product_tags');
    await queryPromise('DELETE FROM product_variants');
    await queryPromise('DELETE FROM products');

    // Products data to insert
    const productsData = [
      // Sông suối (catid: 1)
      {
        catid: 1, brandid: 1, name: 'Cần câu suối Carbon River Master UL',
        description: 'Dòng cần siêu nhẹ tối ưu cho môi trường nước chảy mạnh suối tự nhiên.',
        image: '/images/product-buggy.png', code: 'RIVER-001', price: 1250000, tagId: 1
      },
      {
        catid: 1, brandid: 2, name: 'Cần câu Daiwa Presso Air AGS Ultralight',
        description: 'Trang bị khoen AGS siêu nhẹ, cảm giác dòng cá tuyệt đỉnh trong khe suối.',
        image: '/images/product-keitruck.png', code: 'RIVER-002', price: 8400000, tagId: 2
      },
      {
        catid: 1, brandid: 3, name: 'Abu Garcia Troutin Marquis Nano Stream',
        description: 'Sử dụng công nghệ Nano carbon tăng độ bền và giảm trọng lượng cần tối đa.',
        image: '/images/product-yellowfish.png', code: 'RIVER-003', price: 3200000, tagId: null
      },

      // Biển (catid: 2)
      {
        catid: 2, brandid: 1, name: 'Máy câu Shimano bạo lực Stella SW',
        description: 'Dòng máy cao cấp nhất cho câu biển, chịu lực cực đại...',
        image: '/images/product-stella.png', code: 'SEA-001', price: 18500000, tagId: 1
      },
      {
        catid: 2, brandid: 2, name: 'Cần Câu Carbon Daiwa Saltiga',
        description: 'Phôi Carbon mật độ cao, cực nhẹ và dẻo dai cho những chuyến săn cá lớn.',
        image: '/images/product-saltiga.png', code: 'SEA-002', price: 12200000, tagId: null
      },
      {
        catid: 2, brandid: 3, name: 'Bộ Lưỡi Câu Titan Chống Gỉ',
        description: 'Vật liệu Titan tinh khiết, sắc bén vĩnh viễn, chống ăn mòn muối biển.',
        image: '/images/product-titan-hook.png', code: 'SEA-003', price: 850000, tagId: 2
      },
      {
        catid: 2, brandid: 3, name: 'Máy Câu Penn Senator 9/0',
        description: 'Huyền thoại cho những chuyến săn cá ngừ đại dương và cá mập.',
        image: '/images/product-penn.png', code: 'SEA-004', price: 5800000, tagId: null
      },
      {
        catid: 2, brandid: 1, name: 'Dây Câu Braid X8 Super',
        description: 'Độ bền vượt trội, siêu mịn giúp giảm ma sát khi quăng mồi xa bờ.',
        image: '/images/product-braid.png', code: 'SEA-005', price: 1250000, tagId: null
      },
      {
        catid: 2, brandid: 3, name: 'Áo Câu Biển Chống Tia UV',
        description: 'Vải thun lạnh cao cấp, thoát mồ hôi cực nhanh, bảo vệ da hiệu quả.',
        image: '/images/product-shirt.png', code: 'SEA-006', price: 1800000, tagId: null
      },

      // Dã ngoại (catid: 3)
      {
        catid: 3, brandid: 4, name: 'Lều Cắm Trại 4 Người Peak-4',
        description: 'Horizon 4 là sự kết hợp hoàn hảo giữa thiết kế tự bung thông minh và chống thấm PU3000mm.',
        image: '/images/product-tent.png', code: 'CAMP-001', price: 5800000, tagId: 1
      },
      {
        catid: 3, brandid: 4, name: 'Ghế Dã Ngoại Xếp Gọn WildStream',
        description: 'Ghế xếp gọn dã ngoại chuyên dụng siêu nhẹ, chịu lực tốt.',
        image: '/images/product-chair-terrain.png', code: 'CAMP-002', price: 2150000, tagId: null
      },
      {
        catid: 3, brandid: 4, name: 'Thùng Đựng Đồ Dã Ngoại Đa Năng 36L',
        description: 'Chất liệu nhựa cao cấp, đa dụng làm bàn ăn hoặc chứa đồ dã ngoại tiện lợi.',
        image: '/images/product-box-tackle.png', code: 'CAMP-003', price: 1550000, tagId: null
      },
      {
        catid: 3, brandid: 4, name: 'Áo Khoác Dã Ngoại Chống Tia UV',
        description: 'Thiết kế thời trang dã ngoại, cản gió và chống nắng tối ưu.',
        image: '/images/product-shirt.png', code: 'CAMP-004', price: 1800000, tagId: 2
      }
    ];

    try {
      for (const item of productsData) {
        // Insert product
        const insertProductSql = `
          INSERT INTO products (name, description, image, is_visible, stock, brandid, catid, code, time)
          VALUES (?, ?, ?, 1, 100, ?, ?, ?, ?)
        `;
        const timeVal = Date.now();
        const pResult = await queryPromise(insertProductSql, [
          item.name, item.description, item.image, item.brandid, item.catid, item.code, timeVal
        ]);
        const productId = pResult.insertId;

        console.log(`Inserted product: ${item.name} with ID ${productId}`);

        // Insert variant
        const insertVariantSql = `
          INSERT INTO product_variants (base_price, discount_price, sku, stock_quantity, variant_name, productid)
          VALUES (?, NULL, ?, 100, 'Tiêu chuẩn', ?)
        `;
        const skuVal = `SKU-${item.code}-STD`;
        await queryPromise(insertVariantSql, [item.price, skuVal, productId]);

        // Insert tag mapping
        if (item.tagId) {
          const insertTagSql = `
            INSERT INTO product_tags (${prodIdCol}, ${tagIdCol})
            VALUES (?, ?)
          `;
          await queryPromise(insertTagSql, [productId, item.tagId]);
        }
      }
      console.log('Seeding completed successfully!');
    } catch (ex) {
      console.error('Error seeding database:', ex);
    } finally {
      connection.end();
    }
  });
});

function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}
