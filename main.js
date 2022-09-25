
window.addEventListener('load', init); //ロードイベント登録
window.addEventListener('DOMContentLoaded', function(){ ///キー入力イベント登録
    window.addEventListener("keydown", function(e){
        keypress(e.key,e.keyCode);
    });
    window.addEventListener("keyup", function(e){ //キー離脱イベント登録
        keyup(e.key,e.keyCode);
    });

});

function init() {
    //ローディング処理////////////////////////////////////////

    //2Dの処理
    ctx2d=document.getElementById("myCanvas").getContext("2d");
    ctx2d.width = width;
    ctx2d.height = height;
    tick();

    function tick() {
        ctx2d.fillStyle=black;
        ctx2d.fillRect(100,120,20,80);
    }
}