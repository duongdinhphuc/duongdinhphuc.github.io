# duongdinhphuc.github.io

| Trang | Đường dẫn | Thư mục |
|---|---|---|
| Trang chủ (mục lục) | https://duongdinhphuc.github.io/ | `index.html` |
| Giáng Sinh | https://duongdinhphuc.github.io/christmas/ | `christmas/` |
| Sinh nhật (5/12) | https://duongdinhphuc.github.io/birthday/ | `birthday/` — xem `birthday/README.md` |

Thêm trang mới: tạo thư mục mới có `index.html` bên trong, rồi thêm một thẻ vào `index.html` ở trang chủ.

Link thiệp cũ dạng `/?to=...&msg=...` được trang chủ tự chuyển sang `/christmas/`.

## Phần dùng chung (`assets/`)

- `theme-init.js`: nạp trong `<head>`, chọn ngày/đêm trước khi trang hiện (6h–18h là ngày, hoặc theo lựa chọn của người xem tới mốc giờ kế tiếp). Thêm lớp ánh sáng **bình minh** (5h–7h) và **hoàng hôn** (17h–19h) trên nền trời (`html[data-phase]`, lớp `.site-tint`).
- `site.css` + `site.js`: nút **← Trang chủ** (trang con), nút **nhạc** và nút **ngày/đêm** (hiệu ứng vòng tròn). Cuối trang gọi `Site.init({...})`, xem chú thích đầu `site.js`.

Trang mới chỉ cần nạp 3 file này và gọi `Site.init({homeHref:'../', music:{start,stop}})`.

Khi sửa file trong `assets/`, tăng số `?v=` ở các thẻ `<link>`/`<script>` của mọi trang để trình duyệt tải bản mới (GitHub Pages cho trình duyệt giữ file cũ khoảng 10 phút).
