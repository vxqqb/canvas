var stringify = (date, noMiniSec) => {
    let H = date.getHours()
    H = H < 10 ? '0' + H : H
    let M = date.getMinutes()
    M = M < 10 ? '0' + M : M
    let S = date.getSeconds()
    S = S < 10 ? '0' + S : S
    let ss = date % 1000
    return `${H}${':' + M}${':' + S}${noMiniSec ? '' : ('.' + ss)}`
}
const DAY_START = 1539619200000
const DAY_SPAN = 86400000
const LOG_LINE_COUNT = 1000
const HIGH_LIGHT_LOG_LINE_COUNT = 150
let LOGLINE_SECTION_COUNT = 5 // 整条bar分5段展示时间刻度
if (LOG_LINE_COUNT <= 10) {
    LOGLINE_SECTION_COUNT = LOG_LINE_COUNT - 1 
}
let highlightLogStartIndex = 300

const BLACK = '#000'
const GREY = '#bfbfbf'
const RED = '#ff4d4f'
const BLUE = '#1890ff'
const GREEN = '#52c41a'
const ORANGE = '#fa541c'
var logs = Array.from({length: LOG_LINE_COUNT}).map(() => {
    return {
        time: parseInt(Math.random() * DAY_SPAN) + DAY_START,
        logType: LOG_TYPE_LIST[parseInt(Math.random() * LOG_TYPE_LIST.length)]
    }
}).sort((a, b) => {
    return a.time - b.time
})

var barTopMargin = 30
var barTopHeight = barTopMargin * ratio
var barBottomMargin = 20
var barBottomHeight = barBottomMargin * ratio
var barHeight = canvas.height - barTopHeight - barBottomHeight
var barCssHeight = parseInt(canvas.style.height) - barTopMargin - barBottomMargin
var barCssWidth = 30
var barWidth = barCssWidth * ratio
var timeTextCssWidth = 50
var timeTextWidth = timeTextCssWidth * ratio
var $tooltip = document.getElementById('tooltip')

if (LOG_LINE_COUNT < 2 || LOG_LINE_COUNT < LOGLINE_SECTION_COUNT + 1) {
    console.error('LOG_LINE_COUNT is not valid')
} else {
    draw()
    showHighlightFrame()
    document.addEventListener('mousemove', (e) => {
        redraw()
        showHighlightFrame()
        if (e.target.id === 'can' && isMouseTouchInBar(e)) {
            let hoveredLogIndex = getMouseHoveredLogIndex(e.offsetY - barTopMargin)
            if (hoveredLogIndex !== null) {
                showToolTip(hoveredLogIndex, logs[hoveredLogIndex])
            }
        }
    })
    document.addEventListener('mouseover', (e) => {
        redraw()
        showHighlightFrame()
        if (e.target.id === 'can' && isMouseTouchInBar(e)) {
            let hoveredLogIndex = getMouseHoveredLogIndex(e.offsetY - barTopMargin)
            if (hoveredLogIndex !== null) {
                showToolTip(hoveredLogIndex, logs[hoveredLogIndex])
            }
        }
    })
    document.addEventListener('click', (e) => {
        if (e.target.id === 'can' && isMouseTouchInBar(e)) {
            let hoveredLogIndex = getMouseHoveredLogIndex(e.offsetY - barTopMargin)
            if (hoveredLogIndex !== null) {
                highlightLogStartIndex = hoveredLogIndex
                redraw()
                showHighlightFrame()
            }
        }
    })
}

function isMouseTouchInBar (e) {
    let offsetX = e.offsetX
    let offsetY = e.offsetY
    return offsetY >= barTopMargin && offsetY <= barCssHeight + barTopMargin && offsetX >= timeTextCssWidth && offsetX <= timeTextCssWidth + barCssWidth
}

function redraw () {
    $tooltip.style.display = 'none'
    clearCanvas()
    draw()
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height)
}

function drawLogLine(width, height, color) {
    drawLine({ x: timeTextWidth, y: height + barTopHeight }, { x: timeTextWidth + width, y: height + barTopHeight }, color)
}

