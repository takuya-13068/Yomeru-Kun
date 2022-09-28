let inputImg;
let selectedFile;
let width;
let height;
var Dots;
var lineNum =0;


//windowのloadが終わったタイミングで作動
window.onload = function(){
    inputImg = document.getElementById("inputImg");
    selectedFile = document.getElementById("selectedFile");

    //main.js onOpenCVReadyに入れたいがundefinedになるのでこっちに持ってくる
    selectedFile.addEventListener("change", uploadImage, false);

    inputImg.onload = function(){        
    }
    document.getElementById("checkWall").style.display = "none";
    document.getElementById("frameData").style.display = "none";
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
    width = inGray.size().width;
    height = inGray.size().height;
    console.log(width,height);
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
    cv.medianBlur(inGray, outGray, 7.5);
    //cv.imshow("converted", outGray);

    //      ハフ変換        /////////////////////////
    //let outHough = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    var lines = new cv.Mat();
    cv.Canny(outGray, outGray, 300, 500);
    cv.HoughLinesP(outGray, lines, rho=1,  theta=Math.PI / 180, threshold=230, minLineLength=0, maxLineGap=40);
    /////////////////////////////////////

    //      背景判定をした方向に対して直線を追加する       ///////////////////
    /*  
    lines.data32Sに追加は用意されていないので別の配列を作成しここに入れる
    Lines: [始点のx座標, 始点のy座標, 終点のx座標, 終点のy座標]
    */
    let Lines = Array(lines.data32S.length/4);
    Lines.fill(0);
    for (let i=0; i<lines.data32S.length/4; i++) {
        Lines[i] = [lines.data32S[i*4], lines.data32S[i*4+1], lines.data32S[i*4+2], lines.data32S[i*4+3]];}
    if(Side == 1) {
        Lines.push([0,0,width,0], [0,height,width,height], [0,0,0,height]);} //右側空白のため右縦以外の直線を導入(上4つ, 下4つ, 左4つ)
    else if(Side == 2) {
        Lines.push([0,0,width,0], [0,height,width,height], [width,0,width,height]);} //左側空白のため左縦以外の直線を導入(上4つ, 下4つ, 右4つ)
    //////////////////////////////////////

    console.log(Lines);
    console.log(Lines.length);
    lineNum = 0;
    Lines = lineReduction(Lines);
    console.log(Lines);
    /*
    必要な直線のみに絞る工程
    1. 交点を求め、閉領域の可能性がある区域を4点情報で保存する
    2. 4点での面積を求め一定以上の場合その領域をコマとして認識
    3. 求められたフォーマットにデータを調整
    */
    var LineDots = [];
    for(var i=0; i< Lines.length; i++){
        for (var j=i+1; j< Lines.length; j++){
            for(var k=j+1;k< Lines.length; k++){
                for(var l=k+1; l< Lines.length; l++){
                    if(judgeShape(Lines[i],Lines[j],Lines[k],Lines[l])){
                        //交点を計算する。
                        var dot1 = {x:0, y:0}; var dot2 = {x:0, y:0}; var dot3 = {x:0, y:0}; var dot4 = {x:0, y:0}; 
                        var intSec1 = intersection(Dots[0], Dots[1], Dots[2], Dots[3]); 
                        var intSec2 = intersection(Dots[2], Dots[3], Dots[4], Dots[5]);
                        var intSec3 = intersection(Dots[4], Dots[5], Dots[6], Dots[7]);
                        var intSec4 = intersection(Dots[6], Dots[7], Dots[0], Dots[1]);
                        dot1.x = intSec1[0]; dot1.y = intSec1[1];
                        dot2.x = intSec2[0]; dot2.y = intSec2[1];
                        dot3.x = intSec3[0]; dot3.y = intSec3[1];
                        dot4.x = intSec4[0]; dot4.y = intSec4[1];
                        dot1.x = Math.round(dot1.x); dot1.y = Math.round(dot1.y); 
                        dot2.x = Math.round(dot2.x); dot2.y = Math.round(dot2.y);
                        dot3.x = Math.round(dot3.x); dot3.y = Math.round(dot3.y); 
                        dot4.x = Math.round(dot4.x); dot4.y = Math.round(dot4.y);                        

                        //一定の面積以上あるか検出する
                        var areaDimension = calcArea(dot1, dot2, dot3, dot4);
                        if(areaDimension > 300000) {
                            var checkArr = [dot1.x,dot1.y, dot2.x, dot2.y, dot3.x, dot3.y, dot4.x, dot4.y];
                            for (let i=0; i<4; i++) {
                                if(!(checkArr[i*2] >= 0 && checkArr[i*2] <= width && checkArr[i*2+1] >= 0 && checkArr[i*2+1] <= height)) {
                                    console.error("ERROR! dotの座標が画像範囲外になっています。  No." + i*2 + ", 数値: " + checkArr[i*2]+ ", "  + checkArr[i*2+1]);
                                    console.log(Dots);
                                    break;
                                }
                            }
                            var position = dotPosition(dot1, dot2, dot3, dot4);
                            dot1 = position[0]; dot2 = position[1], dot3 = position[2], dot4 = position[3];

                            inputData(dot1, dot2, dot3, dot4);
                            LineDots.push([dot1, dot2, dot3, dot4]);
                            //console.log("made frame(areaDimension: " + areaDimension + ")");
                        }
                    }
                }
            }
        }
    }
    console.log(frames);

    //      描画処理        ////////////////////
    var ctxConvert = document.getElementById("converted").getContext("2d");
    ctxConvert.width = width;
    ctxConvert.height = height;
    ctxConvert.drawImage(inputImg,0,0);
    ctxConvert.lineWidth = 2;
    ctxConvert.strokeStyle = "rgb(0, 255, 0)"
    for (let i=0; i<LineDots.length; i++) {
        ctxConvert.beginPath();
        ctxConvert.moveTo(LineDots[i][0].x, LineDots[i][0].y);
        ctxConvert.lineTo(LineDots[i][1].x, LineDots[i][1].y);
        ctxConvert.lineTo(LineDots[i][2].x, LineDots[i][2].y);
        ctxConvert.lineTo(LineDots[i][3].x, LineDots[i][3].y);
        ctxConvert.stroke();
    }
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

function calcArea(dot1, dot2, dot3, dot4){ 
    /*
    4点から面積を見積もる
    それぞれのdotには.x: x座標, .y: y座標が含まれている
    */
    //dot1が原点になるように座標を調整
    var d1 = {x:0, y:0};
    var d2 = {x:dot2.x - dot1.x, y: dot2.y - dot1.y};
    var d3 = {x:dot3.x - dot1.x, y: dot3.y - dot1.y};
    var d4 = {x:dot4.x - dot1.x, y: dot4.y - dot1.y};

    //dot1からの角度を算出
    let radian2 = Math.atan2( d2.y - d1.y, d2.x - d1.y );
    let degree2 = radian2 * (180 / Math.PI);
    let radian3 = Math.atan2( d3.y - d1.y, d3.x - d1.y );
    let degree3 = radian3 * (180 / Math.PI);
    let radian4 = Math.atan2( d4.y - d1.y, d4.x - d1.y );
    let degree4 = radian4 * (180 / Math.PI);
    
    if(degree2 == degree3 || degree2== degree4 || degree3==degree4) console.error("error: it's not rectangle. it include same degrees.");

    if(degree2 > degree3) [degree2, degree3] = [degree3, degree2];
    if(degree3 > degree4) [degree3, degree4] = [degree4, degree3];
    while((degree2 > degree3 || degree3 > degree4)){ //thetaが 2<3<4で大きくなる
        if(degree2 > degree3) [degree2, degree3] = [degree3, degree2];
        if(degree3 > degree4) [degree3, degree4] = [degree4, degree3];
    }
    return Math.abs(d2.x*d3.y - d2.y*d3.x) + Math.abs(d3.x*d4.y - d3.y*d4.x)/2
}

function intersection(dotA, dotB, dotC, dotD){
    if(dotA.x == dotB.x){ // この時、C,Dはy軸に並行ではないはず
        var c = (dotC.y-dotD.y) / (dotC.x-dotD.x)
        var d = dotC.y - c * dotC.x;
        var X = dotA.x;
        var Y = c*X+d;
    } else if(dotC.x == dotD.x){ // この時、A,Bはy軸に並行ではないはず
        var a = (dotA.y-dotB.y) / (dotA.x-dotB.x)
        var b = dotA.y - a * dotA.x;
        var X = dotC.x;
        var Y = a*X+b;
    } else {
        //２直線の4点によって生まれる交点の座標を返す
        var a = (dotA.y-dotB.y) / (dotA.x-dotB.x)
        var b = dotA.y - a * dotA.x;
        var c = (dotC.y-dotD.y) / (dotC.x-dotD.x)
        var d = dotC.y - c * dotC.x;
        var X = (d-b) / (a-c);
        var Y = a*X+b;
    }
    return [X, Y];
}

function judgeShape(line1, line2, line3, line4){//四角形が生成されるか判断する
    //true: 四角形が生成される, false: 四角形が生成されない
    Dots = [{x: line1[0], y: line1[1]},{x: line1[2], y: line1[3]}, {x: line2[0], y: line2[1]},{x: line2[2], y: line2[3]}, {x: line3[0], y: line3[1]},{x: line3[2], y: line3[3]}, {x: line4[0], y: line4[1]},{x: line4[2], y: line4[3]}];
    let count = 0;
    let set=2;
    for (let i=1; i<4; i++){
        if(judgeAdj(Dots[0], Dots[1], Dots[i*2], Dots[i*2+1] ) ) count+=1;
        else set = i;
    }
    if(count < 2) {
        return false
    } else{
        count = 0;
        //Dotsの中で1-2-3-4と巡回できるように順番を整える。
        if(set == 1) {
            [Dots[1*2], Dots[2*2]] = [Dots[2*2], Dots[1*2]];
            [Dots[1*2+1], Dots[2*2+1]] = [Dots[2*2+1], Dots[1*2+1]];
        } else if(set ==3){
            [Dots[3*2], Dots[2*2]] = [Dots[2*2], Dots[3*2]];
            [Dots[3*2+1], Dots[2*2+1]] = [Dots[2*2+1], Dots[3*2+1]];
        }
        for (let i=0; i<4; i++){
            if(set != i){
                if(judgeAdj(Dots[set*2], Dots[set*2+1], Dots[i*2], Dots[i*2+1] ) ) count++;
            }
        }
        if(count < 2) return false
        else return true
    }
}

function judgeAdj(dotA, dotB, dotC, dotD){//2直線の4点が交点を持つ可能性があるか判断する
    //  true: 存在する,  false: 並行 or 交点が線分中に存在しない
    if(dotA.x == dotB.x && dotC.x == dotD.x) return false; //両方y軸に並行の場合
    else {
        var inter = intersection(dotA, dotB, dotC, dotD);
        let allowError = 20;
        //console.log(inter);
        if( calcDistance(dotA.x, dotA.y, inter[0], inter[1]) < allowError || calcDistance(dotB.x, dotB.y, inter[0], inter[1]) < allowError || onStraight(dotA.x, dotA.y, dotB.x, dotB.y, inter[0], inter[1])){ 
            if( calcDistance(dotC.x, dotC.y, inter[0], inter[1]) < allowError || calcDistance(dotD.x, dotD.y, inter[0], inter[1]) < allowError || onStraight(dotC.x, dotC.y, dotD.x, dotD.y, inter[0], inter[1])){ 
                if(inter[0] >=0 && inter[0] <= width && inter[1] >= 0 && inter[1] <= height) return true
                else return false
            } else return false
        } else return false
    }
}

function calcDistance(x1, y1, x2, y2){
    return Math.sqrt( Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2) )
}

