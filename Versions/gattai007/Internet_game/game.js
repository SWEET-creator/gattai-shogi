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
	"../images/syougi15_tokin.png",
	"../images/gattai_koma/KNGN.png",
	"../images/gattai_koma/KNKY.png",
	"../images/gattai_koma/KNKM.png",
	"../images/gattai_koma/KNHS.png",
	"../images/gattai_koma/KNKK.png",
	"../images/gattai_koma/KNFU.png",
	"../images/gattai_koma/GNKY.png",
	"../images/gattai_koma/GNKM.png",
	"../images/gattai_koma/GNHS.png",
	"../images/gattai_koma/GNKK.png",
	"../images/gattai_koma/GNFU.png",
	"../images/gattai_koma/KYKM.png",
	"../images/gattai_koma/KYHS.png",
	"../images/gattai_koma/KYKK.png",
	"../images/gattai_koma/KYFU.png",
	"../images/gattai_koma/KMHS.png",
	"../images/gattai_koma/KMKK.png",
	"../images/gattai_koma/KMFU.png",
	"../images/gattai_koma/HSKK.png",
	"../images/gattai_koma/HSFU.png",
	"../images/gattai_koma/KKFU.png",
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

//AIのON-OFF
var AI_flag = false;

//合体機能のON-OFF
var gattai_flag = true;


//駒の親クラス
class Koma {
	width = 50;
	height = 50;
	stock_flag = false;
	image;
	score;
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
		console.log(selected_obj.constructor.name, x_, y_);
		this.x = x_;
		this.y = y_;
		//持ち駒が打たれた時の処理
		if(selected_obj.stock_flag)
			selected_obj.stock_flag = false;
		
		//駒が重なった時の処理
		let target_obj;
		for (let i = 0; i < koma_list.length; i++){
			if (koma_list[i] != this && koma_list[i].x == this.x && koma_list[i].y == this.y){
				target_obj = koma_list[i];
			}
		}
		if (target_obj != undefined){
			//敵と重なった時の処理
			if (target_obj.side != this.side){
				let koma_name = target_obj.constructor.name;

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

				if ( reverse_nari(target_obj) != null){
					let new_target_obj = reverse_nari(target_obj);
					koma_list.push(new_target_obj);
					delete_koma(target_obj);
					target_obj = new_target_obj;
				}
				
				target_obj.stock_flag = true;
				target_obj.side = turn;

				if (gattai_flag == true){
					Object.keys(gattai_koma_list).forEach( function(key) {					
						if (key == target_obj.constructor.name){
							let reversed_koma = reverse_make_gattai_koma_functions[key];		
							reversed_koma.forEach(function(value){
								value.side = selected_obj.side;
								value.stock_flag = true;						
								koma_list.push(value);					
							});
							delete_koma(target_obj);
						}
					}, gattai_koma_list);
				}
				
			}else if (target_obj.side == selected_obj.side){ //味方と重なった時の処理（合体）					
				Object.keys(gattai_koma_list).forEach( function(key) {
					let value = gattai_koma_list[key];
					if (value[0] == selected_obj.constructor.name && value[1] == target_obj.constructor.name
						|| value[1] == selected_obj.constructor.name && value[0] == target_obj.constructor.name){
						let made_koma = make_gattai_koma_functions(key);
						if (selected_obj.side == target_obj.side && made_koma != undefined){							
							made_koma.x = selected_obj.x;
							made_koma.y = selected_obj.y;
							made_koma.side = selected_obj.side;				
							koma_list.push(made_koma);
							delete_koma(selected_obj);
							delete_koma(target_obj);						
						}	
					}
				}, gattai_koma_list);
				
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
		let this_movable = this.movable();
		if (gattai_flag == false){
			this_movable = this_movable.filter(pos => !this.isAlly(pos));
		}
		if (this_movable.length != 0){
			this_movable.forEach(element => {
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
	score = 10000;
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
	score = 10000;
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
	score = 450;
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
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isAlly(pos)){
								let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
								let koma_name = target.constructor.name;
								let gattai_list = ["KY", "KM", "GN", "KK"];
								if (gattai_list.includes(koma_name)){								
									list.push(pos);
								}
							}else{
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}

		return list;
	}
}

class RY extends HS{
	image = images[4];
	score = 500;
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
	score = 300;
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
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isAlly(pos)){
								let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
								let koma_name = target.constructor.name;
								let gattai_list = ["FU", "KN", "HS", "KM"];
								if (gattai_list.includes(koma_name)){								
									list.push(pos);
								}
							}else{
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}

		return list;
	}
}

class RM extends KK{
	image = images[6];
	score = 450;
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
	score = 300;
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
		list = list.filter(pos => {
			if (this.isAlly(pos)){
				let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
				let koma_name = target.constructor.name;
				let gattai_list = ["KY", "KM", "GN", "KK"];
				if (gattai_list.includes(koma_name)){								
					return true;
				}else{
					return false;
				}
			}else
				return true;
		});
		return list
	}
}

