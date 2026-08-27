// JavaScript Document
function linebutton(){
var title = encodeURIComponent(document.title);
var url = encodeURIComponent(document.URL);

$('#snsln').append(' <a href="https://line.me/R/msg/text/?' + title + '%0A' + url + ' " target="_blank"><img src="images/line_btn.png" alt="">LINEで送る</a>');
}

window.addEventListener("load", function(){ linebutton(); }, false)