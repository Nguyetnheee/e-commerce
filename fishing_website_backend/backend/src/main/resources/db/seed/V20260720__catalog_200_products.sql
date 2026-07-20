-- WildStream production catalog expansion.
-- Idempotent: products are keyed by the SEED26-* code and will not be duplicated.
-- Scope: 4 major categories x 5 product types x 10 products = 200 products.

SET NAMES utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_models;
CREATE TEMPORARY TABLE seed_models (
    n INT PRIMARY KEY,
    model_label VARCHAR(80) NOT NULL
);

INSERT INTO seed_models (n, model_label) VALUES
    (1, 'Explorer 100'),
    (2, 'Adventure 200'),
    (3, 'Pro Series 300'),
    (4, 'Tournament 400'),
    (5, 'Coastal 500'),
    (6, 'Master 600'),
    (7, 'Premium 700'),
    (8, 'Ultra Light 800'),
    (9, 'Power Cast 900'),
    (10, 'Limited X1000');

DROP TEMPORARY TABLE IF EXISTS seed_types;
CREATE TEMPORARY TABLE seed_types (
    type_no INT PRIMARY KEY,
    root_name VARCHAR(100) NOT NULL,
    type_name VARCHAR(150) NOT NULL,
    code_prefix VARCHAR(12) NOT NULL,
    usage_type VARCHAR(20) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    material_name VARCHAR(120) NOT NULL,
    description_text VARCHAR(220) NOT NULL,
    min_price DECIMAL(19,2) NOT NULL,
    price_step DECIMAL(19,2) NOT NULL
);

INSERT INTO seed_types
    (type_no, root_name, type_name, code_prefix, usage_type, image_path, material_name,
     description_text, min_price, price_step)
