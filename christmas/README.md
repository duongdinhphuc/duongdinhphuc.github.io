# 🎄 Christmas Website

Website tĩnh về Giáng Sinh, chỉ gồm 1 file `index.html`.

## Tính năng
- 🎁 Màn mở đầu: bấm hộp quà → nắp bật, pháo giấy bay → vào trang chính
- ✍️ Chữ "Merry Christmas" tự viết ra từng nét
- 🎵 Nhạc nền có nút bật/tắt (tự phát khi mở hộp quà)
- 🌙 Tự đổi cảnh theo giờ: 6h–17h là ban ngày, còn lại là ban đêm (có nút đổi tay)
- 🔥 Lò sưởi có lửa động, 5 chiếc tất – bấm vào để nhận lời chúc
- ❄️ Tuyết 3 lớp, sao băng, xe tuần lộc, dây đèn, ngôi làng phủ tuyết
- 💌 Tạo thiệp: xem trước, **tải ảnh PNG** (trên điện thoại sẽ mở bảng chia sẻ Zalo/Messenger), hoặc tạo link chia sẻ

## Nhạc nền
- Đặt một file tên **`music.mp3`** cùng thư mục với `index.html` → trang sẽ phát file đó.
- Nếu không có file, trang tự chơi giai điệu *Jingle Bells* (bài dân gian, không vướng bản quyền) bằng âm thanh tổng hợp.
- Nguồn nhạc miễn phí: Pixabay Music, YouTube Audio Library, Free Music Archive (chọn bài có giấy phép CC0 hoặc cho phép dùng tự do).
- Nên chọn file nhỏ (dưới 3–5 MB) để trang tải nhanh.

## Đưa lên GitHub Pages
1. Tạo repo mới, ví dụ `christmas` (hoặc `<username>.github.io` để làm trang chính).
2. Đẩy file lên nhánh `main`:
   ```bash
   git init
   git add .
   git commit -m "Christmas site"
   git branch -M main
   git remote add origin https://github.com/<username>/christmas.git
   git push -u origin main
   ```
3. Vào **Settings → Pages**, chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)` → **Save**.
4. Sau 1–2 phút, trang có ở `https://<username>.github.io/christmas/`.

## Tuỳ chỉnh nhanh
- Màu sắc: biến trong `:root` (ban đêm) và `:root.day` (ban ngày) ở đầu file.
- Giờ đổi ngày/đêm: tìm `h>=6&&h<17` (có ở 2 chỗ).
- Lời chúc ngẫu nhiên: mảng `wishes`. Lời chúc trong tất: object `STW`.
- Link thiệp: `?to=...&msg=...&from=...&theme=red|green|night|snow&font=dancing|vibes|playfair`

## Bản quyền nhạc
`music.mp3`: "Jingle Bells (Calm)" – Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 3.0 — https://creativecommons.org/licenses/by/3.0/
Nguồn: https://commons.wikimedia.org/wiki/File:Jingle_Bells_(Calm)_(ISRC_USUAN1100188).mp3
