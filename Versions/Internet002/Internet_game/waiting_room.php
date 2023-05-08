<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <link rel="stylesheet" href="waiting_room.css">
    <title>Document</title>
</head>
<body>
    <form method="POST" action="" class="form">
        <p>名前：<input type="text" name="personal_name"></p>
        <input type="submit" name="login" value="ログイン">
        <input type="submit" name="match" value="マッチング">
        <input type="submit" name="logout" value="ログアウト">
        <input type="submit" name="check" value="チェック">
    </form>
    <?php
        echo "<div>";
        //セッションIDの獲得とセッション名の登録
        session_start();

        $personal_name = $_POST['personal_name'];
        $_SESSION['username'] = $personal_name;

        //DB読み込み
        $filename = 'DB.json';
        $json_text = file_get_contents($filename);
        $DB = json_decode($json_text,true);

        //マッチング
        if (isset($_POST['match'])) {

            //ログイン済みかどうか判定
            $login_flag = false;
            $myself_index;
            for ($i = 0; $i<count($DB);$i++){
                if (session_id() == $DB[$i]["session_id"]){
                    $myself_index = $i;
                    $login_flag = true;
                    break;
                }
            }

            if ($login_flag){//ログインしている際の処理              
                if($DB[$myself_index]["opponent_id"] != null){ //対戦相手の情報の確認
                    for ($i = 0; $i<count($DB);$i++){
                        if ($DB[$i]["session_id"] == $DB[$myself_index]["opponent_id"]){                            

                            //画面遷移
                            header("Location:game.html");           
                            exit();
                        }
                    }
                    echo "対戦相手の接続が切断されました。";
                }else{
                    for ($i = 0; $i<count($DB);$i++){
                        if ($DB[$i]["opponent_id"] == null and ($myself_index != $i)){
                            $DB[$myself_index]["opponent_id"] = $DB[$i]["session_id"];
                            $DB[$i]["opponent_id"] = $DB[$myself_index]["session_id"];
                            if (mt_rand()%2 == 0){
                                $DB[$i]["init_turn"] = 0;
                                $DB[$myself_index]["init_turn"] = 1;
                            }else{
                                $DB[$i]["init_turn"] = 1;
                                $DB[$myself_index]["init_turn"] = 0;
                            }                                                 
                            
                            
                            //DB書き込み
                            $json_text = json_encode($DB);
                            file_put_contents('DB.json', $json_text);
                            break;
                        }                       
                    }                    
                    if($DB[$myself_index]["opponent_id"] != null){ //マッチングしている時                    
                        //画面遷移
                        header("Location:game.html");             
                        exit();
                    }
                }
                echo "相手が見つかりませんでした。";            
                
            }else { //ログインしていない際の処理
                echo "ログインしていません。";
            }

        //ログアウト
        }else if(isset($_POST['logout'])){

            //ログイン済みかどうか判定
            $login_flag = false;
            for ($i = 0; $i<count($DB);$i++){
                if (session_id() == $DB[$i]["session_id"]){
                    array_splice($DB,$i,1);
                    session_abort();
                    echo "ログアウトしました。";
                    $login_flag = true;
                }else if(session_id() == $DB[$i]["opponent_id"]){
                    $DB[$i]["opponent_id"] = null;
                }
            }
            if (!$login_flag){ //ログインしていない際の処理
                echo "ログインしていません。";
            }

            //DB書き込み
            $json_text = json_encode($DB);
            file_put_contents('DB.json', $json_text);

        //ログイン
        }else if(isset($_POST['login'])){
            if ($personal_name == ""){
                echo "不適切な名前です。";
            }else{

                $login_flag = false;
                //ログイン済みかどうか判定
                for ($i = 0; $i<count($DB);$i++){
                    if (session_id() == $DB[$i]["session_id"]){
                        $DB[$i]["name"] = $personal_name;
                        $DB[$i]["date"] = strtotime('now');
                        echo "名前を変更しました。<br>";
                        echo $DB[$i]["name"]." としてログインしています。";
                        
                        $login_flag = true;
                        break;                      
                    }
                }
                if (!$login_flag){ //ログインしていない際の処理
                    $new_person["session_id"] = session_id();
                    $new_person["name"] = $personal_name;
                    $new_person["pre_information"] = null;
                    $new_person["information"] = null;
                    $new_person["opponent_id"] = null;
                    $new_person["date"] = strtotime('now');
                    $new_person["init_turn"] = null;
                    array_push($DB, $new_person);
                    echo $personal_name." としてログインしました。";
                }
                //DB書き込み
                $json_text = json_encode($DB);
                file_put_contents('DB.json', $json_text);
            }            
        }else{ //トップページ処理

            //不要データの確認
            for ($i = 0; $i<count($DB);$i++){
                if ($DB[$i]["date"]+60 < strtotime('now')){ //1分応答がないユーザーを削除
                    if (session_id() == $DB[$i]["session_id"]){
                        echo "タイムアウトしました。<br>";
                    }
                    array_splice($DB,$i,1);
                }
            }

            $login_flag = false;
            //ログイン済みかどうか判定
            for ($i = 0; $i<count($DB);$i++){
                if (session_id() == $DB[$i]["session_id"]){
                    //タイムスタンプ更新
                    $DB[$i]["date"] = strtotime('now');
                    //キャッシュ削除
                    $DB[$i]["information"] = null;
                    $DB[$i]["pre_information"] = null;
                    $DB[$i]["init_turn"] = null;

                    echo $DB[$i]["name"]." としてログインしています。";
                    if ($DB[$i]["opponent_id"] != null){
                        for ($j = 0; $j < count($DB); $j++){
                            if ($DB[$i]["opponent_id"] == $DB[$j]["session_id"]){
                                echo $DB[$j]["name"]."とマッチングしています。";
                            }
                        }
                    }
                    $login_flag = true;
                    break;
                }
            }   
            if (!$login_flag){
                echo "名前を入力してログインをしてください。";
            }
            //DB書き込み
            $json_text = json_encode($DB);
            file_put_contents('DB.json', $json_text);
        }

        function console_log($data){
            echo '<script>';
            echo 'console.log('.json_encode($data).')';
            echo '</script>';
        }
        echo "</div>";
    ?>
</body>
</html>
