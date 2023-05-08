$(window).on('load',function(){
  setTimeout(function(){
   $("#loading-wrapper").addClass("slide");
 },500);
  setTimeout(function(){
    $("#loading-wrapper").addClass("completed");
  },1000);
});
