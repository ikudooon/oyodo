/* =========================================================
  ▼一部ページだけの機能（今回runIfExistsでガード）
========================================================= */

/* ========= しきい値と速度 ========= */
const CFG = {
  bp: { PC: 1025, TAB_MIN: 769, TAB_MAX: 1024 },
  speed: { none: 0, fast: 300, slow: 500 },
  scroll: { headerShow: 180, floatShow: 400 }
};

/* ========= キー判定 ========= */
const Key = {
  isEnter:  function(e){ return e.key === 'Enter'  || e.keyCode === 13; },
  isSpace:  function(e){ return e.key === ' '      || e.key === 'Spacebar' || e.keyCode === 32; },
  isTab:    function(e){ return e.key === 'Tab'    || e.keyCode === 9;  },
  isEscape: function(e){ return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27; }
};

/* =========================================================
  runIfExists（安全装置）
========================================================= */
const DEBUG = false;

function runIfExists(featureName, requiredSelector, initFunction) {
  if (!document.querySelector(requiredSelector)) {
    if (DEBUG) console.log('[skip]', featureName);
    return;
  }
  if (DEBUG) console.log('[init]', featureName);
  initFunction();
}

/* =========================================================
  初期化
========================================================= */
$(function(){

  /* ===== 全ページ共通 ===== */
  initBlockLinkForNonInlineAnchors();
  initTableImageLinkBlock();
  initFocusRingForKeyboardOnly();
  initDisableTelLinksOnPc();
  initDrawerMenu();
  initCloneHeader();
  initAccordionCommon();
  initGlobalNavAccordion();

  /* ===== 一部ページのみ ===== */
  runIfExists('手続きナビ追従', '.float_set', initFloatSetFollowNavigation);
  runIfExists('table scroll', '.mol_tableblock', initTableScrollMol);
  runIfExists('table scroll main', '.main_naka_kiji .mol_tableblock', initTableScrollMainNaka);
  runIfExists('ごみ分別検索', '#frm_main', initGarbageSearch);
  runIfExists(
    'ページ内リンク：フォーカス可視化（追従ヘッダーあり）',
    '.f_v_button',
    initFocusVisibleForInPageLinks
  );
//  runIfExists(
//    'ページ内リンク：フォーカス可視化（追従ヘッダーなし）',
//    '.f_v_button',
//    initFocusVisibleForInPageLinks_NoStickyHeader
//  );
});


/* ============================================================================
   [全ページ] インライン以外のa要素をinline-blockに
============================================================================ */
function initBlockLinkForNonInlineAnchors() {
  document.querySelectorAll('p, li, th, td').forEach(function(el){
    var hasText = Array.from(el.childNodes).some(function(n){
      return n.nodeType === 3 && n.textContent.trim() !== '';
    });

    if (hasText) return;

    var a = el.querySelector('a');
    if (a) a.classList.add('block-link');
  });
}

/* ============================================================================
   [全ページ] テーブル内の画像リンクをblockにする
============================================================================ */
function initTableImageLinkBlock() {
  document.querySelectorAll('table a').forEach(function(a){
    if (a.querySelector('img')) {
      a.style.display = 'block';
    }
  });
}

/* ============================================================================
   [全ページ] フォーカスの見え方（キーボード操作のときだけ強調）
   - Tabキー操作で body に「user-tabbing」を付け、マウス操作に戻ったら外します。
============================================================================ */
function initFocusRingForKeyboardOnly() {
  var isTabbing = false;

  window.addEventListener('keydown', function(e){
    if (!Key.isTab(e)) return;
    document.body.classList.add('user-tabbing');
    isTabbing = true;
  });

  window.addEventListener('mousedown', function(){
    if (!isTabbing) return;
    document.body.classList.remove('user-tabbing');
    isTabbing = false;
  });
}

/* ============================================================================
   [全ページ] PCのみ「電話リンク（tel:）」を押せないようにする＋Tab移動も止める
============================================================================ */
function initDisableTelLinksOnPc() {
  const $win = $(window);
  const $tel = $('[href^="tel:"]');

  function isPc() {
    return window.innerWidth >= CFG.bp.PC;
  }

  function applyTabIndex() {
    if (isPc()) {
      $tel.attr('tabIndex', -1);
    } else {
      $tel.attr('tabIndex', 0);
    }
  }

  function onClickTel(e) {
    if (isPc()) e.preventDefault();
  }

  $tel.off('.tel').on('click.tel', onClickTel);
  $win.off('.tel').on('load.tel resize.tel', applyTabIndex);

  applyTabIndex();
}