function onStraight(x1,y1,x2,y2,xinter,yinter){// 直線上に存在するか
    if(x1==x2) {
        if(x1 == xinter) return true
        else return false
    } else {
        var a = (y2-y1) / (x2-x1);
        var b = y1 - a*x1;
        if(a*xinter+b == yinter) return true
        else return false
    }
}

function inputData(dot1, dot2, dot3, dot4){
    //データエラーチェック
    
    if(Math.max(dot2.x,dot3.x) - dot1.x > width) console.error("ERROR! frames' width is too large: "+ Math.max(dot2.x,dot3.x) - dot1.x);
    else if(Math.max(dot3.y, dot4.y) - dot1.y > height) console.error("ERROR! frames'height is too large: "+ Math.max(dot3.y, dot4.y) - dot1.y);
    //canvasに描画して画素データをframesに入れる
    else {
        ctxFrame = document.getElementById("frameData").getContext("2d");
        ctxFrame.width = width;
        ctxFrame.height = height;
        ctxFrame.drawImage(inputImg,0,0);
        //console.log(dot1, dot2, dot3, dot4);
        var frameImgData = ctxFrame.getImageData(dot1.x, dot2.y, Math.max(dot2.x,dot3.x) - dot1.x, Math.max(dot3.y, dot4.y) - dot1.y);
        frames.push({page:0, pos:{x:dot1.x, y: dot1.y}, frameImgData});
    }
}

