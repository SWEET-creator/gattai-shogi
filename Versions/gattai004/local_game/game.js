const canvas = document.getElementById("myCanvas"); //HTMLのファイルに記述された myCanvasを jsでロード
const ctx = canvas.getContext("2d"); //canvasを2Dで描画するモードに設定

/*画像の読み込み*/
//画像のパスリスト
var path = [
	"../images/syougi_ban.png",
	"../images/syougi01_ousyou.png",
	"../images/syougi02_gyokusyou.png",
	"../images/syougi03_hisya.png",
	"../images/syougi04_ryuuou.png",
	"../images/syougi05_gakugyou.png",
	"../images/syougi06_ryuuma.png",
	"../images/syougi07_kinsyou.png",
	"../images/syougi08_ginsyou.png",
	"../images/syougi09_narigin.png",
	"../images/syougi10_keima.png",
	"../images/syougi11_narikei.png",
	"../images/syougi12_kyousya.png",
	"../images/syougi13_narikyou.png",
	"../images/syougi14_fuhyou.png",
	"../images/syougi15_tokin.png"
];

//画像ををロードする
var images = new Array(path.length)
for (let i=0;i<path.length;i++){
	let element = new Image() ;
	element.src = path[i];
	images[i] = element;
}

//ゲームで用いるすべての駒のリスト
var koma_list = [];

//駒の移動先選択モード
var chose_move_flag = false;
//駒の移動の操作対象となるオブジェクト
var selected_obj;
//ターンの管理
var turn = 0;
//表示上のグリッドサイズ
var x_size = 47.8;
var y_size = 52;

var mouse_x;
var mouse_y;

//ゲーム終了のフラグ
var game_end_flag = false;


//ゲームの初期化
function init (){
	koma_list = [];
	for (let i = 0; i< 9; i++){
		koma_list.push(new FU(i, 6, 0));
		koma_list.push(new FU(i, 2, 1));
	}
	koma_list.push(new GY(4,8,0));
	koma_list.push(new OU(4,0,1));

	koma_list.push(new HS(7,7,0));
	koma_list.push(new HS(1,1,1));

	koma_list.push(new KK(1,7,0));
	koma_list.push(new KK(7,1,1));

	koma_list.push(new KN(3,8,0));
	koma_list.push(new KN(5,8,0));
	koma_list.push(new KN(3,0,1));
	koma_list.push(new KN(5,0,1));

	koma_list.push(new GN(2,8,0));
	koma_list.push(new GN(6,8,0));
	koma_list.push(new GN(2,0,1));
	koma_list.push(new GN(6,0,1));

	koma_list.push(new KM(1,8,0));
	koma_list.push(new KM(7,8,0));
	koma_list.push(new KM(1,0,1));
	koma_list.push(new KM(7,0,1));

	koma_list.push(new KY(0,8,0));
	koma_list.push(new KY(8,8,0));
	koma_list.push(new KY(0,0,1));
	koma_list.push(new KY(8,0,1));

	init_board();

	//main関数の呼び出し
	requestAnimationFrame(main);
}

//main関数
function main() {
	if(game_end_flag){
		window.location.href = '../HP/HP.html';
	}
	if (turn == 0){
		//プレイヤーのクリックの受付
		canvas.addEventListener('click', this.clickListener);
	}else{
		AI();
		init_board();
	}
	requestAnimationFrame(main);
}

//クリック時の処理
function clickListener(e){
	let pos = coordinate2matrix(e.clientX, e.clientY);
	mouse_x = pos[0];
	mouse_y = pos[1];
	
	//可動域が選択された時の処理
	if (chose_move_flag){
		move_koma();
	}else{
		//マウスが盤面の範囲外を選択する際の補正
		if(mouse_x < 0){
			mouse_x --;
		}
		//可動域の表示
		koma_list.forEach(e => {
			if (e.x == mouse_x && e.y == mouse_y && e.side == turn){
				selected_obj = e;
				init_board();
				e.disp_movable();
			}
		});
	}

}

function move_koma(){
	let list = selected_obj.movable();
	let not_selected_flag = true;
	for(let i = 0; i < list.length; i++){
		if (list[i][0] == mouse_x && list[i][1] == mouse_y){
			let last_y = selected_obj.y;
			selected_obj.move(mouse_x, mouse_y);
			//成りの判定
			if (last_y <= 2 && turn == 0 ||
				last_y>= 6 && turn == 1 ||
				mouse_y <= 2 && turn == 0 ||
				mouse_y >= 6 && turn == 1)
			{
				if (!selected_obj.stock_flag){
					let koma_name = selected_obj.constructor.name;
					let list = ["FU", "GN", "KM", "KY", "KK", "HS"];
					if (list.includes(koma_name))
						change_nari(mouse_x,mouse_y);
				}
			}
			
			//持ち駒が打たれた時の処理
			if(selected_obj.stock_flag)
				selected_obj.stock_flag = false;
				
			turn = (turn+1)%2
			chose_move_flag = false;
			not_selected_flag = false;
			break;
		}
	}
	if (not_selected_flag){
		init_board();
		chose_move_flag = false;
	}
}
	