/* ============================================================================
   [全ページ] 「メニュー」ボタン（開閉）
   - 開ボタン: #menu_button .menu（button.menu に data-target="#drawer"）
   - 閉ボタン: #menu_button2 .menu
   - 対象: #drawer.drawer-nav（ドロワー本体は1つ）
   - ポイント: 開いたボタンを記憶し、閉じたらそのボタンへフォーカスを戻す
============================================================================ */
function initDrawerMenu() {
  var isAnimate = false;

  // ★追加：最後に「開いた」ボタンを記憶（追従ヘッダー/通常ヘッダー両対応）
  var lastOpenedBtn = null;

  // ------------------------------------------------------------
  // フォーカス移動（scrollジャンプを防げるブラウザでは preventScroll を使う）
  // ------------------------------------------------------------
  function focusSafe($el) {
    if (!$el || !$el.length) return;
    var el = $el[0];

    try {
      // 一部ブラウザで scroll を抑止できる
      el.focus({ preventScroll: true });
    } catch (e) {
      // 古いブラウザ用
      $el.focus();
    }
  }

  // ------------------------------------------------------------
  // ドロワー内の「フォーカス可能要素」を取得（Tab終端判定に使う）
  // ------------------------------------------------------------
  function getFocusableIn($drawer) {
    return $drawer
      .find('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')
      .filter(function () {
        var $el = $(this);
        var ti = $el.attr('tabindex');
        if (!$el.is(':visible')) return false;
        if (ti && parseInt(ti, 10) < 0) return false;
        return true;
      });
  }

  // ------------------------------------------------------------
  // 開く
  // ------------------------------------------------------------
  function openDrawer($drawer, $openedBtn) {
    if (!$drawer.length) return;
    if (isAnimate) return;
    if ($drawer.hasClass('d_open')) return;

    // ★開いたボタンを記憶
    lastOpenedBtn = $openedBtn && $openedBtn.length ? $openedBtn : lastOpenedBtn;

    isAnimate = true;
    $drawer.addClass('d_open');

    $drawer.stop(true, true).slideDown(CFG.speed.slow).promise().done(function () {
      isAnimate = false;

      // 開いたら「閉じる」ボタンへフォーカス
      var $closeBtn = $drawer.find('#menu_button2 .menu').first();
      focusSafe($closeBtn);
    });
  }

  // ------------------------------------------------------------
  // 閉じる
  // ------------------------------------------------------------
  function closeDrawer($drawer) {
    if (!$drawer.length) return;
    if (isAnimate) return;
    if (!$drawer.hasClass('d_open')) return;

    isAnimate = true;
    $drawer.removeClass('d_open');

    $drawer.stop(true, true).slideUp(CFG.speed.slow).promise().done(function () {
      isAnimate = false;

      // ★閉じたら「開いた元のボタン」へフォーカスを戻す
      if (lastOpenedBtn && lastOpenedBtn.length) {
        focusSafe(lastOpenedBtn);
      }
    });
  }

  // ============================================================
  // 1) 開ボタン（クリック / Enter / Space）
  // ============================================================
  $(document)
    .off('.drawerOpenBtn')
    .on('click.drawerOpenBtn', '#menu_button .menu', function (e) {
      e.preventDefault();

      var $openBtn = $(this);
      var targetSel = $openBtn.data('target') ||
        ($openBtn.attr('aria-controls') ? ('#' + $openBtn.attr('aria-controls')) : null);

      if (!targetSel) return;

      var $drawer = $(targetSel);
      openDrawer($drawer, $openBtn);
    })
    .on('keydown.drawerOpenBtn', '#menu_button .menu', function (e) {
      if (!(Key.isEnter(e) || Key.isSpace(e))) return;
      e.preventDefault();

      var $openBtn = $(this);
      var targetSel = $openBtn.data('target') ||
        ($openBtn.attr('aria-controls') ? ('#' + $openBtn.attr('aria-controls')) : null);

      if (!targetSel) return;

      var $drawer = $(targetSel);
      openDrawer($drawer, $openBtn);
    });

  // ============================================================
  // 2) 閉ボタン（クリック / Enter / Space）
  // ============================================================
  $(document)
    .off('.drawerCloseBtn')
    .on('click.drawerCloseBtn', '#menu_button2 .menu', function (e) {
      e.preventDefault();

      var $closeBtn = $(this);
      var $drawer = $closeBtn.closest('.drawer-nav');
      closeDrawer($drawer);
    })
    .on('keydown.drawerCloseBtn', '#menu_button2 .menu', function (e) {
      if (!(Key.isEnter(e) || Key.isSpace(e))) return;
      e.preventDefault();

      var $closeBtn = $(this);
      var $drawer = $closeBtn.closest('.drawer-nav');
      closeDrawer($drawer);
    });

  // ============================================================
  // 3) Tab：最後の要素で Tab → 閉じる
  // ============================================================
  $(document)
    .off('.drawerTabEnd')
    .on('keydown.drawerTabEnd', function (e) {
      if (!Key.isTab(e) || e.shiftKey) return;

      var $active = $(document.activeElement);
      var $drawer = $active.closest('.drawer-nav:visible');
      if (!$drawer.length) return;

      var $focusable = getFocusableIn($drawer);
      var $last = $focusable.last();

      if ($last.length && document.activeElement === $last[0]) {
        e.preventDefault();
        closeDrawer($drawer);
      }
    });

  // ============================================================
  // 4) ドロワー内にフォーカスが入ったら開く
  // ============================================================
  $(document)
    .off('.drawerFocusIn')
    .on('focusin.drawerFocusIn', '.drawer-nav *', function () {
      var $drawer = $(this).closest('.drawer-nav');
      if (!$drawer.length) return;

      if ($drawer.hasClass('d_open')) return;

      // ドロワーにフォーカスが入った＝開く（開いたボタンが分からないので記憶は更新しない）
      openDrawer($drawer, lastOpenedBtn);
    });

  // ============================================================
  // 5) Escで閉じる（今フォーカス中のドロワーだけ閉じる）
  // ============================================================
  $(document)
    .off('.drawerEsc')
    .on('keydown.drawerEsc', function (e) {
      if (!Key.isEscape(e)) return;

      var $active = $(document.activeElement);
      var $drawer = $active.closest('.drawer-nav:visible');
      if (!$drawer.length) return;

      e.preventDefault();
      closeDrawer($drawer);
    });
}

