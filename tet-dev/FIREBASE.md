# Cây lộc chung (Tết) – cài đặt Firebase

Trang Tết dùng chung project Firebase `birthday-b79b6` với trang sinh nhật.

- **86 bao** (`e01`–`e86`) dùng chung cho mọi người. Mỗi bao chỉ một người hái được.
- **Mỗi người 1 bao mỗi ngày.** Ngày tính theo giờ Việt Nam, bắt đầu lúc 0h.
- **5 bao giải thưởng.** Nội dung giải nằm trong Firebase, chỉ người vừa hái đúng bao đó mới đọc được.

Nếu chưa làm bước 1 thì trang tự chạy ở **chế độ cây riêng** (mỗi người một cây, hái thoải mái). Trang không bị lỗi.

## 1. Bật đăng nhập ẩn danh

Firebase Console → **Build → Authentication** → *Get started* (nếu chưa bật) → tab **Sign-in method** → **Anonymous** → **Enable** → **Save**.

Người xem không phải đăng nhập gì. Mỗi trình duyệt tự được cấp một mã ẩn danh, và luật ở bước 2 dùng mã này để giới hạn mỗi người 1 bao mỗi ngày.

## 2. Luật bảo vệ (Firestore → Rules)

Thay **toàn bộ** nội dung tab Rules bằng đoạn dưới (đã gồm luật cũ của trang sinh nhật), rồi bấm **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // ---------- Trang sinh nhật ----------
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

    // ---------- Trang Tết: cây lộc chung ----------
    function vnDay() { return int((request.time.toMillis() + 25200000) / 86400000); }   // ngày theo giờ VN
    function dailyId() { return request.auth.uid + '_' + string(vnDay()); }

    // Bao đã có người hái: ai cũng xem được (để đếm "còn X/86"); chỉ tạo mới, mỗi bao 1 lần
    match /tet2027_claims/{env} {
      allow read: if true;
      allow create: if request.auth != null
        && env.matches('e(0[1-9]|[1-7][0-9]|8[0-6])')
        && request.resource.data.keys().hasOnly(['uid','day','ts'])
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.day == vnDay()
        && request.resource.data.ts == request.time
        && !exists(/databases/$(db)/documents/tet2027_daily/$(dailyId()))
        && existsAfter(/databases/$(db)/documents/tet2027_daily/$(dailyId()));
      allow update, delete: if false;
    }
    // Đánh dấu "hôm nay người này đã hái" (tạo cùng lúc với bao)
    match /tet2027_daily/{id} {
      allow get: if request.auth != null && id == dailyId();
      allow create: if request.auth != null && id == dailyId()
        && request.resource.data.keys().hasOnly(['env'])
        && request.resource.data.env is string
        && existsAfter(/databases/$(db)/documents/tet2027_claims/$(request.resource.data.env))
        && getAfter(/databases/$(db)/documents/tet2027_claims/$(request.resource.data.env)).data.uid == request.auth.uid;
      allow list, update, delete: if false;
    }
    // Nội dung giải: chỉ người vừa hái đúng bao đó mới đọc được; chỉ bạn sửa trong Console
    match /tet2027_prizes/{env} {
      allow get: if request.auth != null
        && exists(/databases/$(db)/documents/tet2027_claims/$(env))
        && get(/databases/$(db)/documents/tet2027_claims/$(env)).data.uid == request.auth.uid;
      allow list, write: if false;
    }
    // Người trúng để lại tên + cách liên lạc; chỉ bạn xem được trong Console
    match /tet2027_winners/{env} {
      allow create: if request.auth != null
        && exists(/databases/$(db)/documents/tet2027_prizes/$(env))
        && get(/databases/$(db)/documents/tet2027_claims/$(env)).data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['name','contact','ts'])
        && request.resource.data.name is string && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 60
        && request.resource.data.contact is string && request.resource.data.contact.size() <= 100
        && request.resource.data.ts == request.time;
      allow read, update, delete: if false;
    }
  }
}
```

## 3. Đặt 5 bao giải

Firestore → **Data** → **+ Start collection**:

- Collection ID: `tet2027_prizes`
- Mỗi giải là một document:
  - **Document ID**: mã bao, ví dụ `e17`. Chọn 5 mã ngẫu nhiên trong `e01`–`e86`, và **không ghi mã này vào code hay repo**, vì repo công khai.
  - Field `title` (string): tên giải, ví dụ `Lì xì 100.000đ`
  - Field `note` (string, không bắt buộc): lời nhắn, ví dụ `Nhắn mình qua Zalo để nhận nhé!`

## 4. Xem ai trúng giải

Firestore → **Data**:
- `tet2027_winners`: mỗi document là một bao giải đã có người trúng, gồm `name`, `contact`, `ts`.
- `tet2027_claims`: tất cả các bao đã được hái, kèm mã ẩn danh và ngày hái.

## Năm sau

Đổi `POOL` trong `index.html` (ví dụ `tet2028`) và đổi tên các collection trong luật tương ứng, là có cây mới.
