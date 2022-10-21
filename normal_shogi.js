const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

var path = ["./images/syougi_ban.png"];
var images = new Array(path.length)

for (let i=0;i<path.length;i++){
  let element = new Image() ;
  element.src = path[i];
  images[i] = element;
}

// 画像のURLを指定
images[0].onload = () => {
    ctx.drawImage(images[0], canvas.width/2-images[0].naturalWidth/2, canvas.height/2-images[0].naturalWidth/2);
};