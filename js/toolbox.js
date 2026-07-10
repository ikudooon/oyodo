/* フォントサイズ */
function setCookie(s){
	cName = "fontsize_font=";
	exp = new Date();
	exp.setTime(exp.getTime() + 31536000000);
	document.cookie = cName + s + "; path=/" + "; expires=" + exp.toGMTString();
}

function getCookie(){
	zoom = "";
	cName = "fontsize_font=";
	tmpCookie = document.cookie + ";";

	start = tmpCookie.indexOf(cName);
	if (start != -1)
	{
		end = tmpCookie.indexOf(";", start);
		zoom = tmpCookie.substring(start + cName.length, end);
		document.getElementById("body").style.fontSize = zoom;
	} else {
		document.getElementById("body").style.fontSize = "100%";
	}
}

function textSizeUp(){
	currentSize = document.getElementById("body").style.fontSize;
	selectSize = "";
	if ( currentSize == "100%" ){
		selectSize = "110%";
	}
	else if ( currentSize == "110%" ){
		selectSize = "120%";
	}
	else if ( currentSize == "120%" ){
		selectSize = "150%";
	}
	else if ( currentSize == "150%" ){
		selectSize = "200%";
	}
	else if ( currentSize == "200%" ){
		m = escape("これ以上文字のサイズを大きくできません。");
		alert(unescape(m));
		selectSize = "200%";
	}
	else {
		selectSize = "110%";
	}
	document.getElementById("body").style.fontSize = selectSize;
	setCookie(selectSize);
}

function textSizeReset(){
	currentSize = document.getElementById("body").style.fontSize;
	m = escape("ただいまの文字サイズは" + currentSize + "（標準：100%）です。元に戻しますか？");
	r = confirm(unescape(m));
	if (r) {
		currentSize = "100%";
		document.getElementById("body").style.fontSize = currentSize;
	}
	setCookie(currentSize);
}

function pagePrint(){
	m = escape("このページを印刷（A4縦用紙）します。よろしいですか？");
	r = confirm(unescape(m));
	if (r) self.print();
}

function dispFootPrintList(){
    storage = sessionStorage;
    var panList = null;
    var panUrlList = null;
    var panHtml = "";
    var panArr = [];
    var panUrlArr = [];
    var title = "";
    var url = "";
    panList = storage.getItem('panList');
    panUrlList = storage.getItem('panUrlList');

    title = $("title").text().split(" | ")[0]; // タイトル名取得
    url = location.href; // URL取得

    if(panList != null && panUrlList != null){
        panArr = panList.split('\n');
        panUrlArr = panUrlList.split('>');
        if(panUrlArr[panUrlArr.length -1] != url){ // 違うページを表示した場合
            panList = panList +'\n'+ title;
            panUrlList = panUrlList +'>'+ url;
            panArr.push(title);
            panUrlArr.push(url);
        }
        if(panArr.length > 5){ // 5件まで表示
            start = panList.indexOf('\n');
            end = panList.length;
            panList = panList.substring(start+1,end);
            panArr.shift();
        }
        storage.setItem('panList',panList);
        if(panUrlArr.length > 5){ // 5件まで表示
            start = panUrlList.indexOf('>');
            end = panUrlList.length;
            panUrlList = panUrlList.substring(start+1,end);
            panUrlArr.shift();
        }
        storage.setItem('panUrlList',panUrlList);
        for(var index in panUrlArr){
            if(index == (panUrlArr.length - 1)){
                panHtml = panHtml + '<li>'+ panArr[index] +'</li>';
            }
            else{
                panHtml = panHtml + '<li><a href="' + panUrlArr[index] + '" class="block-link">' + panArr[index] + '</a></li>';
            }
        }
        if(panHtml != null && document.getElementById('pankuzu2') != null){ // あしあとリスト表示
            document.getElementById('pankuzu2').innerHTML = panHtml;
        }
    }
    else{
        if(panList == null){
            storage.setItem('panList',title);
        }
        if(panUrlList == null){
            storage.setItem('panUrlList',url);
        }
    }
}

// 足あと・色の反転
$(function(){
 dispFootPrintList();
 getCookie();
 getColorCookie();
});