VALUES
    (1, 'Biển', 'Cần câu biển', 'SEA-ROD', 'BIEN', '/images/product-rod.png',
     'Carbon composite chống ăn mòn', 'Cần câu chuyên dụng cho môi trường nước mặn, khoen bền và tay cầm chống trượt.', 500000, 260000),
    (2, 'Biển', 'Máy câu biển', 'SEA-REEL', 'BIEN', '/images/product-saltiga.png',
     'Hợp kim nhôm chống muối', 'Máy câu biển có hệ thống hãm ổn định, bạc đạn kín và khả năng chịu tải cao.', 650000, 250000),
    (3, 'Biển', 'Mồi câu biển', 'SEA-LURE', 'BIEN', '/images/product-yellowfish.png',
     'Nhựa ABS và thép không gỉ', 'Mồi giả cân bằng tốt, màu sắc bền, phù hợp nhiều tầng nước và loài cá biển.', 100000, 90000),
    (4, 'Biển', 'Dây câu biển', 'SEA-LINE', 'BIEN', '/images/product-braid.png',
     'Sợi PE bện đa lớp', 'Dây câu chịu mài mòn và lực kéo lớn, hạn chế thấm nước khi câu xa bờ.', 180000, 120000),
    (5, 'Biển', 'Phụ kiện câu biển', 'SEA-ACC', 'BIEN', '/images/product-box-tackle.png',
     'Thép không gỉ và polymer', 'Bộ phụ kiện nước mặn gồm khóa, khoen, chì và hộp bảo quản chống ẩm.', 100000, 110000),

    (6, 'Sông', 'Cần câu sông', 'RIV-ROD', 'SONG', '/images/product-rod.png',
     'Carbon độ đàn hồi cao', 'Cần câu cân bằng, độ nhạy tốt, phù hợp câu bờ và câu trên thuyền ở sông.', 350000, 240000),
    (7, 'Sông', 'Máy câu sông', 'RIV-REEL', 'SONG', '/images/product-stradic-reel.png',
     'Hợp kim nhôm nhẹ', 'Máy câu vận hành êm, thu dây đều và dễ điều chỉnh lực hãm cho cá nước ngọt.', 450000, 230000),
    (8, 'Sông', 'Mồi câu sông', 'RIV-LURE', 'SONG', '/images/product-long-van.png',
     'Silicone và nhựa ABS', 'Mồi câu mô phỏng chuyển động tự nhiên, thích hợp cá lóc, cá chẽm và cá rô.', 100000, 75000),
    (9, 'Sông', 'Dây câu sông', 'RIV-LINE', 'SONG', '/images/product-braid.png',
     'Nylon và fluorocarbon', 'Dây câu mềm, ít xoắn, độ trong cao và phù hợp nhiều kỹ thuật câu sông.', 120000, 95000),
    (10, 'Sông', 'Phao và lưỡi câu sông', 'RIV-HOOK', 'SONG', '/images/product-titan-float.png',
     'Balsa, carbon và thép carbon', 'Bộ phao và lưỡi câu có độ nhạy cao, dễ quan sát và thay đổi theo dòng chảy.', 100000, 80000),

    (11, 'Hồ', 'Cần câu hồ', 'LAK-ROD', 'HO', '/images/product-holiday-spin.png',
     'Carbon 30T', 'Cần câu hồ có ngọn nhạy, thân chắc và trọng lượng nhẹ cho các buổi câu dài.', 400000, 250000),
    (12, 'Hồ', 'Máy câu hồ', 'LAK-REEL', 'HO', '/images/product-reel.png',
     'Graphite và hợp kim nhôm', 'Máy câu hồ nhỏ gọn, rotor cân bằng và hệ thống hãm dễ kiểm soát.', 420000, 220000),
    (13, 'Hồ', 'Mồi câu hồ', 'LAK-BAIT', 'HO', '/images/product-yellowfish.png',
     'Ngũ cốc, protein và hương liệu câu cá', 'Mồi câu phối trộn ổn định, tạo vùng dẫn dụ lâu và phù hợp nhiều loại cá hồ.', 100000, 70000),
    (14, 'Hồ', 'Dây câu hồ', 'LAK-LINE', 'HO', '/images/product-braid.png',
     'Nylon phủ fluorocarbon', 'Dây câu có độ chìm và độ giãn phù hợp, hỗ trợ cảm nhận tín hiệu cá cắn.', 120000, 90000),
    (15, 'Hồ', 'Phao và phụ kiện câu hồ', 'LAK-ACC', 'HO', '/images/product-titan-hook.png',
     'Balsa, silicone và thép carbon', 'Bộ phao, lưỡi, chặn phao và khóa dây dành cho nhiều kiểu câu hồ.', 100000, 85000),

    (16, 'Cắm trại', 'Lều cắm trại', 'CAM-TENT', 'CAM_TRAI', '/images/product-tent.png',
     'Vải polyester phủ PU và khung hợp kim', 'Lều dã ngoại chống mưa, thông gió tốt, dựng nhanh và phù hợp nhiều địa hình.', 900000, 230000),
    (17, 'Cắm trại', 'Túi ngủ', 'CAM-SLEEP', 'CAM_TRAI', '/images/camping.png',
     'Polyester chống ẩm và bông microfiber', 'Túi ngủ giữ nhiệt tốt, khóa kéo hai chiều và dễ cuộn gọn khi di chuyển.', 350000, 160000),
    (18, 'Cắm trại', 'Bàn ghế dã ngoại', 'CAM-FURN', 'CAM_TRAI', '/images/product-chair-terrain.png',
     'Hợp kim nhôm và vải Oxford', 'Bàn ghế gấp gọn có khung chịu lực, bề mặt dễ vệ sinh và túi đựng tiện lợi.', 300000, 210000),
    (19, 'Cắm trại', 'Bếp và dụng cụ nấu', 'CAM-COOK', 'CAM_TRAI', '/images/product-keitruck.png',
     'Inox 304 và hợp kim nhôm', 'Bộ bếp và dụng cụ nấu nhỏ gọn, truyền nhiệt đều và an toàn khi dã ngoại.', 250000, 190000),
    (20, 'Cắm trại', 'Đèn và nguồn điện', 'CAM-LIGHT', 'CAM_TRAI', '/images/product-buggy.png',
     'Nhựa ABS chống va đập và pin lithium', 'Thiết bị chiếu sáng và cấp nguồn có nhiều chế độ, phù hợp sử dụng ngoài trời.', 200000, 260000);

DROP TEMPORARY TABLE IF EXISTS seed_brand_map;
CREATE TEMPORARY TABLE seed_brand_map (
    seq INT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    country_name VARCHAR(100)
);

INSERT INTO seed_brand_map (seq, brand_name, country_name) VALUES
    (1, 'DAIWA', 'Nhật Bản'),
    (2, 'SHIMANO', 'Nhật Bản'),
    (3, 'Kaiwo', 'Trung Quốc'),
    (4, 'Handing', 'Trung Quốc'),
    (5, 'Abu Garcia', 'Thụy Điển'),
    (6, 'Penn', 'Hoa Kỳ'),
    (7, 'Tica', 'Đài Loan'),
    (8, 'Ryobi', 'Nhật Bản'),
    (9, 'YG Fishing', 'Trung Quốc'),
    (10, 'Rapala', 'Phần Lan'),
    (11, 'Berkley', 'Hoa Kỳ'),
    (12, 'Okuma', 'Đài Loan'),
    (13, 'Savage Gear', 'Đan Mạch'),
    (14, 'Coleman', 'Hoa Kỳ'),
    (15, 'Naturehike', 'Trung Quốc'),
    (16, 'Snow Peak', 'Nhật Bản'),
    (17, 'Quechua', 'Pháp');

