//デザインテンプレートポップアップ確認用js
$(function(){
    var g_stMypageName = $("#mypage_name").text() || "マイページ";
    var g_aMypage = new Array();
    
    // Cookieから既存データを読み込む
    for(i = 1; i <= 10; i++){
        g_aMypage[i] = " ";
    }
    
    // Cookie読み込み関数（簡易版）
    function subLoadCookie(){
        var l_stAllCookieStr = document.cookie;
        var l_aCookieStr = l_stAllCookieStr.split("; ");
        var l_aCookie = new Array();
        
        for(i in l_aCookieStr){
            var l_aCookieItem = l_aCookieStr[i].split("=");
            l_aCookie[l_aCookieItem[0]] = l_aCookieItem[1];
        }
        
        var j = 1;
        var k = 1;
        while(k <= 10){
            while(j <= 10){
                if("mypage"+j in l_aCookie && l_aCookie["mypage"+j].length > 0 && l_aCookie["mypage"+j] != " "){
                    g_aMypage[k] = l_aCookie["mypage"+j];
                    j++;
                    break;
                }
                j++;
            }
            if(j > 10 && (!("mypage"+10 in l_aCookie) || l_aCookie["mypage"+10].length == 0 || l_aCookie["mypage"+10] == " ")){
                g_aMypage[k] = " ";
            }
            k++;
        }
    }
    
    // Cookieに書き込む関数
    function subAssignCookie(a_aData, a_stCookieName){
        var expire = new Date();
        expire.setTime(expire.getTime() + 1000 * 3600 * 24 * 365 * 5);
        
        var j = 1;
        for(i in a_aData){
            if(a_aData[i].length > 0 && a_aData[i] != " "){
                document.cookie = a_stCookieName+j+"="+a_aData[i]+"; path=/; expires="+expire.toGMTString();
                j++;
            }
        }
        while(j <= 10){
            document.cookie = a_stCookieName+j+"= ; path=/; expires="+expire.toGMTString();
            j++;
        }
    }
    
    // セミコロンで分割する関数
    function fncSplitBySemicolon(a_stTarget){
        var l_stPreChar = "";
        var l_stChar = "";
        var l_aRes = new Array();
        var l_iResIndex = 0;
        
        l_aRes[0] = "";
        for(var i = 0; i < a_stTarget.length; i++){
            l_stChar = a_stTarget.charAt(i);
            if(l_stChar == ";"){
                if(l_stPreChar == ";"){
                    l_aRes[l_iResIndex] = l_aRes[l_iResIndex] + l_stChar;
                    l_stPreChar = "";
                }else{
                    l_stPreChar = l_stChar;
                }
            }else{
                if(l_stPreChar == ";"){
                    l_iResIndex++;
                    l_aRes[l_iResIndex] = l_stChar;
                    l_stPreChar = l_stChar;
                }else{
                    l_aRes[l_iResIndex] = l_aRes[l_iResIndex] + l_stChar;
                    l_stPreChar = l_stChar;
                }
            }
        }
        return l_aRes;
    }
    
    // マイページを削除する関数
    function fncDeleteMypage(a_iId){
        subLoadCookie();
        var l_aCookieData = fncSplitBySemicolon(decodeURIComponent(g_aMypage[a_iId]));
        if(window.confirm("「"+l_aCookieData[1]+"」を削除しますか。")){
            // 該当項目を削除してDOM要素も削除
            $("#mypage_list .online_strage_list_item").eq(a_iId - 1).remove();
            
            g_aMypage[a_iId] = " ";
            for(var i = a_iId; i < 10; i++){
                g_aMypage[i] = g_aMypage[i + 1];
            }
            g_aMypage[10] = " ";
            subAssignCookie(g_aMypage, "mypage");
        }
    }
    
    // 削除ボタンのイベント設定
    $(document).on("click", "#mypage_del_1", function(){ fncDeleteMypage(1); });
    $(document).on("click", "#mypage_del_2", function(){ fncDeleteMypage(2); });
    $(document).on("click", "#mypage_del_3", function(){ fncDeleteMypage(3); });
    $(document).on("click", "#mypage_del_4", function(){ fncDeleteMypage(4); });
    $(document).on("click", "#mypage_del_5", function(){ fncDeleteMypage(5); });
    $(document).on("click", "#mypage_del_6", function(){ fncDeleteMypage(6); });
    $(document).on("click", "#mypage_del_7", function(){ fncDeleteMypage(7); });
    $(document).on("click", "#mypage_del_8", function(){ fncDeleteMypage(8); });
    $(document).on("click", "#mypage_del_9", function(){ fncDeleteMypage(9); });
    $(document).on("click", "#mypage_del_10", function(){ fncDeleteMypage(10); });
});