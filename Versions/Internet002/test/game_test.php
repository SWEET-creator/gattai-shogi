<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <title>Document</title>
</head>
<body>
    <form method="POST" action="">
        <p>名前：<input type="text" name="personal_name"></p>
        <input type="submit" name="login" value="ログイン">
        <input type="submit" name="match" value="マッチング">
        <input type="submit" name="logout" value="ログアウト">
    </form>
    <input type="submit" name="send" value="送信">
    <message></message>
    <script src = "game_test.js"></script>
    <?php
        //セッションIDの獲得とセッション名の登録
        session_start();

        $personal_name = $_POST['personal_name'];
        $_SESSION['username'] = $personal_name;

        //マッチング
        if (isset($_POST['match'])) {
            //DB読み込み
            $filename = 'DB_test.json';
            $json_text = file_get_contents($filename);
            $DB = json_decode($json_text,true);

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
                $matching = false;
                for ($i = 0; $i<count($DB);$i++){
                    if ($DB[$i]["opponent_id"] == null and ($myself_index != $i)){
                        $DB[$myself_index]["opponent_id"] = $DB[$i]["session_id"];
                        $DB[$i]["opponent_id"] = $DB[$myself_index]["session_id"];
                        echo $DB[$i]["name"]." とマッチングしました。";
                        $matching = true;
                        break;
                    }else if($DB[$i]["opponent_id"] == session_id()){
                        echo $DB[$i]["name"]." とマッチングしています。";
                        $matching = true;
                        break;
                    }
                }
                if (!$matching){
                    echo "相手が見つかりませんでした。";
                }
                
            }else { //ログインしていない際の処理
                echo "ログインしていません。";
            }

            //DB書き込み
            $json_text = json_encode($DB);
            file_put_contents('DB_test.json', $json_text);

        //ログアウト
        }else if(isset($_POST['logout'])){
            //DB読み込み
            $filename = 'DB_test.json';
            $json_text = file_get_contents($filename);
            $DB = json_decode($json_text,true);

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
            file_put_contents('DB_test.json', $json_text);

        //ログイン
        }else if(isset($_POST['login'])){
            if ($personal_name == ""){
                echo "不適切な名前です。";
            }else{
                //DB読み込み
                $filename = 'DB_test.json';
                $json_text = file_get_contents($filename);
                $DB = json_decode($json_text,true);

                $login_flag = false;
                //ログイン済みかどうか判定
                for ($i = 0; $i<count($DB);$i++){
                    if (session_id() == $DB[$i]["session_id"]){
                        $DB[$i]["name"] = $personal_name;
                        echo "ログイン済みです。名称を変更しました。";
                        $login_flag = true;
                        break;
                    }
                }
                if (!$login_flag){ //ログインしていない際の処理
                    $new_person["session_id"] = session_id();
                    $new_person["name"] = $personal_name;
                    $new_person["information"] = null;
                    $new_person["opponent_id"] = null;
                    array_push($DB, $new_person);
                    echo $personal_name." としてログインしました。";
                }
                //DB書き込み
                $json_text = json_encode($DB);
                file_put_contents('DB_test.json', $json_text);
            }            
        }else{
            //DB読み込み
            $filename = 'DB_test.json';
            $json_text = file_get_contents($filename);
            $DB = json_decode($json_text,true);

            $login_flag = false;
            //ログイン済みかどうか判定
            for ($i = 0; $i<count($DB);$i++){
                if (session_id() == $DB[$i]["session_id"]){
                    echo $DB[$i]["name"]." としてログインしています。";
                    if ($DB[$i]["opponent_id"] != null){
                        echo $DB[$i]["opponent_id"]."とマッチングしています。";
                    }
                    $login_flag = true;
                    break;
                }
            }   
            if (!$login_flag){
                echo "ログインしていません。";
            } 
        }

        function console_log($data){
            echo '<script>';
            echo 'console.log('.json_encode($data).')';
            echo '</script>';
        }
    ?>
</body>
</html>
