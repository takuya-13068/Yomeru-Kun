
let src= cv.imread("./p00009.jpg");
let dst = new cv.Mat();
cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);