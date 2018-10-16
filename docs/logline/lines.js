var stringify = (date) => {
    let H = date.getHours()
    let M = date.getMinutes()
    let S = date.getSeconds()
    let ss = date % 1000
    return `${H}:${M}:${S}.${ss}`
}
const DAY_START = 1539619200000
const DAY_SPAN = 86400000
const LOG_LINE_COUNT = 50
const HIGH_LIGHT_LOG_LINE_COUNT = 5
const LOGLINE_SECTION_COUNT = 5 // 整条bar分5段展示时间刻度
const BLACK = '#000'
const GREY = '#bfbfbf'
const RED = '#ff4d4f'
const BLUE = '#1890ff'
var logs = Array.from({length: LOG_LINE_COUNT}).map(() => {
    return {
        time: parseInt(Math.random() * DAY_SPAN) + DAY_START,
        logType: LOG_TYPE_LIST[parseInt(Math.random() * LOG_TYPE_LIST.length)]
    }
}).sort((a, b) => {
    return a.time - b.time
})
var highlightLogIndex = 53 

var barHeight = canvas.height
var barWidth = 100 * ratio
var timeTextWidth = 50 * ratio
var $tooltip = document.getElementById('tooltip')

document.addEventListener('mousewheel', (e) => {
    // e.preventDefault()
    // e.stopPropagation()
    // if (e.target.id === 'can') {
    //     lastFrameTime = Date.now()
    //     if (e.wheelDelta > 0) {
    //         augment(e.offsetY)
    //     } else {
    //         // 还能缩，否则停止reduce，减少不必要的redraw
    //         if (timeBoundStart > initStart || timeBoundEnd < initEnd) {
    //             reduce(e.offsetY)
    //         }
    //     }
    // }
})
document.addEventListener('mousedown', (e) => {
    // if (e.target.id === 'can') {
    //     mouseDown = true
    //     mouseLastMovePoint = {
    //         x: e.offsetX,
    //         y: e.offsetY
    //     }
    // }
})
document.addEventListener('mousemove', (e) => {
    if (e.target.id === 'can') {
        let hoveredLogIndex = getMouseHoveredLogIndex(e.offsetY)
        //TODO index超出logs长度
        if (hoveredLogIndex !== null) {
            clearCanvas()
            showToolTip(hoveredLogIndex, logs[hoveredLogIndex])
            draw()
        }
    }
})
document.addEventListener('mouseup', (e) => {
    // mouseDown = false
})
document.addEventListener('mouseover', (e) => {
    if (e.target.id === 'can') {
        // console.log('y' + e.offsetY)
    }
})

// NOTE: canvas.style.height需要比MOUSE_TOLERENCE大
function getMouseHoveredLogIndex (offsetY) {
    const MOUSE_TOLERENCE = 1 // 上下像素容错范围
    var lineCssSpan = parseInt(canvas.style.height) / LOG_LINE_COUNT
    var outOfLineRange = offsetY % lineCssSpan // 鼠标hover处距离某条line多少高度
    if (outOfLineRange < MOUSE_TOLERENCE) {
        // 接近上一条line
        return parseInt(offsetY / lineCssSpan)
    } else if (outOfLineRange > lineCssSpan - MOUSE_TOLERENCE) {
        // 接近下一条line
        return parseInt(offsetY / lineCssSpan) + 1
    } else {
        // 不接近任何一条line
        return null
    }
}

draw()
function move(cssMove) {
    clearCanvas()
    modiTimeBoundsByMove(cssMove)
    console.warn('redraw')
    draw()
}
function _calculateChangePointTime(offsetY) {
    // 计算放大点对应的时间值
    let cssRatio = offsetY / parseInt(canvas.style.height)
    let timeTotalDiff = timeBoundEnd - timeBoundStart
    let timeDiff = timeTotalDiff * cssRatio
    let changePointTime = parseInt(timeDiff + timeBoundStart)
    return changePointTime
}
function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height)
}

/**
 * 
 * @param {Int} cssMove 可正负，正表示图片整体向上移动，负反之
 */
function modiTimeBoundsByMove(cssMove) {
    let timeDiff = timeBoundEnd - timeBoundStart
    let cssDiff = parseInt(canvas.style.height)
    let timeMove = parseInt(timeDiff * cssMove / cssDiff)
    if (Math.abs(timeMove) < 1 ) {
        timeMove = cssMove < 0 ? -1 : 1 // 如果timeMove已经很小了，那么最小1毫秒步进
    }
    // 判断移动后的时间没有超过头尾限制
    let newTimeBoundStart = timeBoundStart + timeMove
    let newTimeBoundEnd = timeBoundEnd + timeMove
    if (newTimeBoundStart < initStart) {
        timeBoundStart = initStart
        timeBoundEnd = initStart + timeDiff
    } else if (newTimeBoundEnd > initEnd) {
        timeBoundEnd = initEnd
        timeBoundStart = initEnd - timeDiff
    } else {
        timeBoundStart = timeBoundStart + timeMove
        timeBoundEnd = timeBoundEnd + timeMove
    }
}

function drawLogLine(width, height, color) {
    drawLine({ x: timeTextWidth, y: height }, { x: timeTextWidth + width, y: height }, color)
}

function drawLine(startPoint, endPoint, color) {
    context.strokeStyle = color || GREY
    context.beginPath()
    context.moveTo(startPoint.x, startPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.stroke()
}

function drawText(text, width, height) {
    context.fillStyle = BLACK
    context.font = '20px serif'
    context.fillText(text, width, height)
}

function drawBoldLine (startPoint, width, height, color) {
    context.fillStyle = color || BLUE
    context.fillRect(startPoint.x, startPoint.y, width, height)
}

function draw() {
    // 画bar的border
    drawLine({ x: timeTextWidth, y: 0 }, { x: timeTextWidth, y: barHeight })
    var lineHeightSpan = barHeight / LOG_LINE_COUNT
    // 画logline
    logs.forEach(function(log, index) {
        let color = log.logType.displayColor
        drawLogLine(50 * ratio, lineHeightSpan * index, color)
    })
    // 画框
    // if (highlightLogIndex <= index && index < highlightLogIndex + HIGH_LIGHT_LOG_LINE_COUNT ) {
    //     color = RED
    // }
    // 画时间刻度
    var timeDiff = logs[LOG_LINE_COUNT - 1].time - logs[0].time
    var timeSpan = timeDiff / LOGLINE_SECTION_COUNT
    var timeStamps = Array.from({length: LOGLINE_SECTION_COUNT + 1}).map((i, index) => {
        return parseInt(index * timeSpan) + logs[0].time
    })
    timeStamps.forEach((time, index) => {
        let height
        if (index === 0) {
            height = 10 * ratio
        } else if (index === timeStamps.length - 1) {
            height = barHeight - (5 * ratio)
        } else {
            height = index * (barHeight / LOGLINE_SECTION_COUNT)
        }
        drawText(stringify(new Date(time)), 0, height)
    })
}

function showToolTip (index, log) {
    var lineHeightSpan = barHeight / LOG_LINE_COUNT
    drawBoldLine({
        x: timeTextWidth,
        y: lineHeightSpan * index
    }, 50 * ratio, 5, BLUE)
    // 展示tooltip
    $tooltip.innerHTML = '时间: ' + stringify(new Date(log.time))
    $tooltip.style.display = 'block'
    $tooltip.style.top = lineHeightSpan * index / ratio
}
