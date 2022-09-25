/*
    漫画のデータのレイアウトを編集する関数

    漫画のコマのデータは以下の形式で受け渡し
    frames[{page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]},    // １コマ目　
        {page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]},       // ２コマ目
        {page:0, pos:{x:12, y:34}, imgData:[0,0,2,1,0, ...]}, ...   // ３コマ目
        ]

    pageはもともと何ページ目にあったか、pos.xはもともとのページ内におけるx座標、pos.yはy座標、imgDataは長方形に切り取ったコマのimgData
    imgDataは、切り取ったあとのコマを"canvas1"の(0,0)から(W,H)の長方形領域に描いた場合、imgData=canvas1.getImageData(0,0,W,H); で取得可能
*/

var viewCanvas, testCtx;

document.addEventListener("DOMContentLoaded", function(){setupEditLayout()});//ロードイベント登録

function editLayoutMaster(){ // レイアウト編集用の初期設定を呼び出す
    createTestData(); // テスト用のデータを読み込み
}

function createTestData(){
    // テスト用のデータを ./data/test/01.jpg から読み込んでframesに返す関数
    var testImg=new Image();
    testImg.src="./data/test/01.jpg";
    testCtx.drawImage(testImg,0,0,960,540);
}

function setupEditLayout(){ //ロード時に呼び出される関数
    viewCanvas=document.getElementById("viewCanvas");
    testCtx=viewCanvas.getContext("2d");
    editLayoutMaster()
}

