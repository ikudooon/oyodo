// JavaScript Document
function twitterbutton(){
var title = encodeURIComponent(document.title);
var url = encodeURIComponent(document.URL);

$('#snstw').append(' <a href="https://twitter.com/intent/tweet?original_referer=' + url + '&source=tweetbutton&text=' + title + '&url=' + url + '"  target="_blank"><img src="images/X_btn.png" alt="">X（旧Twitter）でシェア</a>');
}

window.addEventListener("load", function(){ twitterbutton(); }, false)