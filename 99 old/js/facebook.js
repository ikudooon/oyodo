// JavaScript Document
function facebutton(){
var title = encodeURIComponent(document.title);
var url = encodeURIComponent(document.URL);

$('#snsfb').append('<a href="http://www.facebook.com/sharer.php?u=' + url + '&amp;t=' + title + '" target="_blank"><img src="images/fac_btn.png" alt="">Facebookでシェア</a>');
}

window.addEventListener("load", function(){ facebutton(); }, false)