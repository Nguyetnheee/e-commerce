# Báo cáo các API còn thiếu: Vòng đời Sản phẩm, Quản lý Kho & Tồn kho

Tài liệu này tổng hợp danh sách các API cần bổ sung ở phía Backend (BE) để hỗ trợ đầy đủ luồng vòng đời sản phẩm (Chương 9), chính sách hàng tồn kho (Chương 7) và quản lý kho (Chương 8) của hệ thống thương mại điện tử **WildStream**.

---

## 1. Phân hệ Quản lý Nhà cung cấp (Supplier Management)

### Hiện trạng
Trang quản trị đối tác (`/admin/suppliers`) đang lưu trữ danh sách nhà cung cấp trong `localStorage` (key: `admin_suppliers`). Không có API backend hay bảng cơ sở dữ liệu để lưu trữ thông tin này.

### Các API đề xuất bổ sung:

#### 1.1 Lấy danh sách nhà cung cấp
- **Endpoint:** `GET /api/v1/admin/suppliers`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
[
  {
    "id": "SUP-001",
    "name": "Shimano Japan Co.",
    "phone": "+81 6-6223-3211",
    "email": "sales@shimano.co.jp",
    "address": "Sakai, Osaka, Nhật Bản",
    "productsProvided": "Cần câu, Máy câu",
    "createdAt": "2026-07-10T08:00:00Z"
  },
  {
    "id": "SUP-002",
    "name": "Daiwa Corporation",
    "phone": "+81 42-475-2111",
    "email": "info@daiwa.co.jp",
    "address": "Higashikurume, Tokyo, Nhật Bản",
    "productsProvided": "Cần câu, Dây câu, Lưỡi câu",
    "createdAt": "2026-07-10T08:05:00Z"
  }
]
```

#### 1.2 Thêm nhà cung cấp mới
- **Endpoint:** `POST /api/v1/admin/suppliers`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": "Naturehike Co. Ltd",
  "phone": "+86 574-88308801",
  "email": "global@naturehike.com",
  "address": "Ninh Ba, Chiết Giang, Trung Quốc",
  "productsProvided": "Lều trại, Lò sưởi dã ngoại"
}
```
- **Response (201 Created):**
```json
{
  "id": "SUP-003",
  "name": "Naturehike Co. Ltd",
  "phone": "+86 574-88308801",
  "email": "global@naturehike.com",
  "address": "Ninh Ba, Chiết Giang, Trung Quốc",
  "productsProvided": "Lều trại, Lò sưởi dã ngoại",
  "createdAt": "2026-07-18T12:00:00Z"
}
```

#### 1.3 Xóa nhà cung cấp
- **Endpoint:** `DELETE /api/v1/admin/suppliers/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "message": "Xóa nhà cung cấp thành công"
}
```

---

## 2. Phân hệ Nhập kho vật lý (Warehouse Receiving Vouchers)

### Hiện trạng
Trang vận hành kho (`/kho/dashboard` -> tab Lịch sử Phiếu Nhập) lưu trữ dữ liệu lô hàng nhập khẩu bằng `localStorage` (key: `kho_vouchers`). Chưa có API bulk-import cập nhật đồng loạt các mặt hàng kèm giá nhập kho và vị trí kệ.

### Các API đề xuất bổ sung:

