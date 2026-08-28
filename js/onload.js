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
    // arrows: false,
    perPage: 3,
    perMove: 1,
    focus: 0,
    gap:'2.25rem',
    padding: 150,
    drag: true,
    flickMaxPages: 1,
    flickPower    : 1,
    swipeDistanceThreshold: 400,
    breakpoints: {
    1024: {
      perPage: 2,
      gap:'1.5rem',
      padding: 75,
      },
    500: {
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

// スライドショー3_子育て支援サイトメインビジュアル
const slider3El = document.querySelector('.slider3');
if (slider3El) {
  const splide3 = new Splide(slider3El, {
    type: 'fade',
    rewind: true,
    autoplay: true,
    interval: 5000,
    pagination: true, // ページ番号を表示する
    arrows: false,
  });
  splide3.on('pagination:mounted', function (data) {
    data.list.classList.add('splide__pagination--custom');
    data.items.forEach(function (item, index) {
      item.button.textContent = String(index + 1);
    });
  });
  splide3.mount();
}

// スライドショー4_子育て支援サイトフォトギャラリー
const slider4El = document.querySelector('.slider4');
if (slider4El) {
  const splide4 = new Splide(slider4El, {
    type: 'loop',
    autoplay: true,
    drag: true,
    interval: 5000,
    pagination: true, // ページ番号を表示する
    perPage: 2,
    perMove: 1,
    focus: 0,
    gap:'1.875rem',
    padding: 350,
    breakpoints: {
    1024: {
      padding: 150,
      },
    768: {
      gap:'1.25rem',
      },
    500: {
      perPage: 1,
      padding: 80,
      },
    },
  });
  splide4.on('pagination:mounted', function (data) {
    data.list.classList.add('splide__pagination--custom');
    data.items.forEach(function (item, index) {
      item.button.textContent = String(index + 1);
    });
  });
  splide4.mount();
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

