const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'fishing_ecommerce',
  charset: 'utf8mb4',
  ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true }
};

const brands = [
  ['SHIMANO', 'Nhật Bản'],
  ['DAIWA', 'Nhật Bản'],
  ['ABU GARCIA', 'Thụy Điển'],
  ['NATUREHIKE', 'Trung Quốc'],
  ['PENN', 'Hoa Kỳ']
];

const categories = [
  ['Câu sông suối', 1],
  ['Câu hồ', 2],
  ['Câu biển', 3],
  ['Cắm trại và dã ngoại', 4]
];

const tags = ['Bán chạy', 'Sản phẩm mới', 'Cao cấp', 'Giá tốt'];

const products = [
  ['RIVER-001', 'Cần câu suối Carbon River Master UL', 'Cần câu siêu nhẹ, phù hợp câu cá ở suối và khu vực nước chảy.', '/images/product-buggy.png', 'SHIMANO', 'Câu sông suối', 'Sản phẩm mới', 1250000, 110, 'SONG'],
  ['RIVER-002', 'Cần câu Daiwa Presso Air AGS Ultralight', 'Cần ultralight trang bị khoen AGS, độ nhạy cao và trọng lượng nhẹ.', '/images/product-keitruck.png', 'DAIWA', 'Câu sông suối', 'Cao cấp', 8400000, 45, 'SONG'],
  ['RIVER-003', 'Abu Garcia Troutin Marquis Nano', 'Phôi carbon nano bền và nhẹ, thích hợp cho những chuyến câu suối dài.', '/images/product-yellowfish.png', 'ABU GARCIA', 'Câu sông suối', 'Giá tốt', 3200000, 70, 'SONG'],
  ['LAKE-001', 'Cần câu Shimano Holiday Spin', 'Cần câu đa dụng có độ đàn hồi tốt, phù hợp câu hồ và câu bờ.', '/images/product-holiday-spin.png', 'SHIMANO', 'Câu hồ', 'Bán chạy', 2450000, 95, 'HO'],
  ['LAKE-002', 'Máy câu Shimano Stradic FM', 'Máy câu vận hành êm, hệ thống hãm ổn định cho nhiều loại cá hồ.', '/images/product-stradic-reel.png', 'SHIMANO', 'Câu hồ', 'Sản phẩm mới', 4650000, 60, 'HO'],
  ['LAKE-003', 'Phao câu Titan siêu nhạy', 'Phao câu cân bằng tốt, tín hiệu rõ và dễ quan sát trong nhiều điều kiện.', '/images/product-titan-float.png', 'DAIWA', 'Câu hồ', 'Giá tốt', 320000, 180, 'HO'],
  ['SEA-001', 'Máy câu Shimano Stella SW', 'Máy câu cao cấp dành cho câu biển, chịu tải lớn và chống ăn mòn.', '/images/product-stella.png', 'SHIMANO', 'Câu biển', 'Cao cấp', 18500000, 30, 'BIEN'],
  ['SEA-002', 'Cần câu Carbon Daiwa Saltiga', 'Phôi carbon mật độ cao, nhẹ và bền cho các chuyến săn cá lớn.', '/images/product-saltiga.png', 'DAIWA', 'Câu biển', 'Cao cấp', 12200000, 35, 'BIEN'],
  ['SEA-003', 'Bộ lưỡi câu Titan chống gỉ', 'Lưỡi câu titan sắc bén, chống ăn mòn trong môi trường nước mặn.', '/images/product-titan-hook.png', 'ABU GARCIA', 'Câu biển', 'Bán chạy', 850000, 150, 'BIEN'],
  ['SEA-004', 'Máy câu Penn Senator 9/0', 'Máy câu biển mạnh mẽ, thích hợp câu cá ngừ và các loài cá lớn.', '/images/product-penn.png', 'PENN', 'Câu biển', 'Bán chạy', 5800000, 40, 'BIEN'],
  ['SEA-005', 'Dây câu Braid X8 Super', 'Dây bện tám lõi bền, mượt và hỗ trợ quăng mồi xa.', '/images/product-braid.png', 'SHIMANO', 'Câu biển', 'Giá tốt', 1250000, 130, 'BIEN'],
  ['CAMP-001', 'Lều cắm trại Naturehike 4 người', 'Lều bốn người chống thấm, khung chắc chắn và dễ dựng.', '/images/product-tent.png', 'NATUREHIKE', 'Cắm trại và dã ngoại', 'Bán chạy', 5800000, 42, 'CAM_TRAI'],
  ['CAMP-002', 'Ghế dã ngoại xếp gọn WildStream', 'Ghế xếp gọn nhẹ, chịu lực tốt và thuận tiện khi di chuyển.', '/images/product-chair-terrain.png', 'NATUREHIKE', 'Cắm trại và dã ngoại', 'Sản phẩm mới', 2150000, 75, 'CAM_TRAI'],
  ['CAMP-003', 'Thùng đồ dã ngoại đa năng 36L', 'Thùng chứa đồ chắc chắn, có thể sử dụng làm bàn dã ngoại.', '/images/product-box-tackle.png', 'NATUREHIKE', 'Cắm trại và dã ngoại', 'Giá tốt', 1550000, 85, 'CAM_TRAI'],
  ['CAMP-004', 'Áo khoác dã ngoại chống tia UV', 'Áo nhẹ, thoáng khí, cản gió và chống nắng khi hoạt động ngoài trời.', '/images/product-shirt.png', 'NATUREHIKE', 'Cắm trại và dã ngoại', 'Sản phẩm mới', 1800000, 100, 'CAM_TRAI'],
  ['CAMP-005', 'Xe kéo đồ dã ngoại gấp gọn', 'Xe kéo tải lớn, bánh địa hình và khung gấp gọn tiện lợi.', '/images/product-long-van.png', 'NATUREHIKE', 'Cắm trại và dã ngoại', 'Cao cấp', 3950000, 38, 'CAM_TRAI']
];

