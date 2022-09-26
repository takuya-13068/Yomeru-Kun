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
    
}

function Imgconvert(){
    let src = cv.imread(inputImg);
    //グレースケール変換
    let outGray = new cv.Mat();
    cv.cvtColor(src, outGray, cv.COLOR_RGBA2GRAY, 0);
    //ハフ変換
    let outHough = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let lines = new cv.Mat();
    cv.Canny(outGray, outGray, 300, 500);
    cv.HoughLinesP(outGray, lines, rho=1,  theta=Math.PI / 180, threshold=230, minLineLength=0, maxLineGap=40);
    // Hough検出した線を描く
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        if(Math.abs(startPoint.x - endPoint.x) + Math.abs(startPoint.y - endPoint.y) > 0){
            console.log(startPoint.x, endPoint.x);
            cv.line(outHough, startPoint, endPoint, new cv.Scalar(255, 255, 255));
        }
        
    }    
    
    cv.imshow("myCanvas", outHough);
}

async function uploadImage(){
    inputImg.src = URL.createObjectURL(selectedFile.files[0]);
}