/* ============================================================================
   [全ページ] 追従ヘッダー
   - 使用しない場合はcommon.cssの* 追従メニュー *とhtml{scroll-padding-top: 97px; overflow: auto;}を削除する
============================================================================ */
function initCloneHeader() {
  var $win = $(window);
  var $sourceHeader = $('.clone_header');

  // 元になるヘッダーがなければ何もしない
  if (!$sourceHeader.length) return;

  // ----------------------------
  // クローンヘッダーを取得 or 作成
  // ----------------------------
  var $cloneHeader = $('.clone_header.clone-nav');

  if (!$cloneHeader.length) {
    $cloneHeader = $sourceHeader.clone()
      .addClass('clone-nav')
      .appendTo('body');
  }

  // ★重要：クローン内に重複して入ってしまう #drawer を削除（ID重複の根本対策）
  $cloneHeader.find('#drawer').remove();

  var SHOW_CLASS = 'is-show';

  // requestAnimationFrame が二重に走らないためのフラグ
  var rafId = null;

  // ★追加：表示中だけ状態を補足するための軽い監視（常時ではない）
  var watchdogId = null;

  function stopWatchdog() {
    if (watchdogId !== null) {
      clearInterval(watchdogId);
      watchdogId = null;
    }
  }

  function startWatchdog() {
    if (watchdogId !== null) return;

    // 表示中だけ、短い間隔で scrollTop を補足して「先頭に戻ったのに消えない」事故を防ぐ
    watchdogId = setInterval(function () {
      // rAF待ちがあれば邪魔しない
      if (rafId !== null) return;

      updateCloneHeader();

      // 既に非表示になったら監視停止
      if (!$cloneHeader.hasClass(SHOW_CLASS)) {
        stopWatchdog();
      }
    }, 200);
  }

  // ----------------------------
  // 表示・非表示を判定する処理
  // ----------------------------
  function updateCloneHeader() {
    rafId = null;

    var windowWidth = window.innerWidth;
    var scrollTop = $win.scrollTop();

    // タブレット以上 かつ 一定スクロール量を超えたら表示
    if (
      windowWidth >= CFG.bp.TAB_MAX &&
      scrollTop > CFG.scroll.headerShow
    ) {
      $cloneHeader.addClass(SHOW_CLASS);

      // ★表示中は監視を開始（イベント取りこぼし対策）
      startWatchdog();
    } else {
      $cloneHeader.removeClass(SHOW_CLASS);

      // ★非表示になったら監視停止
      stopWatchdog();
    }
  }

  // ----------------------------
  // 判定処理を requestAnimationFrame でまとめる
  // ----------------------------
  function requestUpdate() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(updateCloneHeader);
  }

  // ----------------------------
  // イベント登録
  // - scroll/resize に加えて、環境によって取りこぼしが出やすいイベントも追加
  // ----------------------------
  $win
    .off('.cloneNav')
    .on('load.cloneNav scroll.cloneNav resize.cloneNav orientationchange.cloneNav', requestUpdate);

  // モバイル等で scroll が取りこぼされるケース対策（あっても害は少ない）
  $(document)
    .off('.cloneNavDoc')
    .on('touchmove.cloneNavDoc', requestUpdate);

  // 初期表示用
  requestUpdate();
}

