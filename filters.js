imgElement = document.getElementById('imageSrc');
imgOutputElement = document.getElementById('canvasOutput');
var inputElement = document.getElementById('fileInput');
var mat;
var tmpMat;

function download() {
    const link = document.createElement('a');
    link.download = getFileName();
    link.href = document.getElementById('canvasOutput').toDataURL()
    link.click();
}

function getFileName() {
    const str = document.getElementById('fileInput').value;
    const n = str.lastIndexOf('/');
    const n2 = str.lastIndexOf('\\');
    const pos = (n>n2)? n : n2
    const result = str.substring(pos + 1);
    return result
}

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function () {
    mat = cv.imread(imgElement);
    tmpMat = cv.imread(imgElement);
    const size = tmpMat.size();
    document.getElementById('width').value = size.width;
    document.getElementById('height').value = size.height;
    cv.imshow('canvasOutput', mat);
};

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

///// filters

function blackAndWite() {
    cv.cvtColor(mat, tmpMat, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow('canvasOutput', tmpMat);
}

function setBlur() {
    const trackbar = document.getElementById('trackbar');
    const trackbarValue = parseInt(trackbar.value);

    const ksize = new cv.Size(trackbarValue, trackbarValue);
    const anchor = new cv.Point(-1, -1);

    cv.blur(mat, tmpMat, ksize, anchor, cv.BORDER_DEFAULT);
    cv.imshow('canvasOutput', tmpMat);
}

function treshold() {
    const trackbar = document.getElementById('tresholdTrackbarMin');
    const trackbarValueMin = parseInt(trackbar.value);
    const trackbar2 = document.getElementById('tresholdTrackbarMax');
    const trackbarValueMax = parseInt(trackbar2.value);

    console.log("set treshold: (" + trackbarValueMin + ", " + trackbarValueMax + ") ");

    cv.threshold(mat, tmpMat, trackbarValueMin, trackbarValueMax, cv.THRESH_BINARY);
    cv.imshow('canvasOutput', tmpMat);
}

function adaptiveTreshold() {
    //cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);

    const adaptiveThresholdTrackbar = document.getElementById('adaptiveTreshold');
    const adaptiveThresholdTrackbarValue = parseInt(adaptiveThresholdTrackbar.value);

    const adaptiveThresholdBlockSizeTrackbar = document.getElementById('adaptiveTresholdBlockSize');
    const BlockSize = parseInt(adaptiveThresholdBlockSizeTrackbar.value);

    const adaptiveThresholdConstantTrackbar = document.getElementById('adaptiveTresholdConstant');
    const constant = parseInt(adaptiveThresholdConstantTrackbar.value);

    cv.adaptiveThreshold(mat, tmpMat, adaptiveThresholdTrackbarValue, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, BlockSize, constant);
    cv.imshow('canvasOutput', tmpMat);
}


function equalizeHistogramGray() {
    cv.cvtColor(mat, tmpMat, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(tmpMat, tmpMat);
    cv.imshow('canvasOutput', tmpMat);
}

function brightnessAndContrast() {
    const trackbar = document.getElementById('brightness');
    const brightnessTrackbarValue = parseFloat(trackbar.value);
    const trackbar2 = document.getElementById('contrast');
    const contrastTrackbarValue = parseFloat(trackbar2.value);
    mat.convertTo(tmpMat, -1, contrastTrackbarValue, brightnessTrackbarValue);
    cv.imshow('canvasOutput', tmpMat);
}

function resize() {
    const widthInp = document.getElementById('width');
    const widthInpValue = parseInt(widthInp.value);
    const heightInp = document.getElementById('height');
    const heightInpValue = parseInt(heightInp.value);

    const dsize = new cv.Size(widthInpValue, heightInpValue);
    cv.resize(mat, tmpMat, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput', tmpMat);
}

function rotate() {
    const rotateInp = document.getElementById('rotate');
    const rotateInpValue = parseInt(rotateInp.value);

    const dsize = new cv.Size(mat.rows, mat.cols);
    const center = new cv.Point(mat.cols / 2, mat.rows / 2);
    // You can try more different parameters
    const M = cv.getRotationMatrix2D(center, rotateInpValue, 1);
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
    mat = tmpMat.clone();
    cv.imshow('canvasOutput', mat);
}

function reset() {
    mat = cv.imread(imgElement);
    tmpMat = mat.clone();
    cv.imshow('canvasOutput', mat);
}

function bilateral() {
    const dInp = document.getElementById('d');
    const dValue = parseInt(dInp.value);
    const sigmaColorInp = document.getElementById('sigmaColor');
    const sigmaColorValue = parseInt(sigmaColorInp.value);
    const sigmaSpaceInp = document.getElementById('sigmaSpace');
    const sigmaSpaceValue = parseInt(sigmaSpaceInp.value);

    cv.cvtColor(mat, mat, cv.COLOR_RGBA2RGB, 0);
    cv.bilateralFilter(mat, tmpMat, dValue, sigmaColorValue, sigmaSpaceValue, cv.BORDER_DEFAULT);
    cv.imshow('canvasOutput', tmpMat);
}