class GN extends Koma{
	image = images[8];
	score = 300;
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
		list = list.filter(pos => {
			if (this.isAlly(pos)){
				let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
				let koma_name = target.constructor.name;
				let gattai_list = ["KN", "KM", "HS"];
				if (gattai_list.includes(koma_name)){								
					return true;
				}else{
					return false;
				}
			}else
				return true;
		});
		return list
	}
}

class NG extends KN{
	image = images[9];
	score = 300;
}

class KM extends Koma{
	image = images[10];
	score = 200;
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
		list = list.filter(pos => {
			if (this.isAlly(pos)){
				let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
				let koma_name = target.constructor.name;
				let gattai_list = ["FU", "KY", "KM", "GN", "KN", "HS", "KK"];
				if (gattai_list.includes(koma_name)){								
					return true;
				}else{
					return false;
				}
			}else
				return true;
		});
		return list;
	}
}

class NM extends KN{
	image = images[11];
	score = 200;
}

class KY extends Koma{
	image = images[12];
	score = 200;
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

				if(this.isOnboard(pos)){
					if(this.isEnemy(pos) || this.isAlly(pos)){
						if (this.isAlly(pos)){
							let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
							let koma_name = target.constructor.name;
							let gattai_list = ["FU", "KM", "KN", "HS"];
							if (gattai_list.includes(koma_name)){								
								list.push(pos);
							}
						}else{
							list.push(pos);
						}
						break;
					}else{
						list.push(pos);
					}
				}else
					break;
			}
		}
		return list;
	}
}


class NY extends KN{
	image = images[13];
	score = 200;
}

class FU extends Koma{
	image = images[14];
	score = 100;
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
			list = list.filter(pos => {
				if (this.isAlly(pos)){
					let target = koma_list.filter(koma => koma.x == pos[0] && koma.y == pos[1])[0];
					let koma_name = target.constructor.name;
					let gattai_list = ["KY", "KM", "KK", "TK"];
					if (gattai_list.includes(koma_name)){								
						return true;
					}else{
						return false;
					}
				}else
					return true;
			});
			return list;
		}
	}
class TK extends KN{
	image = images[15];
	score = 300;
}

class KNGN extends Koma {
	image = images[16];
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
			list = [[this.x+1, this.y+1],
					[this.x+1, this.y],
					[this.x+1, this.y-1],
					[this.x, this.y+1],
					[this.x, this.y-1],
					[this.x-1, this.y+1],
					[this.x-1, this.y],
					[this.x-1, this.y-1]];
			let flag_list = [true, true, true, true, true, true, true, true];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x+i, this.y+i], [this.x+i, this.y-i], [this.x-i, this.y+i], [this.x-i, this.y-i],
								[this.x, this.y-i], [this.x+i, this.y], [this.x-i, this.y], [this.x, this.y+i]];
				for (let j=0;j<8;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isAlly(pos)){
						flag_list[j] = true;
					}else if(flag_list[j]){
						list.push(pos);
						flag_list[j] = false;
					}				
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
	
}
class KNKY extends Koma {
	image = images[17];
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
			if(this.side == 0)
				list = [[this.x+1, this.y-1],
				[this.x+2, this.y-2],
				[this.x, this.y-1],
				[this.x, this.y+1],
				[this.x-1, this.y-1],
				[this.x-2, this.y-2]];
			else
				list = [[this.x+1, this.y+1],
				[this.x+2, this.y+2],
				[this.x, this.y+1],
				[this.x, this.y-1],
				[this.x-1, this.y+1],
				[this.x-2, this.y+2]];

