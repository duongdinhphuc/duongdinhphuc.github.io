# 🎂 Trang sinh nhật (05/12)

Trang `/birthday/` là trang sinh nhật của chủ trang (không ghi tên). Bạn bè vào để:

- **Thổi nến:** bằng micro (nếu cho phép) hoặc chạm vào từng ngọn nến. Tắt hết nến thì có pháo giấy và nhạc Happy Birthday.
- **Viết lời chúc:** ngay bên dưới bánh kem.
- **Xem đếm ngược** tới ngày 5/12. Đúng ngày thì trang chuyển sang lời chúc mừng.

## Đổi thông tin

Trong `birthday/index.html`, tìm dòng:

```js
const OWNER={day:5,month:12,year:1998,id:'bday-0512'};
```

- `day`, `month`: ngày và tháng sinh.
- `year`: dùng để tính số tuổi hiện trên bánh.
- `id`: mã dùng để gom lời chúc và số lượt thổi nến trong Firebase. Đổi `id` là bắt đầu lại từ đầu.

## Lưu lời chúc và số người thổi nến (Firebase, miễn phí)

Chưa cài Firebase thì lời chúc được gửi qua Zalo/Messenger (chia sẻ hoặc sao chép), và không hiện bộ đếm số người thổi nến. Cài Firebase xong thì ai vào trang cũng đọc được mọi lời chúc, và thấy dòng "Đã có N người thổi nến".

1. Vào https://console.firebase.google.com → **Add project** (tắt Google Analytics cũng được).
2. **Build → Firestore Database → Create database**, chọn vùng `asia-southeast1` (Singapore), chế độ **production**.
3. Tab **Rules**, dán đoạn sau rồi **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /wishes/{id} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['page','name','text','ts'])
                       && request.resource.data.page is string && request.resource.data.page.size() <= 16
                       && request.resource.data.name is string && request.resource.data.name.size() <= 40
                       && request.resource.data.text is string && request.resource.data.text.size() > 0
                       && request.resource.data.text.size() <= 300
                       && request.resource.data.ts is timestamp;
         allow update, delete: if false;
       }
       match /blows/{id} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['page','ts'])
                       && request.resource.data.page is string && request.resource.data.page.size() <= 16
                       && request.resource.data.ts is timestamp;
         allow update, delete: if false;
       }
     }
   }
   ```

4. **Project settings (⚙️) → General → Your apps → Web (</>)**, đăng ký app. Lấy `projectId` và `apiKey`.
5. Trong `birthday/index.html`, điền vào dòng `const FIREBASE={projectId:'',apiKey:''};`.

`apiKey` của Firebase web được phép để công khai. Quyền ghi do đoạn Rules ở trên kiểm soát: chỉ được **thêm** lời chúc ngắn và lượt thổi nến, không ai sửa hay xoá được. Muốn xoá một lời chúc không phù hợp, vào Firebase Console → Firestore → `wishes` rồi xoá tay.
