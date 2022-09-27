let inputImg;
let selectedFile;

//windowのloadが終わったタイミングで作動
window.onload = function(){
    inputImg = document.getElementById("inputImg");
    selectedFile = document.getElementById("selectedFile");

    //main.js onOpenCVReadyに入れたいがundefinedになるのでこっちに持ってくる
    selectedFile.addEventListener("change", uploadImage, false);

    inputImg.onload = function(){
        //console.log(inputImg.width);
        
    }
    document.getElementById("checkWall").style.display = "none";
    
}

function Imgconvert(){
    let src = cv.imread(inputImg);

    //      グレースケール変換      ///////
    let inGray = new cv.Mat();
    cv.cvtColor(src, inGray, cv.COLOR_RGBA2GRAY, 0);
    ///////////////////////

    //      左右のどっちが領域空白かチェックする        /////////////////
    let Side = 0; //0: error, 1: 右側が空白, 2: 左側が空白
    let NotWallL = false;
    let NotWallR = false;
    let width = inGray.size().width;
    let height = inGray.size().height;

    cv.imshow("checkWall", inGray);
    var wallCanvas = document.getElementById("checkWall").getContext("2d");
    var leftCol = wallCanvas.getImageData(5,0,1,height).data; //(x,y,width, height)の作業範囲のRGBAが含まれている
    var rightCol = wallCanvas.getImageData(width-5,0,1,height).data;
    var leftBase = leftCol.slice(0,3);
    var rightBase = rightCol.slice(0,3);
    for (let i=0; i<height; i++){
        if(leftCol[i*4+0]!=leftBase[0] || leftCol[i*4+1]!=leftBase[1] || leftCol[i*4+2]!=leftBase[2]){
            NotWallL = true;
        } else if(rightCol[i*4+0]!=rightBase[0] || rightCol[i*4+1]!=rightBase[1] || rightCol[i*4+2]!=rightBase[2]){
            NotWallR = true;
        }
    }
    if(NotWallL && !NotWallR) Side = 1;
    else if(!NotWallL && NotWallR) Side = 2;
    else Side = 0;
    console.log(Side);
    //////////////////////////////////////

    //      ぼかしを入れる      ///////////////////////
    let outGray = new cv.Mat();
    //let ksize = new cv.Size(3,3);
    //let anchor = new cv.Point(-1,-1);
    //cv.blur(inGray, outGray, ksize, anchor, cv.BORDER_DEFAULT);
    cv.medianBlur(inGray, outGray, 5);
    cv.imshow("canvas1", outGray);

    //      ハフ変換        /////////////////////////
    let outHough = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let lines = new cv.Mat();
    cv.Canny(outGray, outGray, 300, 500);
    cv.HoughLinesP(outGray, lines, rho=1,  theta=Math.PI / 180, threshold=230, minLineLength=0, maxLineGap=40);
    /////////////////////////////////////


    //      Hough検出した線を描く       ///////////////////
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        console.log(startPoint, endPoint);
        if(Math.sqrt(Math.pow(Math.abs(startPoint.x - endPoint.x),2) + Math.pow(Math.abs(startPoint.y - endPoint.y),2) ) > 0){
            //console.log(startPoint.x, endPoint.x);
            cv.line(outHough, startPoint, endPoint, new cv.Scalar(255, 255, 255));
        }
    }    
    cv.imshow("myCanvas", outHough);
    ////////////////////////////////////////

    

    //      削除処理        /////////////
    src.delete();
    inGray.delete();
    outGray.delete();
    lines.delete();
    //////////////////////////////
}

async function uploadImage(){
    inputImg.src = URL.createObjectURL(selectedFile.files[0]);
}


function blankJudge(){ //左右のどっちが領域空白かチェックする
    //
}

function closedArea(start, end){

}