/* ============================================================================
   [全ページ] アコーディオン共通（開閉）
   - 施設マップ（.ac_display_map）は本文をJSで変更しない
   - Tabでパネルを抜けたら閉じる（.ac_box01/.ac_box02/.ac_box_map/.ac_box_lang）
   - 施設マップだけ、開いた直後にパネル内へフォーカスを自動移動しない
============================================================================ */
function initAccordionCommon() {
  (function ($) {
    'use strict';

    // ============================================================
    // 設定
    // ============================================================
    var WRAP_SEL  = '.ac_box_wrap';
    var PANEL_SEL = '.ac_box_in';

    var BTN_SEL = [
      '.ac_display_01',
      '.ac_display_02',
      '.ac_display_lang',
      '.ac_display_map',
      '.ac_display_ema'
    ].join(',');

    var SPEED = CFG.speed.fast;

    var DEFAULT_LABEL_OPEN_JP  = '表示';
    var DEFAULT_LABEL_CLOSE_JP = '隠す';
    var DEFAULT_LABEL_OPEN_EN  = 'open';
    var DEFAULT_LABEL_CLOSE_EN = 'close';

    var JS_INIT_CLASS = 'acc-js-init';

    // ============================================================
    // 端末判定
    // ============================================================
    function isPC() {
      return window.innerWidth >= CFG.bp.PC;
    }

    // ============================================================
    // 「開いている時のクラス名」：ボタン種別ごと（既存互換）
    // - 施設マップ（.ac_display_map）の開閉・アクセシビリティ挙動は共通のものを使用
    // - ただし、共通アコーディオンの文言切替ロジックから除外
    // ============================================================
    function getActiveClass($btn) {
      if ($btn.is('.ac_display_map')) return 'ac_map_active';
      return 'active';
    }

    // ============================================================
    // aria
    // ============================================================
    function setAria($btn, $panel, expanded) {
      $btn.attr('aria-expanded', expanded ? 'true' : 'false');
      $panel.attr('aria-hidden', expanded ? 'false' : 'true');
    }

    // ============================================================
    // ★施設マップ：ボタン本文の保護＆復元（誤上書き対策）
    // ============================================================
    function ensureMapButtonText($wrap, $btn) {
      if (!$btn.is('.ac_display_map')) return;
      if (!$wrap.hasClass('ac_box_map')) return;

      var current = $.trim($btn.text());

      var isBroken =
        !current ||
        current === DEFAULT_LABEL_OPEN_JP ||
        current === DEFAULT_LABEL_CLOSE_JP ||
        current === DEFAULT_LABEL_OPEN_EN ||
        current === DEFAULT_LABEL_CLOSE_EN;

      if (!isBroken) return;

      var $closeLink = $wrap.find('.close a').first();
      if (!$closeLink.length) return;

      var t = $.trim($closeLink.text());
      if (!t) return;

      t = t.replace(/を隠す\s*$/, '').trim();
      if (!t) return;

      $btn.text(t);
    }

    // ============================================================
    // ボタン文言更新（data-label-open / data-label-close があれば優先）
    // ★重要：.ac_display_map はボタン本文を書き換えない
    // ============================================================
    function updateBtnText($btn, isOpen) {
      if ($btn.is('.ac_display_map')) return;

      var openText, closeText;

      if ($btn.is('.ac_display_lang')) {
        openText  = DEFAULT_LABEL_OPEN_EN;
        closeText = DEFAULT_LABEL_CLOSE_EN;
      } else {
        openText  = DEFAULT_LABEL_OPEN_JP;
        closeText = DEFAULT_LABEL_CLOSE_JP;
      }

      openText  = $btn.data('labelOpen')  || openText;
      closeText = $btn.data('labelClose') || closeText;

      $btn.text(isOpen ? closeText : openText);
    }

    // ============================================================
    // ★施設マップ：closeリンク文言を「ボタン本文 + を隠す」に更新
    // ============================================================
    function updateMapCloseLabel($wrap, $btn) {
      if (!$wrap.hasClass('ac_box_map')) return;
      if (!$btn.is('.ac_display_map')) return;

      ensureMapButtonText($wrap, $btn);

      var btnText = $.trim($btn.text());
      if (!btnText) return;

      var $closeLink = $wrap.find('.close a').first();
      if (!$closeLink.length) return;

      $closeLink.text(btnText + 'を隠す');
    }

    // ============================================================
    // 今この幅でアコーディオンとして有効か？
    // ============================================================
    function isEnabledNow($wrap, $btn) {
      // PCで無効（既存互換）
      if (isPC() && $wrap.hasClass('no-acc-pc')) return false;

      // PC表示の main 内 .ac_box01 は無効（ただし .ac_display_01 の場合に限定）
      var isPageIndexBox = $wrap.hasClass('ac_box01') && $wrap.closest('main').length > 0;
      if (isPC() && isPageIndexBox && $btn.is('.ac_display_01')) return false;

      // .ac_display_01 は SPのみ
      if ($btn.is('.ac_display_01') && isPC()) return false;

      return true;
    }

    // ============================================================
    // デフォルト open 判定
    // ============================================================
    function getDefaultOpen($wrap, $btn) {
      // data-acc-default-pc / sp があれば最優先
      var key = isPC() ? 'accDefaultPc' : 'accDefaultSp';
      var v = $wrap.data(key);
      if (v !== undefined) return String(v) === 'open';

      // パターンクラス（または未指定なら主要2パターンから推定）
      var pat = null;

      if ($wrap.hasClass('acc_pat_01')) pat = '01';
      else if ($wrap.hasClass('acc_pat_02')) pat = '02';
      else if ($wrap.hasClass('acc_pat_03')) pat = '03';
      else if ($wrap.hasClass('acc_pat_04')) pat = '04';
      else {
        if ($btn.is('.ac_display_01')) pat = '01';
        else if ($btn.is('.ac_display_02')) pat = '03';
      }

      if (pat === '01') return isPC() ? true : false;
      if (pat === '02') return true;
      if (pat === '03') return false;
      if (pat === '04') return isPC() ? true : false;

      // それ以外（既存互換）：HTMLに既に付いている active class を尊重
      return $wrap.hasClass(getActiveClass($btn));
    }

    // 「他を閉じる」：デフォclosedのタイプだけ発動
    function shouldCloseOthers($wrap, $btn) {
      return !getDefaultOpen($wrap, $btn);
    }

    // ============================================================
    // ★施設マップ用：同一グループ（.map_cate_wrap）内の他を閉じる（排他）
    // ============================================================
    function closeOtherMapItems($btn) {
      var $currentLi = $btn.closest('li.ac_box_map');
      if (!$currentLi.length) return;

      var $root = $currentLi.closest('.map_cate_wrap');
      if (!$root.length) return;

      var mapActiveCls = 'ac_map_active';

      $root.find('li.ac_box_map').not($currentLi).each(function () {
        var $li = $(this);

        var $wrap = $li.is(WRAP_SEL) ? $li : $li.find(WRAP_SEL).first();
        var $panel = $li.find(PANEL_SEL).first();
        var $b = $li.find('.ac_display_map').first();

        if (!$panel.length || !$b.length) return;

        ensureMapButtonText($wrap.length ? $wrap : $li, $b);

        $li.removeClass(mapActiveCls);
        if ($wrap.length) $wrap.removeClass(mapActiveCls);

        setAria($b, $panel, false);
        $panel.stop(true, true).slideUp(SPEED);
      });
    }

    // ============================================================
    // 開く／閉じる
    // ============================================================
    function openOne($btn) {
      var $wrap  = $btn.closest(WRAP_SEL);
      var $panel = $wrap.find(PANEL_SEL).first();
      if (!$wrap.length || !$panel.length) return;

      var onCls  = getActiveClass($btn);

      // 施設マップは排他で他を閉じる
      if ($btn.is('.ac_display_map')) {
        ensureMapButtonText($wrap, $btn);
        closeOtherMapItems($btn);
      } else {
        // 同じ親配下で他を閉じる
        if (shouldCloseOthers($wrap, $btn)) {
          $wrap.parent().find(WRAP_SEL).not($wrap).each(function () {
            var $w = $(this);
            var $b = $w.find(BTN_SEL).first();
            var $p = $w.find(PANEL_SEL).first();
            if (!$b.length || !$p.length) return;

            if (!isEnabledNow($w, $b)) return;
            if (getDefaultOpen($w, $b)) return;

            $w.removeClass(getActiveClass($b));
            setAria($b, $p, false);
            $p.stop(true, true).slideUp(SPEED);
            updateBtnText($b, false);
          });
        }
      }

      // 自分を開く
      $wrap.addClass(onCls);
      setAria($btn, $panel, true);

      // mapだけ close文言追従
      updateMapCloseLabel($wrap, $btn);

      $panel.stop(true, true).slideDown(SPEED, function () {

        // ★追加要件：施設マップは「開いた直後にパネル内へフォーカス移動しない」
        // → ボタンにフォーカスを残す（ユーザーがTabで中へ入る）
        if ($btn.is('.ac_display_map')) {
          return;
        }

        // それ以外（共通仕様）：開いたら中の最初の操作要素へ（無ければパネル）
        var $first = $panel
          .find('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]')
          .filter(function () {
            var $el = $(this);
            var ti = $el.attr('tabindex');
            if (!$el.is(':visible')) return false;
            if (ti && parseInt(ti, 10) < 0) return false;
            return true;
          })
          .first();

        ($first.length ? $first : $panel).focus();
      });

      updateBtnText($btn, true);
    }

    function closeOne($btn, restoreFocus) {
      var $wrap  = $btn.closest(WRAP_SEL);
      var $panel = $wrap.find(PANEL_SEL).first();
      if (!$wrap.length || !$panel.length) return;

      var onCls  = getActiveClass($btn);

      // mapは本文維持＆close文言追従
      if ($btn.is('.ac_display_map')) {
        ensureMapButtonText($wrap, $btn);
        updateMapCloseLabel($wrap, $btn);
      }

      $wrap.removeClass(onCls);
      setAria($btn, $panel, false);

      $panel.stop(true, true).slideUp(SPEED, function () {
        if (restoreFocus) $btn.focus();
      });

      updateBtnText($btn, false);
    }

    function toggleOne($btn) {
      var $wrap = $btn.closest(WRAP_SEL);
      if (!isEnabledNow($wrap, $btn)) return;

      if ($wrap.hasClass(getActiveClass($btn))) {
        closeOne($btn, true);
      } else {
        openOne($btn);
      }
    }

    // ============================================================
    // クリック／Enter／Space（ボタン類）
    // ============================================================
    $(document)
      .off('.accToggle')
      .on('click.accToggle', BTN_SEL, function (e) {
        e.preventDefault();
        toggleOne($(this));
      })
      .on('keydown.accToggle', BTN_SEL, function (e) {
        if (!(Key.isEnter(e) || Key.isSpace(e))) return;
        e.preventDefault();
        toggleOne($(this));
      });

    // ============================================================
    // closeリンク（.close a）で閉じる
    // ============================================================
    $(document)
      .off('.accCloseLink')
      .on('click.accCloseLink', WRAP_SEL + ' .close a', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $wrap = $(this).closest(WRAP_SEL);
        if (!$wrap.length) return;

        var $btn = $wrap.find(BTN_SEL).first();
        if (!$btn.length) return;

        if (!isEnabledNow($wrap, $btn)) return;

        closeOne($btn, true);
      })
      .on('keydown.accCloseLink', WRAP_SEL + ' .close a', function (e) {
        if (!(Key.isEnter(e) || Key.isSpace(e))) return;
        e.preventDefault();
        e.stopPropagation();
        $(this).trigger('click');
      });

    // ============================================================
    // Tabでパネルを抜けたら閉じる（共通化）
    // 対象：.ac_box01 / .ac_box02 / .ac_box_map / .ac_box_lang
    // ============================================================
    $(document)
      .off('.accTabClose')
      .on(
        'keydown.accTabClose',
        WRAP_SEL + '.ac_box01 ' + PANEL_SEL + ', ' +
        WRAP_SEL + '.ac_box02 ' + PANEL_SEL + ', ' +
        WRAP_SEL + '.ac_box_map ' + PANEL_SEL + ', ' +
        WRAP_SEL + '.ac_box_lang ' + PANEL_SEL,
        function (e) {

          if (!Key.isTab(e)) return;

          var $panel = $(this);
          var $wrap  = $panel.closest(WRAP_SEL);
          if (!$wrap.length) return;

          var $btn = $wrap.find(BTN_SEL).first();
          if (!$btn.length) return;

          if (!isEnabledNow($wrap, $btn)) return;
          if (!$wrap.hasClass(getActiveClass($btn))) return;

          var $focusables = $panel
            .find('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')
            .filter(function () {
              var $el = $(this);
              var ti  = $el.attr('tabindex');
              if (!$el.is(':visible')) return false;
              if (ti && parseInt(ti, 10) < 0) return false;
              return true;
            });

          if (!$focusables.length) {
            e.preventDefault();
            closeOne($btn, true);
            return;
          }

          var firstEl = $focusables.first()[0];
          var lastEl  = $focusables.last()[0];

          if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            closeOne($btn, true);
            return;
          }

          if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            closeOne($btn, true);
            return;
          }
        }
      );

    // ============================================================
    // 初期状態（load/resize で適用）
    // ★重要：HTML側の acc-init を尊重（初期状態をJSで上書きしない）
    // ============================================================
    var $win = $(window);
    var lastIsPc = isPC();

    function applyInitialToOne($wrap, forceOnCross) {
      var $btn = $wrap.find(BTN_SEL).first();
      var $panel = $wrap.find(PANEL_SEL).first();
      if (!$btn.length || !$panel.length) return;

      // acc-init があるものはHTML主導
      if ($wrap.hasClass('acc-init')) {
        if ($btn.is('.ac_display_map')) {
          ensureMapButtonText($wrap, $btn);
          updateMapCloseLabel($wrap, $btn);
        }
        return;
      }

      var onCls = getActiveClass($btn);

      // PCで無効 → 常時開
      if (!isEnabledNow($wrap, $btn)) {
        $wrap.addClass(onCls);
        $panel.show();
        setAria($btn, $panel, true);

        updateMapCloseLabel($wrap, $btn);
        updateBtnText($btn, true);
        return;
      }

      // 初回 or 端末跨ぎでデフォルト適用
      if (!$wrap.hasClass(JS_INIT_CLASS) || forceOnCross) {
        var wantOpen = getDefaultOpen($wrap, $btn);

        if (wantOpen) {
          $wrap.addClass(onCls);
          $panel.show();
          setAria($btn, $panel, true);

          updateMapCloseLabel($wrap, $btn);
          updateBtnText($btn, true);
        } else {
          $wrap.removeClass(onCls);
          $panel.hide();
          setAria($btn, $panel, false);

          updateBtnText($btn, false);
        }

        $wrap.addClass(JS_INIT_CLASS);
      }
    }

    function applyAll() {
      var nowIsPc = isPC();
      var crossed = (nowIsPc !== lastIsPc);
      lastIsPc = nowIsPc;

      $(WRAP_SEL).each(function () {
        applyInitialToOne($(this), crossed);
      });
    }

    $win.off('.accInit').on('load.accInit resize.accInit', applyAll);
    applyAll();

  })(jQuery);
}