function dotPosition(dot1, dot2, dot3, dot4){
    /* 
    それぞれのpositionを調整
    左上の頂点を始点に時計回りで
    */
    var arr = [dot1.y + dot1.x, dot2.y + dot2.x, dot3.y + dot3.x, dot4.y + dot4.x];
    var topLeft = arr.indexOf(Math.min(...arr));
    if(topLeft == 0) {}//元から左上にある
    else if(topLeft == 1) [dot1, dot2] = [dot2, dot1]; //dot2が左上にあるから交換
    else if(topLeft == 2) [dot1, dot3] = [dot3, dot1]; //dot3が左上にあるから交換
    else if(topLeft == 3) [dot1, dot4] = [dot4, dot1]; //dot4が左上にあるから交換
    else console.error("ERROR! topLeftが定まっていません。");

    var arr = [dot1.y + dot1.x, dot2.y + dot2.x, dot3.y + dot3.x, dot4.y + dot4.x];
    var bottomRight = arr.indexOf(Math.max(...arr));
    if(bottomRight == 2) {}//元から右下にある
    else if(bottomRight == 0) [dot1, dot3] = [dot3, dot1]; //dot1が右下にあるから交換
    else if(bottomRight == 1) [dot2, dot3] = [dot3, dot2]; //dot2が右下にあるから交換
    else if(bottomRight == 3) [dot3, dot4] = [dot4, dot3]; //dot4が右下にあるから交換
    else console.error("ERROR! bottomRightが定まっていません。");
    //この状態でdot2, dot4が残っているから識別, x座標で明らかにdot4.x< dot2.x
    if(dot4.x > dot2.x) [dot4, dot2] = [dot2,dot4];
    else if(dot4.x == dot2.x) console.error("ERROR! 頂点調整が完了できません。");

    return [dot1, dot2, dot3, dot4]
}
function lineReduction(Lines){ // 
    if(Lines[lineNum][0]==Lines[lineNum][2]){
        for(let i=lineNum+1; i<Lines.length; i++){
            if( Lines[i][0]==Lines[i][2] && Math.abs( Lines[lineNum][0]-Lines[i][0] ) < 8 ) {
                //左右8px以内に他の直線が存在していればそいつを削除
                Lines.splice(i, 1);
                lineNum--;
                console.log(Lines.length);
                break;
            } 
        } 
        lineNum++;
    } else { lineNum++; }
    if(lineNum >= Lines.length) return Lines
    else {
        return lineReduction(Lines);
    }
}