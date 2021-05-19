imgElement = document.getElementById('imageSrc');
imgOutputElement = document.getElementById('canvasOutput');
var inputElement = document.getElementById('fileInput');
var mat;
var tmpMat;

function download() {
    const link = document.createElement('a');
    link.download = imgElement.src;
    link.href = document.getElementById('canvasOutput').toDataURL()
    link.click();
}

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function () {
    mat = cv.imread(imgElement);
    tmpMat = cv.imread(imgElement);

    var size = tmpMat.size();
    console.log("image size: " + size.width + " x " + size.height);
    document.getElementById('width').value = size.width;
    document.getElementById('height').value = size.height;


    cv.imshow('canvasOutput', mat);
    //mat.delete();
};

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

///// filters

function blackAndWite() {

    console.log("feketefeher filter. ");
    cv.cvtColor(mat, tmpMat, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow('canvasOutput', tmpMat);
}

function setBlur() {
    console.log("blur filter. ");

    var trackbar = document.getElementById('trackbar');
    var trackbarValue = parseInt(trackbar.value);

    var ksize = new cv.Size(trackbarValue, trackbarValue);
    var anchor = new cv.Point(-1, -1);

    cv.blur(mat, tmpMat, ksize, anchor, cv.BORDER_DEFAULT);

    cv.imshow('canvasOutput', tmpMat);
}

function treshold() {
    var trackbar = document.getElementById('tresholdTrackbarMin');
    var trackbarValueMin = parseInt(trackbar.value);
    var trackbar2 = document.getElementById('tresholdTrackbarMax');
    var trackbarValueMax = parseInt(trackbar2.value);

    console.log("set treshold: (" + trackbarValueMin + ", " + trackbarValueMax + ") ");

    cv.threshold(mat, tmpMat, trackbarValueMin, trackbarValueMax, cv.THRESH_BINARY);
    cv.imshow('canvasOutput', tmpMat);
}

function adaptiveTreshold() {
    //cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);

    var adaptiveTresholdTrackbar = document.getElementById('adaptiveTreshold');
    var adaptiveTresholdTrackbarValue = parseInt(adaptiveTresholdTrackbar.value);

    var adaptiveTresholdBlockSizeTrackbar = document.getElementById('adaptiveTresholdBlockSize');
    var BlockSize = parseInt(adaptiveTresholdBlockSizeTrackbar.value);

    var adaptiveTresholdConstantTrackbar = document.getElementById('adaptiveTresholdConstant');
    var constant = parseInt(adaptiveTresholdConstantTrackbar.value);

    cv.adaptiveThreshold(mat, tmpMat, adaptiveTresholdTrackbarValue, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, BlockSize, constant);
    cv.imshow('canvasOutput', tmpMat);
}


function equalizeHistogramGray() {
    console.log("equalizeHistogram");

    cv.cvtColor(mat, tmpMat, cv.COLOR_RGBA2GRAY, 0);

    cv.equalizeHist(tmpMat, tmpMat);
    cv.imshow('canvasOutput', tmpMat);
}

function brightnessAndContrast() {
    var trackbar = document.getElementById('brightness');
    var brightnessTrackbarValue = parseFloat(trackbar.value);
    var trackbar2 = document.getElementById('contrast');
    var contrastTrackbarValue = parseFloat(trackbar2.value);

    console.log("set brightness " + brightnessTrackbarValue + " and contrast" + contrastTrackbarValue);

    mat.convertTo(tmpMat, -1, contrastTrackbarValue, brightnessTrackbarValue);
    cv.imshow('canvasOutput', tmpMat);
}

function resize() {

    var widthInp = document.getElementById('width');
    var widthInpValue = parseInt(widthInp.value);
    var heightInp = document.getElementById('height');
    var heightInpValue = parseInt(heightInp.value);

    console.log("resize: " + widthInpValue + " x " + heightInpValue);

    let dsize = new cv.Size(widthInpValue, heightInpValue);
    cv.resize(mat, tmpMat, dsize, 0, 0, cv.INTER_AREA);

    cv.imshow('canvasOutput', tmpMat);
}

function rotate() {
    var rotateInp = document.getElementById('rotate');
    var rotateInpValue = parseInt(rotateInp.value);

    let dsize = new cv.Size(mat.rows, mat.cols);
    let center = new cv.Point(mat.cols / 2, mat.rows / 2);
    // You can try more different parameters
    let M = cv.getRotationMatrix2D(center, rotateInpValue, 1);
    cv.warpAffine(mat, tmpMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.imshow('canvasOutput', tmpMat);
}

function showHistogram() {
    let srcVec = new cv.MatVector();
    srcVec.push_back(tmpMat);
    let accumulate = false;
    let channels = [0];
    let histSize = [256];
    let ranges = [0, 255];
    let hist = new cv.Mat();
    let mask = new cv.Mat();
    let color = new cv.Scalar(255, 255, 255);
    let scale = 2;
    // You can try more different parameters
    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
    let result = cv.minMaxLoc(hist, mask);
    let max = result.maxVal;
    let dst = new cv.Mat.zeros(tmpMat.rows, histSize[0] * scale,
        cv.CV_8UC3);
    // draw histogram
    for (let i = 0; i < histSize[0]; i++) {
        let binVal = hist.data32F[i] * tmpMat.rows / max;
        let point1 = new cv.Point(i * scale, tmpMat.rows - 1);
        let point2 = new cv.Point((i + 1) * scale - 1, tmpMat.rows - binVal);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
    }
    cv.imshow('canvasOutputHist', dst);
}


function setChanges() {
    //mat = new cv.Mat(tmpMat);

    mat = tmpMat.clone();
    cv.imshow('canvasOutput', mat);
}

function reset() {
    //tmpMat = mat;
    mat = cv.imread(imgElement);
    tmpMat = mat.clone();
    cv.imshow('canvasOutput', mat);
}

function bilateral() {
    var dInp = document.getElementById('d');
    var dValue = parseInt(dInp.value);
    var sigmaColorInp = document.getElementById('sigmaColor');
    var sigmaColorValue = parseInt(sigmaColorInp.value);
    var sigmaSpaceInp = document.getElementById('sigmaSpace');
    var sigmaSpaceValue = parseInt(sigmaSpaceInp.value);

    cv.cvtColor(mat, mat, cv.COLOR_RGBA2RGB, 0);
    cv.bilateralFilter(mat, tmpMat, dValue, sigmaColorValue, sigmaSpaceValue, cv.BORDER_DEFAULT);
    cv.imshow('canvasOutput', tmpMat);
}

function test() {
    console.log("test");


    for (let i = 0; i < tmpMat.rows; i++) {
        for (let j = 0; j < tmpMat.cols; j++) {
            tmpMat.ucharPtr(i, j)[2] += 20;

        }
    }
    cv.imshow('canvasOutput', tmpMat);

}