DROP TEMPORARY TABLE IF EXISTS seed_supplier_map;
CREATE TEMPORARY TABLE seed_supplier_map (
    seq INT PRIMARY KEY,
    supplier_code VARCHAR(30) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    address_text VARCHAR(200) NOT NULL,
    email_text VARCHAR(120) NOT NULL,
    phone_text VARCHAR(30) NOT NULL
);

INSERT INTO seed_supplier_map
    (seq, supplier_code, supplier_name, address_text, email_text, phone_text)
VALUES
    (1, 'SUP-001', 'Fishing VietNam', 'Thành phố Hồ Chí Minh', 'sales@fishingvietnam.vn', '02873001001'),
    (2, 'SUP-002', 'Gang Fishing', 'Hà Nội', 'sales@gangfishing.vn', '02473001002'),
    (3, 'SUP-003', 'Đồ Câu Thành Lợi', 'Đà Nẵng', 'contact@thanhloifishing.vn', '023673001003'),
    (4, 'SUP-004', 'Saigon Fishing Center', 'Thành phố Hồ Chí Minh', 'order@saigonfishing.vn', '02873001004'),
    (5, 'SUP-005', 'Đại lý Đồ câu Hoàng Nam', 'Cần Thơ', 'sales@hoangnam.vn', '029273001005'),
    (6, 'SUP-006', 'Công ty TNHH Thuận Phát Fishing', 'Bình Dương', 'sales@thuanphatfishing.vn', '027473001006'),
    (7, 'SUP-007', 'OceanPro Distribution', 'Hải Phòng', 'sales@oceanpro.vn', '022573001007'),
    (8, 'SUP-008', 'BlueRiver Tackle', 'Đồng Nai', 'order@blueriver.vn', '025173001008'),
    (9, 'SUP-009', 'Mekong Anglers', 'Cần Thơ', 'sales@mekonganglers.vn', '029273001009'),
    (10, 'SUP-010', 'LakeMaster Vietnam', 'Lâm Đồng', 'contact@lakemaster.vn', '026373001010'),
    (11, 'SUP-011', 'CampGear Asia', 'Thành phố Hồ Chí Minh', 'sales@campgear.asia', '02873001011'),
    (12, 'SUP-012', 'Outdoor Base Vietnam', 'Hà Nội', 'order@outdoorbase.vn', '02473001012'),
    (13, 'SUP-013', 'Pacific Tackle Supply', 'Khánh Hòa', 'sales@pacifictackle.vn', '025873001013'),
    (14, 'SUP-014', 'GreenTrail Supply', 'Đà Nẵng', 'contact@greentrail.vn', '023673001014');

START TRANSACTION;

-- Add missing brands without duplicating existing records.
INSERT INTO brands (name, country)
SELECT m.brand_name, m.country_name
FROM seed_brand_map m
WHERE NOT EXISTS (
    SELECT 1 FROM brands b WHERE UPPER(b.name) = UPPER(m.brand_name)
);

-- Update missing country information on existing brands.
UPDATE brands b
JOIN seed_brand_map m ON UPPER(m.brand_name) = UPPER(b.name)
SET b.country = m.country_name;

-- Add/update suppliers by their stable supplier code.
INSERT INTO suppliers
    (code, name, address, email, phone, products_provided, created_at)
SELECT
    m.supplier_code, m.supplier_name, m.address_text, m.email_text, m.phone_text,
    'Thiết bị câu cá và dã ngoại', CURRENT_TIMESTAMP(6)
FROM seed_supplier_map m
WHERE NOT EXISTS (
    SELECT 1 FROM suppliers s WHERE s.code = m.supplier_code
);

UPDATE suppliers s
JOIN seed_supplier_map m ON m.supplier_code = s.code
SET s.name = m.supplier_name,
    s.address = m.address_text,
    s.email = m.email_text,
    s.phone = m.phone_text,
    s.products_provided = 'Thiết bị câu cá và dã ngoại';

