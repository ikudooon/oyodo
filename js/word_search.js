/* ページ内検索 検索窓ドラッグ対応JavaScript */
/*
highlight v5
Highlights arbitrary terms.
<https://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>
MIT license.
Johann Burkard
<https://johannburkard.de>
<mailto:jb@eaio.com>
*/
jQuery.fn.highlight = function(pat) {
  function innerHighlight(node, pat) {
    var skip = 0;
    if (node.nodeType == 3) {
      var pos = node.data.toUpperCase().indexOf(pat);
      pos -= (node.data.substr(0, pos).toUpperCase().length - node.data.substr(0, pos).length);
      if (pos >= 0) {
        var strongnode = document.createElement('strong');
        strongnode.className = 'highlight';
        var middlebit = node.splitText(pos);
        var endbit = middlebit.splitText(pat.length);
        var middleclone = middlebit.cloneNode(true);
        strongnode.appendChild(middleclone);
        middlebit.parentNode.replaceChild(strongnode, middlebit);
        skip = 1;
      }
    }
    else if (node.nodeType == 1 && node.childNodes && !/(script|style|caption)/i.test(node.tagName)) {
    // css等でdisplay:noneが設定されていると検索対象から外す
      const styles = window.getComputedStyle(node);
      const displayValue = styles.getPropertyValue('display');
      if(displayValue !== "none"){
        for (var i = 0; i < node.childNodes.length; ++i) {
          i += innerHighlight(node.childNodes[i], pat);
        }
      }
    }
    return skip;
  }
  return this.length && pat && pat.length ? this.each(function() {
    innerHighlight(this, pat.toUpperCase());
  }) : this;
};

jQuery.fn.removeHighlight = function() {
  return this.find("strong.highlight").each(function() {
    this.parentNode.firstChild.nodeName;
    with (this.parentNode) {
      replaceChild(this.firstChild, this);
      normalize();
    }
  }).end();
};
function fncHighlight(code) {
  if(code == 13){ // エンターキーが押された時
    var word = $("#word").val().replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ").split(" ");
    for (i in word) {
      if (word[i] != "") {
        $("#body").removeHighlight();
        $("#body").highlight(word[i]);
        var id = 0;
        var all = $('.highlight').length;
        if(all > 0){
          var ypos = $(".highlight").offset().top;
          //ハイライトされたワードそれぞれに番号を振る
          $('.highlight').each(function (){
            if(id==0){
              $(this).addClass('active');
            }
            $(this).attr('id',"h_"+id);
            $(this).data('val',id);
            id++;
          });

          var $obj =  $("#h_0");
          move($obj);
          $obj.addClass("highlight2");
          $("#all_no").text(all+"件中");
          $("#now_no").text("1件目");
          $("#word").blur();
          $("#next").focus();
          //window.scrollTo({
          //  left: 0,
          //  top: ypos,
          //  behavior: "smooth"
          //});
        }else{
          $("#all_no").text("見つかりませんでした。");
        }
      }
    }
  }
}
function fncNext(){
  var word = $("#word").val();
  if(word != ""){
    $("#all_no").text($('.highlight').length+"件中");
    var val1 = $(".active").data('val');
    var val2 = $(".active").data('val') + 1;
    if(val2 == $('.highlight').length){
      $("#h_" + val1).removeClass("highlight2");
      $("#h_0").addClass("highlight2");
      $("#now_no").text("1件目");
      move($("#h_0"));
    }else{
      $("#h_" + val1).removeClass("highlight2");
      $("#h_" + val2).addClass("highlight2");
      now = val2 + 1;
      $("#now_no").text(now+"件目");
      move($("#h_" + val2));
    }
  }
}
function fncPrev(){
  var word = $("#word").val();
  if(word != ""){
    $("#all_no").text($('.highlight').length+"件中");
    var val1 = $(".active").data('val');
    var val2 = $(".active").data('val')-1;
    var all = $('.highlight').length;
    var now = val2 + 1;

    if(val2 >= 0){
      $("#h_" + val1).removeClass("highlight2");
      $("#h_" + val2).addClass("highlight2");
      $("#now_no").text(now+"件目");
      move($("#h_" + val2));
    }else{
      $("#now_no").text(all+"件目");
      var last = $('.highlight').length-1;
      $("#h_" + val1).removeClass("highlight2");
      $("#h_" + last).addClass("highlight2");
      move($("#h_" + last));
    }
  }
}

//現在の選択状態のキーワードから次のワードのところまで移動
function move($obj){
  $('.current').text($obj.data('val')+1);
  $('.highlight').removeClass('active');
  $obj.addClass("active");
  var pos = $obj.offset();
  //$(window).scrollTop(pos.top);
 
  var header = 0;
  if($('.main_header'+'.clone-nav').length > 0){ // 追従ヘッダーを考慮
    header = $('.main_header'+'.clone-nav')[0].offsetHeight;
  }
  if($('.float_set'+'.is-show').length <= 0){
    // ページ内検索エリアが画面上部にあると検索結果がズレるため補正
    if(window.innerWidth >= 1024){
      header = header + 60;
    }else{
      header = $('.tetsuzuki_page_search')[0].offsetHeight * 0.8;
    }
  }
  
  // ビューポートの高さの50%分下にオフセット
  var viewportOffset = window.innerHeight * 0.5;
  
  $(window).scrollTop(pos.top - header - viewportOffset);
}

$(function(){
  $("#word_search").click(function(){
    $(".float_set").show();
    $("#word_search").hide();
  });
  $("#float_close").click(function(){
    $(".float_set").hide();
    $("#word_search").show();
  });
  $("#reset").click(function(){
    $("#word").val("");
  });

});