//表示の座標→盤面の座標
function coordinate2matrix(x,y){
let r = window.innerWidth/2 - 214
let l = window.innerWidth/2 + 214
	return [parseInt((x-r)*9/(l-r)),parseInt((y-87)*9/(555-87))]
}

//盤面の座標→表示の座標
function matrix2coordinate(x,y){
let r = window.innerWidth/2 - 214
let l = window.innerWidth/2 + 214
	return [x*(l-r)/9 + 265, y*(555-87)/9 + 87] //なぜかx座標がズレるので便宜的に調整
}

//ボード表示の初期化
function init_board(){
	//全体を背景色で塗る
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//盤面の表示
	ctx.drawImage(images[0], canvas.width/2-images[0].naturalWidth/2, canvas.height/2-images[0].naturalHeight/2);
	disp_stock()
	//すべての駒の表示
	koma_list.forEach(element => element.update());
	disp_UI();
}

//持ち駒を表示
function disp_stock(){
	let i=0;
	let j=0;
	koma_list.forEach(e => {
		if(e.stock_flag){
			if (e.side == 1){
				e.x = -3;
				e.y = i;
				i++;
			}else{
				e.x = 11;
				e.y = 8-j;
				j++;
			}
		}
	});
}

//駒を成り駒にする
function change_nari(b_x,b_y){
	if(confirm("成りますか？")){
		switch (selected_obj.constructor.name){
			case "FU":
				koma_list.push(new TK(b_x, b_y, turn));
				break;
			case "GN":
				koma_list.push(new NG(b_x, b_y, turn));
				break;
			case "KM":
				koma_list.push(new NM(b_x, b_y, turn));
				break;
			case "KY":
				koma_list.push(new NY(b_x, b_y, turn));
				break;
			case "KK":
				koma_list.push(new RM(b_x, b_y, turn));
				break;
			case "HS":
				koma_list.push(new RY(b_x, b_y, turn));
				break;
			default:
		}
		koma_list = koma_list.filter(e => {
			if(e == selected_obj){
				return false;
			}else
				return true;
		})
	}
}

//成駒が取られた時に元のコマに戻す
function reverse_nari(koma){
	switch (koma.constructor.name){
		case "TK":
			return new FU(0, 0, turn);
		case "NG":
			return new GN(0, 0, turn);
		case "NM":
			return new KM(0, 0, turn);
		case "NY":
			return new KY(0, 0, turn);
		case "RM":
			return new KK(0, 0, turn);
		case "RY":
			return new HS(0, 0, turn);
		default:
	}
}

//UIの表示
function disp_UI(){
	ctx.font = '50px serif';
	if (turn == 0){
		ctx.fillText('あなたの番です', 10, 50);
	}else{
		ctx.fillText('相手の番です', 10, 50);
	}
}

//AIの処理
function AI(){
	let cp_koma_list = koma_list.filter(e => {
			if (e.side == 1){
				return true;
			}else
				return false;
		});
	
	let choosed_koma;
	let pos = undefined;
	while(pos == undefined){
		choosed_koma = cp_koma_list[parseInt(cp_koma_list.length * Math.random())];
		pos = choosed_koma.movable()[parseInt(choosed_koma.movable().length * Math.random())];
	}
	choosed_koma.move(pos[0], pos[1]);
	turn = (turn + 1)%2;
	mouse_x = pos[0];
	mouse_y = pos[1];
}


//駒の親クラス
class Koma {
	width = 50;
	height = 50;
	stock_flag = false;
	image;
	constructor(x, y, side) {
		this.x = x;
		this.y = y;
		this.side = side;
	}
	//盤面の座標を表示上の座標に変換する関数
	matrix2coordinate_forImg() {
		let padding = 14;
		let X = canvas.width/2-images[0].naturalWidth/2 + padding + this.x*x_size;
		let Y = canvas.height/2-images[0].naturalHeight/2 + padding + this.y*y_size;
		return [X,Y]
	}

	//表示する関数
	update(){
		let pos = this.matrix2coordinate_forImg();

		if (this.side == 1){
			ctx.save();
			ctx.translate(pos[0],
				pos[1]) ;
				ctx.rotate(Math.PI) ;
				ctx.drawImage(this.image,
					-x_size,  //matrix2coordinate_forImg に準拠
					-y_size, //matrix2coordinate_forImg に準拠
					this.width, this.height);
					ctx.restore();
				}else{
					ctx.drawImage(this.image,
						pos[0],
						pos[1],
						this.width, this.height);
					}
				}
	