/* ============================================================================
   [全ページ] グローバルナビ専用アコーディオン（.g_nav_open）(不要な場合は削除)
============================================================================ */
function initGlobalNavAccordion() {
  const rootSel = '.g_nav_open';
  const activeClass = 'open';

  /* =====================================================
     【追加A】今回の修正を当てる対象にだけ .gNavFix を付与
     - drawer_menu内
     - clone_header配下は除外（既存動作を残したいので“CSS/押し下げ/中央化”だけ除外）
  ===================================================== */
  $(`${rootSel}`).each(function(){
    const $root = $(this);
    const inDrawer = $root.closest('.drawer_menu').length > 0;
    const inClone  = $root.closest('.clone_header').length > 0;
    if (inDrawer && !inClone) $root.addClass('gNavFix');
  });

  function isFixTarget($root){
    return $root.hasClass('gNavFix') && window.innerWidth >= 769;
  }

  function clearVars($root, $panel){
    if (!$root.length || !$panel.length) return;
    if (!isFixTarget($root)) return;
    $root[0].style.removeProperty('--gNav-space');
    $panel[0].style.removeProperty('--arrow-left');
  }

  function applyVars($root, $btn, $panel){
    if (!isFixTarget($root)) return;

    // 表示後に計測したいので次フレーム
    requestAnimationFrame(function(){
      if (!$panel.hasClass(activeClass) || !$panel.is(':visible')) return;

      // 1) 押し下げ量：パネル高さ - 欲しい余白px分(矢印の高さ14px + 要素下部の余白 )
      const h = $panel.outerHeight(true) || 0;
      const space = Math.max(h - -32, 0);
      $root[0].style.setProperty('--gNav-space', space + 'px');

      // 2) 矢印：ボタン中心 → パネル左端からのpx
      const btnRect = $btn[0].getBoundingClientRect();
      const panelRect = $panel[0].getBoundingClientRect();
      const arrowLeftPx = (btnRect.left + btnRect.width / 2) - panelRect.left;
      $panel[0].style.setProperty('--arrow-left', arrowLeftPx + 'px');
    });
  }

  $(document).off('.gNavToggle').on('click.gNavToggle', `${rootSel} .ac_box_nav_sub > button`, function(e){
    e.preventDefault();

    const $btn = $(this);
    const $root = $btn.closest(rootSel);
    const $panel = $btn.closest('.ac_box_nav').find('.ac_box_nav_in').first();

    // 他を閉じる（※既存動作維持：hideはそのまま）
    $btn.closest(rootSel).find('.ac_box_nav_in').not($panel).each(function(){
      const $p = $(this);
      $p.removeClass(activeClass).hide();

      // 【追加】769px以上の時の「メニュー」配下だけCSS変数掃除
      const $r = $p.closest(rootSel);
      const $b = $p.closest('.ac_box_nav').find('.ac_box_nav_sub > button').first();
      if ($b.length) $b.attr('aria-expanded', 'false');
      clearVars($r, $p);
    });

    // トグル
    if ($panel.hasClass(activeClass)) {
      $panel.removeClass(activeClass).hide();
      $btn.attr('aria-expanded', 'false');

      // 【追加】769px以上の時の「メニュー」配下だけCSS変数掃除
      clearVars($root, $panel);

    } else {
      $panel.addClass(activeClass).show();
      $btn.attr('aria-expanded', 'true');

      // 【追加】769px以上の時の「メニュー」配下だけ押し下げ＆矢印位置を反映
      applyVars($root, $btn, $panel);

      const $focusable = $panel.find('a,button,input').filter(':visible').first();
      if ($focusable.length) $focusable.focus();
    }
  });

  // close（aでもbuttonでも）
  $(document)
    .off('.gNavClose')
    .on('click.gNavClose', `${rootSel} .nav_sub_close a, ${rootSel} .nav_sub_close button`, function(e){
      e.preventDefault();
      e.stopPropagation();

      const $acBox = $(this).closest('.ac_box_nav');
      const $btn   = $acBox.find('.ac_box_nav_sub > button').first();
      const $panel = $acBox.find('.ac_box_nav_in').first();
      const $root  = $acBox.closest(rootSel);

      $panel.removeClass(activeClass).hide();
      $btn.attr('aria-expanded', 'false').focus();

      // 【追加】769px以上の時の「メニュー」配下だけCSS変数掃除
      clearVars($root, $panel);
    })
    .on('keydown.gNavClose', `${rootSel} .nav_sub_close a`, function(e){
      if (!(Key.isEnter(e) || Key.isSpace(e))) return;
      e.preventDefault();
      e.stopPropagation();
      $(this).trigger('click');
    });

  // ESCで閉じる
  $(document).off('.gNavEsc').on('keydown.gNavEsc', `${rootSel} .ac_box_nav_in`, function(e){
    if (!Key.isEscape(e)) return;

    const $panel = $(this);
    const $btn = $panel.closest('.ac_box_nav').find('.ac_box_nav_sub > button').first();
    const $root = $panel.closest(rootSel);

    $panel.removeClass(activeClass).hide();
    $btn.attr('aria-expanded', 'false').focus();

    // 【追加】今回の修正対象だけCSS変数掃除
    clearVars($root, $panel);
  });

  // 端で閉じる（Tab／Shift+Tab）
  $(document).off('.gNavTabEdge').on('keydown.gNavTabEdge', `${rootSel} .ac_box_nav_in`, function(e){
    if (!Key.isTab(e)) return;

    const $panel = $(this);
    const $btn   = $panel.closest('.ac_box_nav').find('.ac_box_nav_sub > button').first();
    const $root  = $panel.closest(rootSel);

    const $focusables = $panel.find('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')
      .filter(function(){
        const $el = $(this);
        const ti  = $el.attr('tabindex');
        return $el.is(':visible') && !(ti && parseInt(ti, 10) < 0);
      });

    const closeAndFocus = function(){
      $panel.removeClass(activeClass).hide();
      $btn.attr('aria-expanded', 'false').focus();
      clearVars($root, $panel);
    };

    if (!$focusables.length) {
      e.preventDefault();
      closeAndFocus();
      return;
    }

    const firstEl = $focusables.first()[0];
    const lastEl  = $focusables.last()[0];

    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      closeAndFocus();
      return;
    }

    if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      closeAndFocus();
      return;
    }
  });

  /* =====================================================
     【追加D】リサイズ時：修正対象だけ再計算＋769跨ぎで残骸掃除
     - clone_headerは既存動作のまま
  ===================================================== */
  $(window).off('.gNavRecalc').on('resize.gNavRecalc', function(){
    // 修正対象で開いているパネルだけ再計算
    const $open = $(`${rootSel}.gNavFix .ac_box_nav_in.${activeClass}:visible`).first();
    if ($open.length) {
      const $btn = $open.closest('.ac_box_nav').find('.ac_box_nav_sub > button').first();
      const $root = $open.closest(rootSel);
      if ($btn.length) applyVars($root, $btn, $open);
    }

    // show/hide が残した display インラインを “跨ぎ” で掃除したい場合
    // → 769pxを跨ぐタイミングで閉じる＆style除去（必要最低限）
  });

  // 769pxを跨ぐ時は全て閉じて、インラインdisplay残骸を掃除（cloneも含む＝既存動作を壊さず初期化）
  let lastWide = window.innerWidth >= 769;
  $(window).off('.gNavBpReset').on('load.gNavBpReset resize.gNavBpReset', function(){
    const nowWide = window.innerWidth >= 769;
    if (nowWide === lastWide) return;
    lastWide = nowWide;

    $(`${rootSel} .ac_box_nav_in`).each(function(){
      const $p = $(this);
      const $btn = $p.closest('.ac_box_nav').find('.ac_box_nav_sub > button').first();
      const $root = $p.closest(rootSel);

      $p.removeClass(activeClass).hide().removeAttr('style'); // display残骸クリア
      if ($btn.length) $btn.attr('aria-expanded', 'false');
      clearVars($root, $p); // gNavFixならCSS変数も消える（cloneは何もしない）
    });

    // g_nav_open 側の padding-bottom も gNavFix なら消しておく
    $(`${rootSel}.gNavFix`).each(function(){
      this.style.removeProperty('--gNav-space');
    });
  });
}


