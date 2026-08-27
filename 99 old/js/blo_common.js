//年月一覧
/* ----------------------------------------------------------------
$(function(){
  var isAnimate = false;
  var month_list_cou = $('.month_list_li li').length;
  if(month_list_cou > 13){
    $('.month_list_li').append('<div class="blog_list_more"><a href="javascript:void(0);"><span>年月一覧をもっと見る</span></a></div>');
  }

  $('.blog_list_more a').on('click', function () {
      if (isAnimate) { return; } else {
         $('.blog_list_more').toggleClass('active');
         if($('.blog_list_more').hasClass('active')){
            $('.blog_list_more a span').text('年月一覧を隠す');
         }else{
            $('.blog_list_more a span').text('年月一覧をもっと見る');
        }
        isAnimate = true;
        $('.month_list_li').toggleClass('active').promise().done(function(){
          isAnimate = false;
        });
      }
  });
});------------- */

//年月一覧
/* --------------------------------------------------- */
$(function(){
  var isAnimate = false;
  var month_list_cou = $('.folding_12 li').length;
  if(month_list_cou > 12){
  $('.month_list_li').each(function(i){
      $(this).find("li").each(function(i){
    if(i>=12){ $(this).addClass('over12'); }
      });
    $(this).find('.over12').insertAfter(this).wrapAll("<ul class='over12'></ul>");
    });

    $('ul.over12').before('<p class="blog_list_more blog_list_more1"><a href="javascript:void(0);" id="folding_12_more">年月一覧をもっと見る</a></p>');
    $('ul.over12').after('<p class="blog_list_more"><a href="#folding_12_more">年月一覧をもっと見る</a></p>');
  }
  
  $('.blog_list_more a').on('click', function () {
    if (isAnimate) { return; } else {
      $('.blog_list_more').toggleClass('active');
      if($('.blog_list_more').hasClass('active')){
        $('.blog_list_more a').text('年月一覧を隠す');
      }else{
        $('.blog_list_more a').text('年月一覧をもっと見る');
      }
      isAnimate = true;
      $('.folding_12 ul.over12').toggleClass('active').promise().done(function(){
        isAnimate = false;
      });
    }
  });
});