	//駒を動かすメソッド
	move(x_, y_){
		this.x = x_;
		this.y = y_;
		for (let i = 0; i < koma_list.length; i++){
			if (koma_list[i] != this && koma_list[i].x == this.x && koma_list[i].y == this.y){
				let list = ["TK", "NG", "NM", "NY", "RM", "RY"];
				let koma_name = koma_list[i].constructor.name;

				//勝敗の判定
				if (koma_name == "OU" ||
				koma_name == "GY"){
					if (turn == 0){
						alert("勝利！");			
					}
					else{
						alert("敗北！");											
					}
					game_end_flag = true;
				}

				if (list.includes(koma_name)){
					koma_list[i] = reverse_nari(koma_list[i]);
				}
				
				koma_list[i].stock_flag = true;
				koma_list[i].side = turn
				break;
			}
		}
	}

	//選択された座標が盤面上かどうか判定する関数
	isOnboard(pos){
		let x = pos[0];
		let y = pos[1];
		if(0 <= x && x < 9 && 0 <= y && y < 9)
		return true;
		else
		return false;
	}
	//味方・敵の駒にぶつかることによる制限
	isNotObjected(pos){
		let x = pos[0];
		let y = pos[1];
		for (let i=0; i<koma_list.length;i++){
			if (koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side == this.side){
				return false;
			}else if(koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side != this.side){
				return true;
			}
		}
		return true;
	}
	//敵の駒かどうかを判定
	isEnemy(pos){
		let x = pos[0];
		let y = pos[1];
		for (let i=0; i<koma_list.length;i++){
			if (koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side == this.side){
				return false;
			}else if(koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side != this.side){
				return true;
			}
		}
		return false;
	}

	isAlly(pos){
		let x = pos[0];
		let y = pos[1];
		for (let i=0; i<koma_list.length;i++){
			if (koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side == this.side){
				return true;
			}else if(koma_list[i].x == x && koma_list[i].y == y && koma_list[i].side != this.side){
				return false;
			}
		}
		return false;
	}

	//可動範囲の表示
	disp_movable(){
		if (this.movable().length != 0){
			this.movable().forEach(element => {
				let pos1 = matrix2coordinate(element[0],element[1]);
				ctx.beginPath();
				ctx.rect(pos1[0],pos1[1],x_size, y_size);
				ctx.strokeStyle = 'deepskyblue';
				ctx.lineWidth = 4;
				ctx.stroke();
			});
			chose_move_flag = true;
		}
	}
}

class OU extends Koma{
	image = images[1];
	movable(){
		let list = [[this.x+1, this.y+1],
		[this.x+1, this.y],
		[this.x+1, this.y-1],
		[this.x, this.y+1],
		[this.x, this.y-1],
		[this.x-1, this.y+1],
		[this.x-1, this.y],
		[this.x-1, this.y-1]]
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => this.isNotObjected(pos));
		return list;
	}
}

class GY extends Koma{
	image = images[2];
	movable(){
		let list = [[this.x+1, this.y+1],
		[this.x+1, this.y],
		[this.x+1, this.y-1],
		[this.x, this.y+1],
		[this.x, this.y-1],
		[this.x-1, this.y+1],
		[this.x-1, this.y],
		[this.x-1, this.y-1]]
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => this.isNotObjected(pos));
		return list;
	}

}

class HS extends Koma{
	image = images[3];
	movable(){
		let list = [];
		if (this.stock_flag){
			for (let i = 0; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
			list = list.filter(pos => this.isOnboard(pos));
			list = list.filter(pos => this.isNotObjected(pos));
		}else{
			let flag_list = [true, true, true, true];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x, this.y-i], [this.x+i, this.y], [this.x-i, this.y], [this.x, this.y+i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos) && this.isNotObjected(pos)){
						list.push(pos);
						if(this.isEnemy(pos)){
							flag_list[j] = false;
						}
					}
					else
					flag_list[j] = false;
				}
			}
		}

		return list;
	}
}

class RY extends HS{
	image = images[4];
	movable(){
		let list = super.movable();

		let sub_list = [[this.x+1, this.y+1],
		[this.x+1, this.y-1],
		[this.x-1, this.y+1],
		[this.x-1, this.y-1]]
		sub_list = sub_list.filter(pos => this.isOnboard(pos));
		sub_list = sub_list.filter(pos => this.isNotObjected(pos));

		list = list.concat(sub_list);

		return list;
	}
}