/* ============================================================================
   [一部ページ] フォーカス可視化（ページ内リンク）
   - 追従ヘッダーがある場合に使用
============================================================================ */
function initFocusVisibleForInPageLinks() {
  $(document)
    .off('.focusVisibleJump')
    .on('click.focusVisibleJump', '.f_v_button', function (event) {
      event.preventDefault();

      var targetId = $(this).attr('href');
      if (!targetId || targetId.charAt(0) !== '#') return;

      var $target = $(targetId + '.focus_visible');
      if (!$target.length) return;

      $target.attr('tabindex', '0').focus();

      $target.one('blur.focusControl', function () {
        $(this).attr('tabindex', '-1');
      });
    });
}

/* ============================================================================
   [一部ページ] ページ内リンク用フォーカス可視化
   - 追従ヘッダーがない場合に使用
============================================================================ */
//function initFocusVisibleForInPageLinks_NoStickyHeader() {
//  $(document)
//    .off('.focusVisibleJump')
//    .on('click.focusVisibleJump', '.f_v_button', function () {
//
//      var targetId = $(this).attr('href');
//      if (!targetId || targetId.charAt(0) !== '#') return;
//
//      var $target = $(targetId + '.focus_visible');
//      if (!$target.length) return;
//
//      var prevTabIndex = $target.attr('tabindex');
//
//      // 一時的にフォーカス可能に
//      $target.attr('tabindex', '0');
//
//      // フォーカスを移動
//      $target.focus();
//
//      // フォーカスアウト時に元に戻す
//      $target.one('blur.focusVisibleJump', function () {
//        if (prevTabIndex === undefined || prevTabIndex === null) {
//          $(this).removeAttr('tabindex');
//        } else {
//          $(this).attr('tabindex', prevTabIndex);
//        }
//      });
//    });
//}


