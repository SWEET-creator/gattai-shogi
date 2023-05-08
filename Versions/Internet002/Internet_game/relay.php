<?php
session_start();

$raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
$data = json_decode($raw); // json形式をphp変数に変換

//DB読み込み
$json_text = file_get_contents('DB.json');
$DB = json_decode($json_text,true);

//当該データベースに登録
for ($i = 0; $i<count($DB);$i++){
    if (session_id() == $DB[$i]["session_id"]){
        $DB[$i]["information"] = $data;
    }
}

//DB書き込み
$json_text = json_encode($DB);
file_put_contents('DB.json', $json_text);

$res = $data;

// echoすると返せる
echo json_encode($res); // json形式にして返す
?>