class KK extends Koma{
	image = images[5];
	movable(){
		let list = [];
		if (this.stock_flag){
			for (let i = 0; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
			list = list.filter(pos => this.isOnboard(pos));
			list = list.filter(pos => this.isNotObjected(pos));
		}else{
			let flag_list = [true, true, true, true];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x+i, this.y+i], [this.x+i, this.y-i], [this.x-i, this.y+i], [this.x-i, this.y-i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos) && this.isNotObjected(pos)){
						list.push(pos);
						if(this.isEnemy(pos)){
							flag_list[j] = false;
						}
					}
					else
					flag_list[j] = false;
				}
			}
		}

		return list;
	}
}

class RM extends KK{
	image = images[6];
	movable(){
		let list = super.movable();
		let sub_list = [[this.x, this.y+1],
		[this.x, this.y-1],
		[this.x-1, this.y],
		[this.x+1, this.y]]
		sub_list = sub_list.filter(pos => this.isOnboard(pos));
		sub_list = sub_list.filter(pos => this.isNotObjected(pos));

		list = list.concat(sub_list)

		return list;
	}
}

class KN extends Koma{
	image = images[7];
	movable(){
		let list = [];
		if (this.stock_flag){
			for (let i = 0; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
		}else{
			if(this.side == 0)
			list = [[this.x+1, this.y-1],
			[this.x+1, this.y],
			[this.x, this.y-1],
			[this.x, this.y+1],
			[this.x-1, this.y-1],
			[this.x-1, this.y]];
			else
			list = [[this.x+1, this.y+1],
			[this.x+1, this.y],
			[this.x, this.y+1],
			[this.x, this.y-1],
			[this.x-1, this.y+1],
			[this.x-1, this.y]];
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => this.isNotObjected(pos));
		return list
	}
}

class GN extends Koma{
	image = images[8];
	movable(){
		let list = [];
		if (this.stock_flag){
			for (let i = 0; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
		}else{
			if(this.side == 0)
			list = [[this.x+1, this.y+1],
			[this.x+1, this.y-1],
			[this.x, this.y-1],
			[this.x-1, this.y-1],
			[this.x-1, this.y+1]]
			else
			list = [[this.x+1, this.y-1],
			[this.x+1, this.y+1],
			[this.x, this.y+1],
			[this.x-1, this.y+1],
			[this.x-1, this.y-1]]
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => this.isNotObjected(pos));
		return list
	}
}

class NG extends KN{
	image = images[9];
}

class KM extends Koma{
	image = images[10];
	movable(){
		let list = [];
		if (this.stock_flag){
			if(this.side == 0)
			for (let i = 18; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			else
			for (let i = 0; i < 63; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
		}else{
			if(this.side == 0)
			list = [[this.x-1, this.y-2],
			[this.x+1, this.y-2]]
			else
			list = [[this.x-1, this.y+2],
			[this.x+1, this.y+2]]
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => this.isNotObjected(pos));
		return list
	}
}

class NM extends KN{
	image = images[11];
}

class KY extends Koma{
	image = images[12];
	movable(){
		let list = [];
		let pos;
		if (this.stock_flag){
			if(this.side == 0)
			for (let i = 9; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			else
			for (let i = 0; i < 72; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => !this.isEnemy(pos));
		}else{
			for (let i=1;i<9;i++){
				if (this.side == 0)
				pos = [this.x, this.y-i];
				else
				pos = [this.x, this.y+i];

				if(this.isOnboard(pos) && this.isNotObjected(pos)){
					list.push(pos);
					if(this.isEnemy(pos))
					break;
				}else
				break;
			}
		}
		return list;
	}
}


class NY extends KN{
	image = images[13];
}

class FU extends Koma{
	image = images[14];
	movable(){
		let list = [];
		if (this.stock_flag){
			if(this.side == 0)
			for (let i = 9; i < 81; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			else
			for (let i = 0; i < 72; i++){
				list.push([i%9, parseInt(i/9)]);
			}
			list = list.filter(pos => {
				for (let i = 0; i < koma_list.length; i++){
					if (koma_list[i].x == pos[0] &&
						koma_list[i].side == this.side &&
						koma_list[i].constructor.name  == this.constructor.name){
						return false;
					}
				}
				return true;
			});
			list = list.filter(pos => !this.isEnemy(pos));
		}else{
			if(this.side == 0){
				list = [[this.x, this.y-1]]
			}
			else{
				list = [[this.x, this.y+1]]
			}}

			list = list.filter(pos => this.isOnboard(pos));
			list = list.filter(pos => this.isNotObjected(pos));
			return list;
		}
	}
class TK extends KN{
	image = images[15];
}


/*
王将：OU

玉将：GY

金将：KN

銀将：GN

也銀：NG

桂馬：KM

也桂：NM

香車：KY

也香：NY

飛車：HS

竜王：RY

角行：KK

竜馬：RM

歩兵：FU

と金：TK
*/