/* ============================================================================
   [一部ページ] table scroll（mol_tableblock）
============================================================================ */
function initTableScrollMol() {
  const $win = $(window);
  const $blocks = $('.mol_tableblock');
  if (!$blocks.length) return;

  function applyMol() {
    const ww = window.innerWidth;
    const ww2 = ww - 60;

    $blocks.each(function(){
      const $tbl = $(this).children('table');
      const tableW = $tbl.outerWidth();

      let ti;
      if (tableW > 1184) {
        ti = 0;
      } else if (ww2 >= tableW) {
        ti = -1;
      } else {
        ti = 0;
      }

      $tbl.attr('tabIndex', ti);
    });
  }

  $win.off('.molTbl').on('load.molTbl resize.molTbl', applyMol);
  applyMol();
}

/* ============================================================================
   [一部ページ] table scroll（.main_naka_kiji 内）
============================================================================ */
function initTableScrollMainNaka() {
  const $win = $(window);
  const $blocks = $('.main_naka_kiji .mol_tableblock');
  if (!$blocks.length) return;

  function applyMain() {
    const ww = window.innerWidth;
    const ww2 = ww - 60;

    $blocks.each(function(){
      const $tbl = $(this).children('table');
      const tableW = $tbl.outerWidth();

      let ti;
      if (tableW > 900) {
        ti = 0;
      } else if (ww2 >= tableW) {
        ti = -1;
      } else {
        ti = 0;
      }

      $tbl.attr('tabIndex', ti);
    });
  }

  $win.off('.mainMolTbl').on('load.mainMolTbl resize.mainMolTbl', applyMain);
  applyMain();
}