function drawLine(startPoint, endPoint, color) {
    context.strokeStyle = color || GREY
    context.beginPath()
    context.moveTo(startPoint.x, startPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.stroke()
}

function drawText(text, x, y) {
    context.fillStyle = BLACK
    context.font = '20px serif'
    context.textBaseline = "middle";
    context.fillText(text, x, y)
}

function drawBoldLine (startPoint, width, height, color) {
    context.fillStyle = color || BLUE
    context.fillRect(startPoint.x, startPoint.y, width, height)
}

/**
 * 在startPoint与endPoint构成的长方形外面套frameLineWidth厚度的边框
 * @param {*} startPoint 左上角的坐标
 * @param {*} endPoint 右下角的坐标
 * @param {*} frameLineWidth 
 */
function drawFrame (startPoint, endPoint, frameLineWidth, color) {
    context.fillStyle = color || '#eb2f96'
    let frameWidth = endPoint.x - startPoint.x + 2 * frameLineWidth
    let frameHeight = endPoint.y - startPoint.y + 2 * frameLineWidth
    // 上边框
    context.fillRect(startPoint.x - frameLineWidth, startPoint.y - frameLineWidth, frameWidth, frameLineWidth)
    // 左边框
    context.fillRect(startPoint.x - frameLineWidth, startPoint.y - frameLineWidth, frameLineWidth, frameHeight)
    // 右边框
    context.fillRect(endPoint.x, startPoint.y - frameLineWidth, frameLineWidth, frameHeight)
    // 下边框
    context.fillRect(startPoint.x - frameLineWidth, endPoint.y, frameWidth, frameLineWidth)
}

function draw() {
    // 画bar的border
    drawLine({ x: timeTextWidth, y: barTopHeight }, { x: timeTextWidth, y: barTopHeight + barHeight })
    drawLine({ x: timeTextWidth + barWidth, y: barTopHeight }, { x: timeTextWidth + barWidth, y: barTopHeight + barHeight })
    var lineCanvasHeightSpan = barHeight / (LOG_LINE_COUNT - 1)
    // 画logline
    logs.forEach(function(log, index) {
        let color = log.logType.displayColor
        drawLogLine(barWidth, lineCanvasHeightSpan * index, color)
    })

    // 画时间刻度
    var timeDiff = logs[LOG_LINE_COUNT - 1].time - logs[0].time
    var timeSpan = timeDiff / LOGLINE_SECTION_COUNT
    var timeStamps = Array.from({length: LOGLINE_SECTION_COUNT}).map((i, index) => {
        return parseInt(index * timeSpan) + logs[0].time
    }).concat(logs[LOG_LINE_COUNT - 1].time)
    timeStamps.forEach((time, index) => {
        let height
        if (index === timeStamps.length - 1) {
            height = barHeight
        } else {
            height = index * (barHeight / LOGLINE_SECTION_COUNT)
        }
        drawText(stringify(new Date(time), true), 10 * ratio, height + barTopHeight)
    })
}

function showHighlightFrame () {
    var lineCanvasHeightSpan = barHeight / (LOG_LINE_COUNT - 1)
    const FRAME_LINE_WIDTH = 3 * ratio
    const FRAME_COLOR = BLUE
    let logStartIndex = highlightLogStartIndex < LOG_LINE_COUNT - HIGH_LIGHT_LOG_LINE_COUNT - 1 ? highlightLogStartIndex : (LOG_LINE_COUNT - HIGH_LIGHT_LOG_LINE_COUNT - 1)
    let frameStartPoint = {
        x: timeTextWidth,
        y: logStartIndex * lineCanvasHeightSpan + barTopHeight
    }
    let frameEndPoint = {
        x: timeTextWidth + barWidth,
        y: (logStartIndex + HIGH_LIGHT_LOG_LINE_COUNT) * lineCanvasHeightSpan + barTopHeight
    }
    drawFrame(frameStartPoint, frameEndPoint, FRAME_LINE_WIDTH, FRAME_COLOR)
}

function showToolTip (index, log) {
    var lineCanvasHeightSpan = barHeight / (LOG_LINE_COUNT - 1)
    drawBoldLine({
        x: timeTextWidth - 8 * ratio,
        y: lineCanvasHeightSpan * index + barTopHeight - 2 * ratio
    }, barWidth + 2 * 8 * ratio, 4 * ratio, ORANGE)
    // 展示tooltip
    $tooltip.innerHTML = '时间: ' + stringify(new Date(log.time)) + '</br>日志类型: ' + log.logType.logTypeName
    $tooltip.style.display = 'block'
    $tooltip.style.top = parseInt(lineCanvasHeightSpan * index / ratio) + barTopMargin
}

function getMouseHoveredLogIndex (offsetY) {
    const MOUSE_TOLERENCE = 1 // 上下像素容错范围
    var lineCssHeightSpan = barCssHeight / (LOG_LINE_COUNT - 1)
    var outOfLineRange = offsetY % lineCssHeightSpan // 鼠标hover处距离某条line多少高度
    if (outOfLineRange < MOUSE_TOLERENCE) {
        // 接近上一条line
        return parseInt(offsetY / lineCssHeightSpan)
    } else if (outOfLineRange > lineCssHeightSpan - MOUSE_TOLERENCE) {
        // 接近下一条line
        return parseInt(offsetY / lineCssHeightSpan) + 1
    } else {
        // 不接近任何一条line
        return null
    }
}