$(function(){
    /**
     * タイマー
     */ 
    var mytimer = null;

    /**
     * データ受信先のURL
     */
    var url = './push.php';

    /**
     * 引数のテキストが JSON かどうか 判別する内部関数
     */
    var isJSON = function(arg) {
        arg = (typeof arg === "function") ? arg() : arg;
        if (typeof arg  !== "string") {
            return false;
        }
        try {
            arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
            return true;
        } catch (e) {
            return false;
        }
    };

    // サーバーに通信のコネクションを張る
    $.ajax({
        type: 'get',
        url:  url,
        cache: false, // ブラウザにキャッシュさせない
        xhrFields: {
            onloadstart: function() {
                var xhr = this;

                // 前回取得したデータの文字数
                var textlength = 0;

                // データが来るまで待つ (100ms間隔でレスポンステキストを確認する)
                mytimer = setInterval(function() {

                    // 受信済みテキストを保存                    
                    var text    = xhr.responseText;

                    // 前回の取得からの差分を取得
                    var newText = text.substring(textlength);
                    
                    // JSONデータを取得
                    var lines   = newText.split("\n");

                    if( text.length > textlength ) {
                        // 長さを更新
                        textlength  = text.length;

                        lines.forEach(function(line){
                            if( isJSON(line) ){
                                // 正常な JSON データの時
                                var json = JSON.parse(line);

                                /**
                                 * ここに更新処理を書く
                                 */
                                console.log('updated.');
                            }
                        });
                    } 

                }, 100);                
            }
        },
        success: function() {
            console.log('successed.');

            // 一秒後にタイマー停止
            setTimeout(function(){
                clearInterval(mytimer);
            }, 1000);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log('error occured.');
            
            // 即座にタイマー停止
            clearInterval(mytimer);
        }
    });    
});