//スライダー
/* --------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
// スライドショー（画像リスト）
const slider1El = document.querySelector('.slider1');
if (slider1El) {
  const splide1 = new Splide(slider1El, {
    type: 'loop',
    autoplay: true,
    interval: 5000,
    pagination: true, // ページ番号を表示する
    arrows: false,
  });
  splide1.on('pagination:mounted', function (data) {
    data.list.classList.add('splide__pagination--custom');
    data.items.forEach(function (item, index) {
      item.button.textContent = String(index + 1);
    });
  });
  splide1.mount();
}

// スライドショー2
const slider2El = document.querySelector('.slider2');
if (slider2El) {
  const splide2 = new Splide(slider2El, {
    type: 'loop',
    autoplay: true,
    interval: 5000,
    pagination: true,
    perPage: 4,
    perMove: 1,
    focus: 0,
    gap:10,
    drag: true,
    flickMaxPages: 1,
    flickPower    : 1,
    swipeDistanceThreshold: 400,
    breakpoints: {
    768: {
      perPage: 2,
      },
    480: {
      perPage: 1,
      },
    },
  });
  splide2.on('pagination:mounted', function (data) {
    data.list.classList.add('splide__pagination--custom');
    // ページ数のカウント方法を修正
    data.items.forEach(function (item, index) {
      item.button.textContent = String(index + 1);
    });
  });
  splide2.mount();
 }
});

//タブ切り替え
/* --------------------------------------------------- */
$(function () {
  /*初期表示*/
  $('.tab_panel').hide();
  $('.tab_panel').eq(0).show();
  $('.tab_change').eq(0).addClass('is-active');
  /*クリックイベント*/
  $('.tab_change').each(function () {
    $(this).on('click', function () {
      var index = $('.tab_change').index(this);
      $('.tab_change').removeClass('is-active');
      $(this).addClass('is-active');
      $('.tab_panel').hide();
      $('.tab_panel').eq(index).show();
    });
  });
});