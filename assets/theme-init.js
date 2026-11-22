/* Chọn ngày/đêm trước khi trang hiện ra (tránh nháy màn hình). Dùng chung cho mọi trang.
   - 6h–18h là ban ngày, còn lại là ban đêm.
   - Người xem tự bấm đổi thì giữ lựa chọn tới lần chuyển giờ kế tiếp (6h hoặc 18h).
   Đặt <html data-theme="light|dark"> và class "day" (trang Giáng sinh dùng class này). */
(function () {
  var d = document.documentElement;
  window.__period = function (t) {
    t = t || new Date();
    var h = t.getHours(), x = new Date(t);
    if (h < 6) x.setDate(x.getDate() - 1);
    return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate() + (h >= 6 && h < 18 ? 'd' : 'n');
  };
  window.__autoTheme = function () {
    var h = new Date().getHours();
    return h >= 6 && h < 18 ? 'light' : 'dark';
  };
  window.__wantedTheme = function () {
    var c = null;
    try { c = JSON.parse(localStorage.getItem('themeChoice') || 'null'); } catch (e) {}
    return c && c.p === __period() && (c.t === 'light' || c.t === 'dark') ? c.t : __autoTheme();
  };
  var t = __wantedTheme();
  d.dataset.theme = t;
  d.classList.toggle('day', t === 'light');
})();
