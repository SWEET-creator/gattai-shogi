<?php
/**
 * push.php - 一秒に一回 json データを chunked data として掃き出す
 */

session_start();

function output_chunk($chunk)
{
    echo sprintf("%x\r\n", strlen($chunk));
    echo $chunk . "\r\n";
}

header("Content-type: application/octet-stream");
header("Transfer-encoding: chunked");
ob_flush();
flush();

$json_text = file_get_contents("DB.json");
$DB = json_decode($json_text,true);

$i = 0;
$flag = true;
while (!connection_aborted() and $flag) {
    // クライアントからの接続が切断されない限り繰り返す
    $json_text = file_get_contents("DB.json");
    $DB = json_decode($json_text,true);

    //nullを登録
    $json_data = json_encode(null);
    for($i = 0; $i < count($DB);$i++){
        if ($DB[$i]["opponent_id"] == session_id()){
            //情報がnullでない（初回でない），情報が更新されている
            if ($DB[$i]["pre_information"] != $DB[$i]["information"] and $DB[$i]["information"] != null){
                $flag = false;

                //前回のデータの保持
                $DB[$i]["pre_information"] = $DB[$i]["information"];
                //タイムスタンプ
                $DB[$i]["date"] = strtotime('now');

                //DB書き込み
                $json_text = json_encode($DB);
                file_put_contents('DB.json', $json_text);

                //送信する情報を獲得
                $json_data = json_encode($DB[$i]["information"]);
            }
            break;
        }
    }
    // データを掃き出す
    output_chunk(
        $json_data . str_repeat(' ', 8000) . "\n"
    );
    ob_flush();
    flush();

    // 一秒停止
    sleep(1); // 一秒ごとに生成

    $i++;
}
echo "0\r\n\r\n";

function console_log($data){
    echo '<script>';
    echo 'console.log('.json_encode($data).')';
    echo '</script>';
}

?>