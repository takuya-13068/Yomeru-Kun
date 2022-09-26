window.addEventListener('load', init); //ロードイベント登録
window.addEventListener('DOMContentLoaded', function(){ ///キー入力イベント登録
});

function onOpenCvReady(){
    document.getElementById('opencvStatus').innerHTML = 'OpenCV.js is ready.';
}

function init() {
    //ローディング処理////////////////////////////////////////

    //2Dの処理
    ctx2d=document.getElementById("myCanvas").getContext("2d");
    
    //ctx2d.width = width;
    //ctx2d.height = height;

    tick();
}

function tick() {
}