#### 2.1 Tạo phiếu nhập kho (Bulk-Import & Restock)
API này cho phép lưu trữ thông tin phiếu nhập, ghi nhận giá trị lô hàng, đồng thời **tự động tăng tồn kho** của tất cả các biến thể tương ứng trong DB và ghi nhật ký vào bảng `inventory_logs`.
- **Endpoint:** `POST /api/v1/admin/warehouse/receipts`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "supplier": "Shimano Japan Co.",
  "notes": "Nhập lô cần câu Stella phục vụ mùa hè 2026",
  "items": [
    {
      "sku": "SKU-SEA-001-STD",
      "qty": 50,
      "price": 12000000,
      "shelf": "Kệ A-03"
    },
    {
      "sku": "SKU-SEA-002-STD",
      "qty": 30,
      "price": 8500000,
      "shelf": "Kệ C-12"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "code": "PNK-20260718-4820",
  "supplier": "Shimano Japan Co.",
  "notes": "Nhập lô cần câu Stella phục vụ mùa hè 2026",
  "createdBy": "kho@wildstream.com",
  "createdAt": "2026-07-18T12:40:00Z",
  "totalQty": 80,
  "totalValue": 855000000,
  "items": [
    {
      "sku": "SKU-SEA-001-STD",
      "qty": 50,
      "price": 12000000,
      "shelf": "Kệ A-03"
    },
    {
      "sku": "SKU-SEA-002-STD",
      "qty": 30,
      "price": 8500000,
      "shelf": "Kệ C-12"
    }
  ]
}
```

#### 2.2 Lấy danh sách phiếu nhập kho
- **Endpoint:** `GET /api/v1/admin/warehouse/receipts`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
[
  {
    "code": "PNK-20260718-4820",
    "supplier": "Shimano Japan Co.",
    "createdAt": "2026-07-18T12:40:00Z",
    "totalQty": 80,
    "totalValue": 855000000,
    "createdBy": "kho@wildstream.com"
  }
]
```

#### 2.3 Xem chi tiết một phiếu nhập kho
- **Endpoint:** `GET /api/v1/admin/warehouse/receipts/{code}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Trả về đầy đủ cấu trúc phiếu nhập bao gồm danh sách mặt hàng nhập (`items`).

---

## 3. Quy trình Kiểm tra & Từ chối giao hàng (Receiving Quality Inspection)

### Quy tắc nghiệp vụ (Chương 8.3 & 8.4)
Hàng hóa từ nhà cung cấp bàn giao phải được nhân viên kho kiểm đếm và kiểm tra (Số lượng, Bao bì, Mô hình sản phẩm, Tình trạng sản phẩm, Phụ kiện, Thẻ bảo hành). Nếu kiểm tra thất bại -> từ chối nhận hàng và báo cáo lên quản trị viên.

### Các API đề xuất bổ sung:

#### 3.1 Ghi nhận biên bản kiểm tra chất lượng (Inspection Log)
- **Endpoint:** `POST /api/v1/admin/warehouse/inspections`
- **Request Body:**
```json
{
  "supplier": "Daiwa Corporation",
  "inspectType": "IMPORT", 
  "status": "FAILED", 
  "notes": "Hộp sản phẩm bị ướt, móp méo nặng do vận chuyển",
  "checklist": {
    "quantityMatched": true,
    "packagingIntact": false,
    "modelCorrect": true,
    "conditionGood": false,
    "accessoriesIncluded": true,
    "warrantyCardIncluded": true
  },
  "rejectedQuantity": 15
}
```
- **Response (201 Created):**
```json
{
  "inspectionId": 402,
  "status": "REJECTED_REPORTED",
  "reportedToAdmin": true,
  "createdAt": "2026-07-18T12:45:00Z"
}
```

---

## 4. Quy trình Đổi trả hàng & Kiểm định (Returns & Refund/Disposal)

### Quy tắc nghiệp vụ (Chương 9 & 7.4)
Đơn hàng bị lỗi từ phía khách hàng chuyển hoàn về -> Nhân viên kho thực hiện kiểm định chất lượng:
- **Bổ sung (Restock):** Nếu hàng còn mới, đóng gói lại tốt -> cộng lại tồn kho.
- **Thải bỏ (Dispose):** Nếu hàng hỏng hóc nặng -> tiêu hủy và không cộng lại tồn kho.

### Các API đề xuất bổ sung:

#### 4.1 Lấy danh sách yêu cầu đổi trả (Returns List)
- **Endpoint:** `GET /api/v1/admin/returns`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
[
  {
    "id": "RET-101",
    "orderId": "2026-07-01-9982",
    "customerName": "Trần Minh Hoàng",
    "productName": "Máy câu Shimano Stella SW",
    "variantId": 1,
    "variantSku": "WS-SHI-STELLA",
    "quantity": 1,
    "reason": "Hàng trầy xước nhẹ khi vận chuyển",
    "date": "2026-07-10",
    "status": "PENDING_INSPECTION"
  }
]
```

#### 4.2 Lấy chi tiết một biến thể bằng ID (Variant Details)
Dùng để kiểm tra nhanh mức tồn kho hiện tại của một biến thể cụ thể trước khi thực hiện thao tác Restock hoặc điều chỉnh.
- **Endpoint:** `GET /api/v1/admin/variants/{id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "id": 1,
  "sku": "WS-SHI-STELLA",
  "name": "Tiêu chuẩn",
  "basePrice": 18500000,
  "discountPrice": null,
  "stockQuantity": 100,
  "productId": 4
}
```

#### 4.3 Phê duyệt đổi trả & Tái nhập kho (Restock Return)
Cộng tự động số lượng hoàn trả vào tồn kho của hệ thống.
- **Endpoint:** `POST /api/v1/admin/returns/{id}/restock`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "returnId": "RET-101",
  "status": "RESTOCKED",
  "message": "Sản phẩm đã được đưa về trạng thái Có sẵn (Available) và cộng tồn kho thành công.",
  "newStock": 101
}
```

#### 4.4 Phê duyệt đổi trả & Thải bỏ (Dispose Return)
Không cộng vào tồn kho, ghi nhận hao hụt/hư hỏng.
- **Endpoint:** `POST /api/v1/admin/returns/{id}/dispose`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "returnId": "RET-101",
  "status": "DISPOSED",
  "message": "Sản phẩm được ghi nhận thải bỏ/tiêu hủy thành công."
}
```
