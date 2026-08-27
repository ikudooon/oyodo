function getColorCookie(){
	//color
	var p;
	pName = "F_Color=";
	tmpCookie = document.cookie + ";";
	start = tmpCookie.indexOf(pName);
    // CSSのパスセット
    dir_path = getMainCssPath();
	if (start != -1)
	{
		end = tmpCookie.indexOf(";", start);
		p = tmpCookie.substring(start + pName.length, end);
		changeCSS(p);
	}
}

function getMainCssPath(){
    var root;
    var scripts = document.getElementsByTagName("link");
    var i = scripts.length;
    while (i--) {
        var match = scripts[i].href.match(/(^|.*\/)color01\.css$/);
        if (match) {
            root = match[1];
            break;
        }
    }
    return root;
}

////色合いの変更　//////////////////////////////////////////////////////////////////////////////
var targetLINK  = "changecss";
var css_keyword = "color";
var dir_path = getMainCssPath('..css/color02.css');		//CSSファイルを置いてあるディレクトリを絶対パスで指定すること
//
function setColorCookie(s){
	cName = "F_Color=";
	exp = new Date();
	exp.setTime(exp.getTime() + 31536000000);
	document.cookie = cName + s + "; path=/;";
}
//
function changeCSS(par) {
	if(!par || par=="") return;
	var target = document.getElementById(targetLINK);

	if(!target) {
		links = document.getElementsByTagName('link');
		for(var i=0;i<links.length;i++) {
			temp = links[i].href;
			chk = temp.indexOf(css_keyword);
			if(chk!=-1) {
				target = links[i];
				break;
			}
		}
	}
	//
	if(!target || !target.cloneNode) {
		alert('ご利用のブラウザでは色合いの変更機能はご利用いただけないようです.\n[Element]or[cloneNode Method] None');
		return;
	}
	//

	var css_path = dir_path + par;
	//
//	var newNode = target.cloneNode(true);
//
//	target.parentNode.replaceChild(newNode,target);
    var link = document.createElement('link');
    with(link) {
        rel = 'stylesheet';
        id = targetLINK;
        type = 'text/css';
        href = css_path;
        media = 'screen,print';
    }
    var color_css = document.getElementById(targetLINK);
    var dom_obj_parent = color_css.parentNode;
    dom_obj_parent.removeChild(color_css);
    var head = document.getElementsByTagName("head");
    head.item(0).appendChild(link);

	setColorCookie(par);
}