
//子育て支援サイト_今日の日付
/* --------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date();

  document.getElementById('month').textContent = today.getMonth() + 1;
  document.getElementById('day').textContent = today.getDate();

  const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  document.getElementById('weekday').textContent = weekdays[today.getDay()];
});