async function ensureNamedRow(connection, table, name, extraColumns = [], extraValues = []) {
  const [rows] = await connection.execute(`SELECT id FROM ${table} WHERE name = ? LIMIT 1`, [name]);
  if (rows.length) return rows[0].id;

  const columns = ['name', ...extraColumns].join(', ');
  const placeholders = new Array(1 + extraValues.length).fill('?').join(', ');
  const [result] = await connection.execute(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
    [name, ...extraValues]
  );
  return result.insertId;
}

async function seed() {
  const connection = await mysql.createConnection(config);
  const ids = { brands: {}, categories: {}, tags: {} };

  try {
    await connection.beginTransaction();

    for (const [name, country] of brands) {
      ids.brands[name] = await ensureNamedRow(connection, 'brands', name, ['country'], [country]);
    }
    for (const [name, sortOrder] of categories) {
      ids.categories[name] = await ensureNamedRow(
        connection,
        'categories',
        name,
        ['sort_order', 'parentid'],
        [sortOrder, null]
      );
    }
    for (const name of tags) {
      ids.tags[name] = await ensureNamedRow(connection, 'tags', name);
    }

    for (const [code, name, description, image, brand, category, tag, price, stock, usageType] of products) {
      const [existing] = await connection.execute('SELECT id FROM products WHERE code = ? LIMIT 1', [code]);
      let productId;

      if (existing.length) {
        productId = existing[0].id;
        await connection.execute(
          `UPDATE products
             SET name = ?, description = ?, image = ?, is_visible = 1, stock = ?,
                 brandid = ?, catid = ?, usage_type = ?
           WHERE id = ?`,
          [name, description, image, stock, ids.brands[brand], ids.categories[category], usageType, productId]
        );
      } else {
        const [result] = await connection.execute(
          `INSERT INTO products
             (name, description, image, is_visible, stock, brandid, catid, code, time, usage_type)
           VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
          [name, description, image, stock, ids.brands[brand], ids.categories[category], code, Date.now(), usageType]
        );
        productId = result.insertId;
      }

      const sku = `${code}-STD`;
      const [variants] = await connection.execute(
        'SELECT id FROM product_variants WHERE sku = ? LIMIT 1',
        [sku]
      );
      if (variants.length) {
        await connection.execute(
          `UPDATE product_variants
             SET base_price = ?, stock_quantity = ?, variant_name = ?, productid = ?
           WHERE id = ?`,
          [price, stock, 'Tiêu chuẩn', productId, variants[0].id]
        );
      } else {
        await connection.execute(
          `INSERT INTO product_variants
             (base_price, discount_price, sku, stock_quantity, variant_name, productid)
           VALUES (?, NULL, ?, ?, ?, ?)`,
          [price, sku, stock, 'Tiêu chuẩn', productId]
        );
      }

      await connection.execute(
        'INSERT IGNORE INTO product_tags (productid, tagid) VALUES (?, ?)',
        [productId, ids.tags[tag]]
      );
    }

    await connection.commit();

    const [counts] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM brands) AS brands,
        (SELECT COUNT(*) FROM categories) AS categories,
        (SELECT COUNT(*) FROM tags) AS tags,
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM product_variants) AS variants
    `);
    console.log('Seed completed:', counts[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
