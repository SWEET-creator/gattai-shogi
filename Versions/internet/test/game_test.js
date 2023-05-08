var send_information = {
    "moving_source":[0,0],
    "distination":[1,2],
    "nari_flag":false
}

var ressive_information = {
    "moving_source":[],
    "distination":[],
    "nari_flag":false
}

var updated = false;

const send = document.querySelector("input[name='send']");

send.addEventListener('click', send_message);

function send_message(){
    console.log("send");
    fetch('relay_test.php', { // 第1引数に送り先
        method: 'POST', // メソッド指定
        headers: { 'Content-Type': 'application/json' }, // jsonを指定
        body: JSON.stringify(send_information) // json形式に変換して添付
    })
    .then(response => response.json()) // 返ってきたレスポンスをjsonで受け取って次のthenへ渡す
    .then(res => {
        console.log(res); // 返ってきたデータ
    });
    wait();
}

function wait(){
    console.log("wait");
    $(function(){
        var mytimer = null; //タイマー
        var url = 'push.php'; //データの受信先
        //引数のテキストがJSONかどうかを判定
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
                                    if (json != null && !updated){
                                        //盤面の更新
                                        updated = true;
                                        console.log(ressive_information)        
                                        console.log(json);
                                        ressive_information.moving_source = json.moving_source;
                                        ressive_information.distination = json.distination;
                                        ressive_information.nari_flag = json.nari_flag;
                                        console.log("updated");                                  
                                    }                                                                  
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
}