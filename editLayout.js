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
var frames=[];

document.addEventListener("DOMContentLoaded", function(){setupEditLayout()});//ロードイベント登録

function editLayoutMaster(){ // レイアウト編集用の処理を一通り行う
    createTestData(); // テスト用のデータを読み込み　画像読み込みは非同期のため要注意
    deleteFrames();
    const sleep1 = new Promise(resolve=>setTimeout(resolve,1000)); //テスト用のデータが非同期処理のため追加
    sleep1.then(()=>createFrames());
}

function deleteFrames(){
    // もともとあるフレームを削除する
    document.getElementById("frameWrapper").innerHTML="";
}
function createFrames(){
    // 読み込んだデータの数分のcanvasを用意して順番に書き込み、縦に表示する
    var newElement;
    for(var i = 0;i < frames.length;i++){
        newElement = document.createElement("canvas"); // canvas要素を作成
        document.getElementById("frameWrapper").appendChild(newElement);
        newElement.setAttribute("id","frame" + i); // p要素にidを設定   
        newElement.setAttribute("class","frames"); // p要素にidを設定   
        newElement.setAttribute("width",frames[i].imgData.width); 
        newElement.setAttribute("height",frames[i].imgData.height); 
        newElement.getContext("2d").putImageData(frames[i].imgData,0,0); 
    }
}

function pushTestFrames(){ //テストデータのフレームデータをプッシュする関数
    var testFrames=[{l:378,t:0,r:1022,b:446},
                    {l:94,t:0,r:375,b:449},
                    {l:94,t:451,r:1022,b:985},
                    {l:659,t:989,r:931,b:1365},
                    {l:91,t:989,r:652,b:1434}]
    for(var i =0;i < testFrames.length;i++){
        frames.push({
            page:0, pos:{x:testFrames[i].l, y:testFrames[i].t},
            imgData:testCtx.getImageData(testFrames[i].l, testFrames[i].t,
                                        testFrames[i].r-testFrames[i].l, testFrames[i].b-testFrames[i].t)
        })
    }
}

function createTestData(){
    // テスト用のデータを ./data/test/01.jpg から読み込んでframesに返す関数
    var testImg=new Image();
    testImg.src="./data/test/01.jpg";
    testImg.onload=()=>{
        viewCanvas.width=testImg.width;
        viewCanvas.height=testImg.height;
        testCtx.drawImage(testImg,0,0)
        pushTestFrames();
    };
    
}

function setupEditLayout(){ //ロード時に呼び出される関数
    viewCanvas=document.getElementById("viewCanvas");
    testCtx=viewCanvas.getContext("2d");
    editLayoutMaster()
}

