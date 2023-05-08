$(window).on('load',function(){
  setTimeout(function(){
   $("#loading-wrapper").addClass("slide");
  },1500);
  setTimeout(function(){
    $("#loading-wrapper").addClass("completed");
  },2000);
});
