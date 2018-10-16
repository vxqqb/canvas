var canvas = document.getElementById('can');
var context = canvas.getContext('2d');
// 屏幕的设备像素比
var devicePixelRatio = window.devicePixelRatio || 1;
// 浏览器在渲染canvas之前存储画布信息的像素比
var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
// canvas的实际渲染倍率
var ratio = devicePixelRatio / backingStoreRatio;
var canvasWrapper = document.getElementById('canvas-wrapper');
canvas.height = canvasWrapper.clientHeight * ratio
canvas.width = canvasWrapper.clientWidth * ratio
canvas.style.height = canvasWrapper.clientHeight
canvas.style.width = canvasWrapper.clientWidth