-- Add the four major categories and five product types under each category.
INSERT INTO categories (name, parentid, sort_order, sub_categories)
SELECT roots.root_name, NULL, roots.sort_order, NULL
FROM (
    SELECT 'Biển' AS root_name, 1 AS sort_order
    UNION ALL SELECT 'Sông', 2
    UNION ALL SELECT 'Hồ', 3
    UNION ALL SELECT 'Cắm trại', 4
) roots
WHERE NOT EXISTS (
    SELECT 1 FROM categories c
    WHERE c.parentid IS NULL AND UPPER(c.name) = UPPER(roots.root_name)
);

INSERT INTO categories (name, parentid, sort_order, sub_categories)
SELECT DISTINCT
    t.type_name,
    root.id,
    1 + MOD(t.type_no - 1, 5),
    NULL
FROM seed_types t
JOIN categories root
  ON root.parentid IS NULL AND UPPER(root.name) = UPPER(t.root_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM categories child
    WHERE child.parentid = root.id AND UPPER(child.name) = UPPER(t.type_name)
);

-- Insert exactly ten products for each seeded product type.
INSERT INTO products
    (name, image, description, material, action, code, stock, is_visible,
     catid, brandid, supplierid, time, location, usage_type)
SELECT
    CONCAT(t.type_name, ' ', bm.brand_name, ' ', m.model_label),
    t.image_path,
    t.description_text,
    t.material_name,
    'Sản phẩm mới',
    CONCAT('SEED26-', t.code_prefix, '-', LPAD(m.n, 2, '0')),
    12 + MOD(t.type_no * 7 + m.n * 5, 45),
    b'1',
    child.id,
    (
        SELECT b.id FROM brands b
        WHERE UPPER(b.name) = UPPER(bm.brand_name)
        ORDER BY b.id LIMIT 1
    ),
    (
        SELECT s.id FROM suppliers s
        WHERE s.code = sm.supplier_code
        ORDER BY s.id LIMIT 1
    ),
    CAST(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000 AS UNSIGNED) + t.type_no * 10 + m.n,
    NULL,
    t.usage_type
FROM seed_types t
CROSS JOIN seed_models m
JOIN seed_brand_map bm ON bm.seq = 1 + MOD(t.type_no * 3 + m.n - 1, 17)
JOIN seed_supplier_map sm ON sm.seq = 1 + MOD(t.type_no * 5 + m.n - 1, 14)
JOIN categories root
  ON root.parentid IS NULL AND UPPER(root.name) = UPPER(t.root_name)
JOIN categories child
  ON child.parentid = root.id AND UPPER(child.name) = UPPER(t.type_name)
WHERE NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.code = CONCAT('SEED26-', t.code_prefix, '-', LPAD(m.n, 2, '0'))
);

-- Every product gets one sellable default SKU with a price in 100,000-3,000,000 VND.
INSERT INTO product_variants
    (sku, variant_name, base_price, discount_price, stock_quantity, productid)
SELECT
    CONCAT('SKU-', p.code),
    'Tiêu chuẩn',
    LEAST(3000000, t.min_price + t.price_step * (m.n - 1)),
    NULL,
    p.stock,
    p.id
FROM seed_types t
CROSS JOIN seed_models m
JOIN products p
  ON p.code = CONCAT('SEED26-', t.code_prefix, '-', LPAD(m.n, 2, '0'))
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.sku = CONCAT('SKU-', p.code)
);

COMMIT;

-- Verification summary.
SELECT
    root.name AS major_category,
    child.name AS product_type,
    COUNT(p.id) AS seeded_products,
    MIN(pv.base_price) AS minimum_price,
    MAX(pv.base_price) AS maximum_price,
    COUNT(DISTINCT p.supplierid) AS supplier_count,
    COUNT(DISTINCT p.brandid) AS brand_count
FROM seed_types t
JOIN categories root
  ON root.parentid IS NULL AND UPPER(root.name) = UPPER(t.root_name)
JOIN categories child
  ON child.parentid = root.id AND UPPER(child.name) = UPPER(t.type_name)
LEFT JOIN products p
  ON p.catid = child.id AND p.code LIKE 'SEED26-%'
LEFT JOIN product_variants pv ON pv.productid = p.id
GROUP BY root.name, child.name, t.type_no
ORDER BY t.type_no;

SELECT
    COUNT(DISTINCT p.id) AS total_seeded_products,
    COUNT(DISTINCT p.supplierid) AS total_suppliers_used,
    COUNT(DISTINCT p.brandid) AS total_brands_used,
    MIN(pv.base_price) AS catalog_minimum_price,
    MAX(pv.base_price) AS catalog_maximum_price,
    SUM(pv.stock_quantity) AS total_seeded_stock
FROM products p
JOIN product_variants pv ON pv.productid = p.id
WHERE p.code LIKE 'SEED26-%';