/* ============================================================================
   [一部ページ] ごみ分別検索（garbage_search01）
============================================================================ */
function initGarbageSearch() {
  $('#btn_garbage_search').off('.garb').on('click.garb', function(){
    $('#frm_main').submit();
  });

  $('.btn_garbage_tab').off('.garb').on('click.garb', function() {
    const kana_index_num = $(this).attr('data-kana_index_num');
    const kana_index = $(this).attr('data-kana_index');

    $('.btn_garbage_tab').removeClass('selected');
    $(this).addClass('selected');

    $('[id^="garbage_tab_"]').hide();

    if (Number(kana_index_num) === 0) {
      $('#hid_kana').val('');
      $('#frm_main').submit();
    } else {
      $('#garbage_tab_' + kana_index_num).css('display', 'flex');
    }
  });

  $('.btn_garbage_val').off('.garb').on('click.garb', function() {
    const kana = $(this).attr('data-kana_val');
    $('#hid_kana').val(kana);
    $('#frm_main').submit();
  });
}

/* ============================================================================
   [一部ページ] 手続きナビ：ページ内検索追従（.float_set）
============================================================================ */
function initFloatSetFollowNavigation() {
  const $win = $(window);
  const $cloneNav = $('.float_set');

  const showClass = 'is-show';
  let isTabbingFloat = false;
  let tabTimer = null;

  function showFloat() {
    $cloneNav.addClass(showClass);
  }
  function hideFloat() {
    $cloneNav.removeClass(showClass);
  }

  function evaluateFloat() {
    const s = $win.scrollTop();

    if (s > CFG.scroll.floatShow && !isTabbingFloat) {
      showFloat();
    } else {
      hideFloat();
    }
  }

  function onTabKey(e) {
    if (!Key.isTab(e)) return;

    isTabbingFloat = true;
    hideFloat();

    clearTimeout(tabTimer);
    tabTimer = setTimeout(function(){
      isTabbingFloat = false;

      if ($(window).scrollTop() > CFG.scroll.floatShow) {
        showFloat();
      }
    }, 2000);
  }

  $win.off('.floatSet').on('load.floatSet scroll.floatSet', evaluateFloat);
  $(document).off('.floatTab').on('keydown.floatTab', onTabKey);

  evaluateFloat();
}