			for (let i=1;i<9;i++){
				if (this.side == 0)
					pos = [this.x, this.y-i];
				else
					pos = [this.x, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
				
			}
			list = list.filter(pos => !this.isAlly(pos));
		}
		return list;
	}
}
class KNKM extends Koma {
	image = images[18];
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
		for (let i = 0; i < koma_list.length; i++){
			if (koma_list[i].side == this.side){
				if (this.side == 0){
					list.push([koma_list[i].x, koma_list[i].y+1]);
				}else{
					list.push([koma_list[i].x, koma_list[i].y-1]);
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KNHS extends Koma {
	image = images[19];
}
class KNKK extends Koma {
	image = images[20];
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
			let flag_list = [2, 2, 2, 2];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x-i, this.y-i], [this.x+i, this.y+i], [this.x-i, this.y+i], [this.x+i, this.y-i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j]--;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KNFU extends Koma {
	image = images[21];
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
			if (this.side == 0)
				list = [[this.x-2, this.y-2],
						[this.x+2, this.y-2],
						[this.x-1, this.y-1],
						[this.x+1, this.y-1],
						[this.x-1, this.y],
						[this.x+1, this.y]];
			else
				list = [[this.x-2, this.y+2],
						[this.x+2, this.y+2],
						[this.x-1, this.y+1],
						[this.x+1, this.y+1],
						[this.x-1, this.y],
						[this.x+1, this.y]];
			let pos;
			for (let i=1;i<9;i++){
				if (this.side == 0)
					pos = [this.x, this.y-i];
				else
					pos = [this.x, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
							
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class GNKY extends Koma {
	image = images[22];
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
			if (this.side == 0)
				list = [[this.x, this.y+1],
						[this.x-1, this.y],
						[this.x+1, this.y],
						[this.x-1, this.y+1],
						[this.x+1, this.y+1]];
			else
				list = [[this.x, this.y-1],
						[this.x-1, this.y],
						[this.x+1, this.y],
						[this.x-1, this.y-1],
						[this.x+1, this.y-1]];
			let pos;
			for (let i=1;i<9;i++){
				if (this.side == 0)
					pos = [this.x, this.y-i];
				else
					pos = [this.x, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
							
			}			
			for (let i=1;i<9;i++){
				if (this.side == 0)
					pos = [this.x, this.y+i];
				else
					pos = [this.x, this.y-i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
							
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}

}
class GNKM extends Koma {
	image = images[23];
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
			list = [[this.x-1, this.y-2],
					[this.x+1, this.y-2],
					[this.x-2, this.y+1],
					[this.x+2, this.y+1],
					[this.x-1, this.y+2],
					[this.x+1, this.y+2],
					[this.x-2, this.y-1],
					[this.x+2, this.y-1],
				];
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class GNHS extends Koma {
	image = images[24];
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
			let flag_list = [true, true, true, true, true, true];
			for (let i=1;i<9;i++){

				let pos_list = [[this.x+1, this.y-i],
								[this.x-1, this.y-i],
								[this.x, this.y-i],
								[this.x+i, this.y],
								[this.x-i, this.y],
								[this.x, this.y+i]];				
				for (let j=0;j<pos_list.length;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}

}
class GNKK extends Koma {
	image = images[25];
}
class GNFU extends Koma {
	image = images[26];
	movable(){
		let list = [];
			if(this.side == 0)
				list = [[this.x, this.y-2],
				[this.x+1, this.y+1],
				[this.x+1, this.y-1],
				[this.x, this.y-1],
				[this.x-1, this.y-1],
				[this.x-1, this.y+1],
				[this.x, this.y+1]];
			else
				list = [[this.x, this.y+2],
				[this.x+1, this.y-1],
				[this.x+1, this.y+1],
				[this.x, this.y+1],
				[this.x-1, this.y+1],
				[this.x-1, this.y-1],
				[this.x, this.y-1]];
		
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KYKM extends Koma {
	image = images[27];
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
			
			let pos;
			for (let i=2;i<9;i++){
				if (this.side == 0)
					pos = [this.x-1, this.y-i];
				else
					pos = [this.x-1, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
				
			}
			for (let i=2;i<9;i++){
				if (this.side == 0)
					pos = [this.x+1, this.y-i];
				else
					pos = [this.x+1, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
				
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KYHS extends Koma {
	image = images[28];
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
			let flag_list = [2, 2, 2, 2];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x, this.y-i], [this.x+i, this.y], [this.x-i, this.y], [this.x, this.y+i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j]--;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
	
}
class KYKK extends Koma {
	image = images[29];
	
}

class KYFU extends Koma {
	image = images[30];
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
			if (this.side == 0)
				list = [[this.x, this.y+1], [this.x-1, this.y], [this.x+1, this.y]];
			else
				list = [[this.x, this.y-1], [this.x-1, this.y], [this.x+1, this.y]];
			let pos;
			for (let i=1;i<9;i++){
				if (this.side == 0)
					pos = [this.x, this.y-i];
				else
					pos = [this.x, this.y+i];
				if(this.isOnboard(pos)){
					if(this.isEnemy(pos)){
						list.push(pos);
						break;
					}else if(this.isAlly(pos)){
						break;
					}
					list.push(pos);
				}else
					break;
							
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}

class KMHS extends Koma {
	image = images[31];
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
			list = [[this.x-1, this.y-2],
					[this.x+1, this.y-2],
					[this.x-2, this.y+1],
					[this.x+2, this.y+1],
					[this.x-1, this.y+2],
					[this.x+1, this.y+2],
					[this.x-2, this.y-1],
					[this.x+2, this.y-1]];

			let flag_list = [true, true, true, true, true, true, true, true];
			for (let i=2;i<9;i++){

				let pos_list = [[this.x+1, this.y+i],
								[this.x-1, this.y+i],
								[this.x+i, this.y+1],
								[this.x+i, this.y-1],
								[this.x-i, this.y+1],
								[this.x-i, this.y-1],
								[this.x+1, this.y-i],
								[this.x-1, this.y-i]];				
				for (let j=0;j<pos_list.length;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KMKK extends Koma {
	image = images[32];
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
				let pos_list = [[this.x+i, this.y-i], [this.x+i, this.y+i], [this.x-i, this.y+i], [this.x-i, this.y-i]];
				let pos_list2 = [[this.x+i, this.y-i-1], [this.x+i, this.y+i+1], [this.x-i, this.y+i+1], [this.x-i, this.y-i-1]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					let pos2 = pos_list2[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;

					if(flag_list[j] && this.isOnboard(pos2)){
						if(this.isEnemy(pos2) || this.isAlly(pos2)){
							if (this.isEnemy(pos2)){
								list.push(pos2);
							}
							flag_list[j] = false;
						}else{
							list.push(pos2);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KMFU extends Koma {
	image = images[33];
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
					[this.x+1, this.y-2],
					[this.x, this.y-1],
					[this.x, this.y+1],
					[this.x-1, this.y+1],
					[this.x+1, this.y+1],
					[this.x-2, this.y],
					[this.x+2, this.y],];
			else
			list = [[this.x-1, this.y+2],
					[this.x+1, this.y+2],
					[this.x, this.y+1],
					[this.x, this.y-1],
					[this.x-1, this.y-1],
					[this.x+1, this.y-1],
					[this.x-2, this.y],
					[this.x+2, this.y],];
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
	
}
class HSKK extends HS {
	image = images[34];
	movable(){
		let list = super.movable();

		let sub_list = [];
		if (!this.stock_flag){
			let flag_list = [true, true, true, true];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x+i, this.y+i], [this.x+i, this.y-i], [this.x-i, this.y+i], [this.x-i, this.y-i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								sub_list.push(pos);
							}
							flag_list[j] = false;
						}else{
							sub_list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}

		list = list.concat(sub_list);
		return list;
	}
}
class HSFU extends Koma {
	image = images[35];
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
			let flag_list = [2, 2, 2, 2];
			for (let i=1;i<9;i++){
				let pos_list = [[this.x, this.y-i], [this.x+i, this.y], [this.x-i, this.y], [this.x, this.y+i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j]--;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}
class KKFU extends Koma {
	image = images[36];
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
			if(this.side == 0)
				list.push([this.x, this.y-1]);
			else
				list.push([this.x, this.y+1]);
			for (let i=1;i<9;i++){
				let pos_list = [[this.x+i, this.y+i], [this.x+i, this.y-i], [this.x-i, this.y+i], [this.x-i, this.y-i]];
				for (let j=0;j<4;j++){
					let pos = pos_list[j]
					if(flag_list[j] && this.isOnboard(pos)){
						if(this.isEnemy(pos) || this.isAlly(pos)){
							if (this.isEnemy(pos)){
								list.push(pos);
							}
							flag_list[j] = false;
						}else{
							list.push(pos);
						}
					}else
						flag_list[j] = false;
				}
			}
		}
		list = list.filter(pos => this.isOnboard(pos));
		list = list.filter(pos => !this.isAlly(pos));
		return list;
	}
}

function make_gattai_koma_functions(key){
	let made_koma = null;
	switch (key){
		case "KNGN" : 
			made_koma = new KNGN();
			break;
		case "KNKY" : 
			made_koma = new KNKY();
			break;
		case "KNKM" : 
			made_koma = new KNKM();
			break;
		case "KNHS" : 
			made_koma = new KNHS();
			break;
		case "KNKK" : 
			made_koma = new KNKK();
			break;
		case "KNFU" : 
			made_koma = new KNFU();
			break;
		case "GNKY" : 
			made_koma = new GNKY();
			break;
		case "GNKM" : 
			made_koma = new GNKM();
			break;
		case "GNHS" : 
			made_koma = new GNHS();
			break;
		case "GNKK" : 
			made_koma = new GNKK();
			break;
		case "GNFU" : 
			made_koma = new GNFU();
			break;
		case "KYKM" : 
			made_koma = new KYKM();
			break;
		case "KYHS" : 
			made_koma = new KYHS();
			break;
		case "KYKK" : 
			made_koma = new KYKK();
			break;
		case "KYFU" : 
			made_koma = new KYFU();
			break;
		case "KMHS" : 
			made_koma = new KMHS();
			break;
		case "KMKK" : 
			made_koma = new KMKK();
			break;
		case "KMFU" : 
			made_koma = new KMFU();
			break;
		case "HSKK" : 
			made_koma = new HSKK();
			break;
		case "HSFU" : 
			made_koma = new HSFU();
			break;
		case "KKFU" : 
			made_koma = new KKFU();
			break;
	}
	return made_koma;
}

var reverse_make_gattai_koma_functions = {
	"KNGN" : [new KN(), new GN()],
	"KNKY" : [new KN(), new KY()],
	"KNKM" : [new KN(), new KM()],
	"KNHS" : [new KN(), new HS()],
	"KNKK" : [new KN(), new KK()],
	"KNFU" : [new KN(), new FU()],
	"GNKY" : [new GN(), new KY()],
	"GNKM" : [new GN(), new KM()],
	"GNHS" : [new GN(), new HS()],
	"GNKK" : [new GN(), new KK()],
	"GNFU" : [new GN(), new FU()],
	"KYKM" : [new KY(), new KM()],
	"KYHS" : [new KY(), new HS()],
	"KYKK" : [new KY(), new KK()],
	"KYFU" : [new KY(), new FU()],
	"KMHS" : [new KM(), new HS()],
	"KMKK" : [new KM(), new KK()],
	"KMFU" : [new KM(), new FU()],
	"HSKK" : [new HS(), new KK()],
	"HSFU" : [new HS(), new FU()],
	"KKFU" : [new KK(), new FU()]
}

var gattai_koma_list = {
	"KNGN" : ['KN', 'GN'],
	"KNKY" : ['KN', 'KY'],
	"KNKM" : ['KN', 'KM'],
	"KNHS" : ['KN', 'HS'],
	"KNKK" : ['KN', 'KK'],
	"KNFU" : ['KN', 'FU'],
	"GNKY" : ['GN', 'KY'],
	"GNKM" : ['GN', 'KM'],
	"GNHS" : ['GN', 'HS'],
	"GNKK" : ['GN', 'KK'],
	"GNFU" : ['GN', 'FU'],
	"KYKM" : ['KY', 'KM'],
	"KYHS" : ['KY', 'HS'],
	"KYKK" : ['KY', 'KK'],
	"KYFU" : ['KY', 'FU'],
	"KMHS" : ['KM', 'HS'],
	"KMKK" : ['KM', 'KK'],
	"KMFU" : ['KM', 'FU'],
	"HSKK" : ['HS', 'KK'],
	"HSFU" : ['HS', 'FU'],
	"KKFU" : ['KK', 'FU']
}

//ゲームの初期化 game.htmlから init() をonlodで呼び出している
function init(){
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

	koma_list.push(new GNKY(3,4,0));
	koma_list.push(new KYHS(4,4,0));
	koma_list.push(new KNGN(5,4,0));

	init_board();

	//main関数の呼び出し
	requestAnimationFrame(main);
}

//main関数
function main() {
	//ゲーム終了時の処理
	if (game_end_flag){
		window.location.href = '../HP/HP.html';
	}
	if (turn == 0){
		//プレイヤーのクリックの受付
		canvas.addEventListener('click', this.clickListener);
	}else{
		if (AI_flag){
			console.log("AIのターン");
			AI();
		}else{
			canvas.addEventListener('click', this.clickListener);
		}	
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
		init_board();
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
	let target_obj = null;
	for(let i = 0; i < list.length; i++){
		if (list[i][0] == mouse_x && list[i][1] == mouse_y){
			target_obj = koma_list[i];
		}
	}
	if (target_obj != null){
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
					if (turn == 0){
						if (confirm("成りますか？")){
							change_nari(mouse_x,mouse_y);
						}
					}else{
						change_nari(mouse_x,mouse_y);
					}					
			}
		}
			
		turn = (turn+1)%2
		chose_move_flag = false;
		not_selected_flag = false;
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
				if(i>9){
					e.x = -4;
					e.y = i-10;
				}else{
					e.x = -3;
					e.y = i;
				}
				i++;
			}else{
				if(j>9){
					e.x = 12;
					e.y = 8-j+10;
				}else{
					e.x = 11;
					e.y = 8-j;
				}
				j++;
			}
		}
	});
}

//駒を成り駒にする
function change_nari(b_x,b_y){
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
	delete_koma(selected_obj);
}

//成駒が取られた時に元のコマに戻す
function reverse_nari(koma){
	let made_koma = null;
	switch (koma.constructor.name){
		case "TK":
			made_koma = new FU(0, 0, turn);
			break;
		case "NG":
			made_koma = new GN(0, 0, turn);
			break;
		case "NM":
			made_koma = new KM(0, 0, turn);
			break;
		case "NY":
			made_koma = new KY(0, 0, turn);
			break;
		case "RM":
			made_koma = new KK(0, 0, turn);
			break;
		case "RY":
			made_koma = new HS(0, 0, turn);
			break;
		default:
	}
	return made_koma;
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
	let out = minimax_choice();
	selected_obj = out[0];
	let pos = out[1];
	selected_obj.move(pos[0], pos[1]);
	turn = (turn + 1)%2;
	mouse_x = pos[0];
	mouse_y = pos[1];
	init_board();
}

function random_choice(){
	let cp_koma_list = koma_list.filter(e => {
		if (e.side == 1){
			return true;
		}else
			return false;
	});
	let choosed_koma = null;
	let pos = undefined;
	while(pos == undefined){
		choosed_koma = cp_koma_list[parseInt(cp_koma_list.length * Math.random())];
		let choosed_koma_movable = choosed_koma.movable();
		if (gattai_flag == false){
			choosed_koma_movable = choosed_koma_movable.filter(pos => !choosed_koma.isAlly(pos));
		}
		pos = choosed_koma_movable[parseInt(choosed_koma_movable.length * Math.random())];
	}
	return [choosed_koma, pos];
}

function minimax_choice(){
	let coppy_koma_list = koma_list.map(e =>  Object.assign(Object.create(Object.getPrototypeOf(e)),e));
	
	let cp_koma_list = coppy_koma_list.filter(e => {
		if (e.side == 1){
			return true;
		}else
			return false;
	});
	let actions = [];
	cp_koma_list.forEach(koma => {
		let mova = koma.movable();
		if (gattai_flag == false){
			mova = mova.filter(pos => !koma.isAlly(pos));
		}
		mova.forEach(pos => {
			actions.push([koma, pos]);
		});
	});
	
	let states = [];
	actions.forEach(action => {
		states.push(states_update(coppy_koma_list, action[0], action[1]));
		coppy_koma_list = koma_list.map(e =>  Object.assign(Object.create(Object.getPrototypeOf(e)),e));
	});
	let scores = [];
	states.forEach(state => {
		scores.push(minimax(state, 1, 1));
	});
	let max_score = Math.max.apply(null, scores);
	let max_score_index = scores.indexOf(max_score);
		
	cp_koma_list = koma_list.filter(e => {
		if (e.side == 1){
			return true;
		}else
			return false;
	});

	let choosed_koma = cp_koma_list[max_score_index];
	let pos = actions[max_score_index][1];

	return [choosed_koma, pos];
}

function minimax(s, depth, turn){
	let coppy_s = s.map(e =>  Object.assign(Object.create(Object.getPrototypeOf(e)),e));
	if (depth == 0){
		return evaluate(s);
	}
	let targer_koma_list = coppy_s.filter(e => {
			if (e.side == turn){
				return true;
			}else
				return false;
		});
	let actions = [];
	targer_koma_list.forEach(koma => {
		let mova = koma.movable();
		if (gattai_flag == false){
			mova = mova.filter(pos => !koma.isAlly(pos));
		}
		mova.forEach(pos => {
			actions.push([koma, pos]);
		});
	});
	let states = [];
	actions.forEach(action => {
		states.push(states_update(coppy_s, action[0], action[1]));
		coppy_s = s.map(e =>  Object.assign(Object.create(Object.getPrototypeOf(e)),e));
	});
	let scores = [];
	states.forEach(state => {
		scores.push(minimax(state, depth - 1, (turn + 1)%2));
	});
	if (turn == 0){
		return Math.max(...scores);
	}else{
		return Math.min(...scores);
	}
}


function states_update(state, koma, pos){
	koma.x = pos[0];
	koma.y = pos[1];
	let target_obj;
	for (let i = 0; i < state.length; i++){
		if (state[i] != koma && state[i].x == koma.x && state[i].y == koma.y){
			target_obj = state[i];
		}
	}
	if (target_obj != undefined){
		//敵と重なった時の処理
		if (target_obj.side != koma.side){
			if ( reverse_nari(target_obj) != null){
				let new_target_obj = reverse_nari(target_obj);
				koma_list.push(new_target_obj);
				delete_koma(target_obj);
				target_obj = new_target_obj;
			}
			
			target_obj.stock_flag = true;
			target_obj.side = koma.side;
		}
	}
	return state;
}

function evaluate(){
	let score = 0;
	koma_list.forEach(koma => {
		if (koma.side == 0){
			score += koma.score;
		}else{
			score -= koma.score;
		}
	});
	return score;
}

function delete_koma(koma){
	koma_list = koma_list.filter(e => {
		if(e == koma){
			return false;
		}else
			return true;
	})
	console.log("deleted");
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
