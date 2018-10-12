var stringify = (date) => {
    let H = date.getHours()
    let M = date.getMinutes()
    let S = date.getSeconds()
    let ss = date % 1000
    return `${H}:${M}:${S}.${ss}`
}

var times = [
    1538928000000,
    1538937000000,
    1538946000000,
    1538978400000,
    1538979000000,
    1539014400000
]

var barHeight = canvas.height
var barWidth = 100 * ratio
var initStart = 1538928000000
var initEnd = 1539014400000

var timeBoundStart = 1538928000000
var timeBoundEnd = 1539014400000

var timeTextWidth = 50 * ratio
var timeLineRatio = 1.1
// var changePointOffsetY = 200
// var changePointTime = 1538935200000
var lastFrameTime = Date.now()
var mouseDown = false
var mouseLastMovePoint
// var mouseLastDownStartTime

document.addEventListener('mousewheel', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.target.id === 'can' && (Date.now() - lastFrameTime > 100)) {
        lastFrameTime = Date.now()
        // console.log(e.offsetY, changePointTime)
        if (e.wheelDelta > 0) {
            augment(e.offsetY)
        } else {
            reduce(e.offsetY)
        }
    }
})
document.addEventListener('mousedown', (e) => {
    if (e.target.id === 'can') {
        // console.log('down',e.offsetX, e.offsetY)
        // console.log('down', e.offsetY)
        // mouseLastDownPoint = {
        //     x: e.offsetX,
        //     y: e.offsetY
        // }
        // mouseLastDownStartTime = timeBoundStart
        mouseDown = true
        mouseLastMovePoint = {
            x: e.offsetX,
            y: e.offsetY
        }
    }
})
document.addEventListener('mousemove', (e) => {
    if (e.target.id === 'can') {
        if (mouseDown) {
            let yDiff = e.offsetY - mouseLastMovePoint.y
            // console.log('yDiff', yDiff, timeBound)
            move(-yDiff)
            mouseLastMovePoint = {
                x: e.offsetX,
                y: e.offsetY
            }
        }
    }
})
document.addEventListener('mouseup', (e) => {
    if (e.target.id === 'can') {
        mouseDown = false
    }
})

draw()
function move (cssMove) {
    clearCanvas()
    modiTimeBoundsByMove(cssMove)
    draw()
}
function augment (offsetY) {
    let cssRatio = offsetY / parseInt(canvas.style.height)
    let timeTotalDiff = timeBoundEnd - timeBoundStart
    let timeDiff = timeTotalDiff * cssRatio
    let changePointTime = parseInt(timeDiff + timeBoundStart)
    console.log(offsetY, cssRatio, changePointTime)
    var visibleTimeLines = times.filter((ctime) => {
        return ctime >= timeBoundStart && ctime <= timeBoundEnd
    })
    if (visibleTimeLines.length > 0) {
        timeLineRatio = timeLineRatio + 0.1
        clearCanvas()
        modiTimeBoundsByRatio(changePointTime, timeLineRatio)
        draw()
    }
}
function reduce (offsetY) {
    let changePointTime = parseInt((offsetY / parseInt(canvas.style.height)) * (timeBoundEnd - timeBoundStart) + timeBoundStart)
    if (timeLineRatio > 1) {
        timeLineRatio = timeLineRatio - 0.1
        clearCanvas()
        modiTimeBoundsByRatio(changePointTime, timeLineRatio)
        draw()
    }
}
function clearCanvas () {
    context.clearRect(0, 0, canvas.width, canvas.height)
}
function modiTimeBoundsByRatio (changePointTime, timeLineRatio) {
    timeBoundStart = parseInt(((timeLineRatio - 1) * changePointTime + initStart) / timeLineRatio)
    timeBoundEnd = parseInt((initEnd + (timeLineRatio - 1) * changePointTime) / timeLineRatio)
}

/**
 * 
 * @param {Int} cssMove 可正负，正表示图片整体向上移动，负反之
 */
function modiTimeBoundsByMove (cssMove) {
    let timeDiff = timeBoundEnd - timeBoundStart
    let cssDiff = parseInt(canvas.style.height)
    let timeMove = parseInt(timeDiff * cssMove / cssDiff)
    // 判断移动后的时间没有超过头尾限制
    if ((timeMove > 0 && timeBoundEnd + timeMove < initEnd) || (timeMove < 0 && timeBoundStart + timeMove > initStart)) {
        timeBoundStart = timeBoundStart + timeMove
        timeBoundEnd = timeBoundEnd + timeMove
    }
}

function drawTimeLine (width, height) {
    drawLine({x: timeTextWidth, y: height}, {x: timeTextWidth + width, y: height})
}

function drawLine (startPoint, endPoint) {
    context.beginPath()
    context.moveTo(startPoint.x, startPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.stroke()
}

function drawText (text, width, height) {
    context.font = '20px serif'
    context.fillText(text, width, height)
}
function draw () {
    drawLine({x: timeTextWidth, y: 0}, {x: timeTextWidth, y: barHeight})
    times.filter((ctime) => {
        return ctime >= timeBoundStart && ctime <= timeBoundEnd
    }).forEach(function(ctime) {
        var dif = timeBoundEnd - timeBoundStart
        drawTimeLine(50 * ratio, barHeight * ((ctime - timeBoundStart) / dif))
    })
    drawText(stringify(new Date(timeBoundStart)), 0, 10 * ratio)
    drawText(stringify(new Date(timeBoundEnd)), 0, barHeight - (10 * ratio))
}
