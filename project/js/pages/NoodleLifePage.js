import DataBus from '../databus.js'
import Toast from '../components/Toast.js'

// 获取动态屏幕尺寸
const SCREEN_WIDTH = wx.getSystemInfoSync().screenWidth || 375
const SCREEN_HEIGHT = wx.getSystemInfoSync().screenHeight || 667
// 放大/缩小系数
const BACKGROUND_SCALE = 1// 背景缩小30%
const DIALOG_OFFSET_X = 0 // 静态对话框
// 背景上移偏移量（px，负数为向上）
const BG_OFFSET_Y = -50

export default class NoodleLifePage {
  backgroundImage = null
  backImage = null
  backButton = {}
  startButton = {}
  dialogBox = {}

  isLoaded = false

  constructor() {
    this.initButtons()
    this.initDialogBox()
    this.loadResources()
  }

  /**
   * 初始化按钮
   */
  initButtons() {
    this.backButton = { x: 30, y: 30, width: 50, height: 50, image: null }
    this.startButton = {
      x: SCREEN_WIDTH - 150,
      y: SCREEN_HEIGHT - 100,
      width: 120,
      height: 50,
      color: '#4CAF50',
      borderColor: '#45a049',
      text: '开始挑战',
      textColor: '#ffffff',
      fontSize: 16
    }
  }

  /**
   * 初始化对话框（静态坐标：向上移动70px）
   */
  initDialogBox() {
    this.dialogBox = {
      x: 330,
      y: 540, // 下移200px
      width: 420,
      height: 160,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#e0e0e0',
      borderRadius: 18,
      padding: 18,
      text: '你来到麦香村,遇见焦急的老面匠,得知“村中要举办面条节”。\n你需要学习面条制作流程，期间会遇到各种挑战。完成任务会得到丰厚奖励哦。',
      textColor: '#333333',
      fontSize: 18,
      lineHeight: 26
    }
  }

  /**
   * 加载资源
   */
  loadResources() {
    this.backgroundImage = wx.createImage()
    this.backgroundImage.src = 'images/lbg.png'
    this.backgroundImage.onload = () => { this.isLoaded = true }

    this.backImage = wx.createImage()
    this.backImage.src = 'images/back.png'
    this.backImage.onload = () => { this.backButton.image = this.backImage }
  }

  render(ctx) {
    if (!this.isLoaded) return

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    // 背景
    this.renderBackground(ctx)

    // 对话框（静态坐标）
    this.renderDialogBox(ctx)

    // 按钮
    this.renderButtons(ctx)
  }

  renderBackground(ctx) {
    if (this.backgroundImage) {
      const destY = BG_OFFSET_Y
      const destH = SCREEN_HEIGHT - destY
      ctx.drawImage(this.backgroundImage, 0, destY, SCREEN_WIDTH, destH)
    }
  }

  /** 渲染对话框 */
  renderDialogBox(ctx) {
    const box = this.dialogBox
    this.roundRect(ctx, box.x, box.y, box.width, box.height, box.borderRadius)
    ctx.fillStyle = box.backgroundColor
    ctx.fill()
    ctx.strokeStyle = box.borderColor
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = box.textColor
    ctx.font = `${box.fontSize}px Arial`
    ctx.textAlign = 'left'

    const lines = box.text.split('\n')
    let currentY = box.y + box.padding + box.fontSize

    lines.forEach(line => {
      const maxWidth = box.width - box.padding * 2
      const chars = line.split('')
      let currentLine = ''
      for (let i = 0; i < chars.length; i++) {
        const testLine = currentLine + chars[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine.length > 0) {
          ctx.fillText(currentLine, box.x + box.padding, currentY)
          currentLine = chars[i]
          currentY += box.lineHeight
        } else {
          currentLine = testLine
        }
      }
      if (currentLine.length > 0) {
        ctx.fillText(currentLine, box.x + box.padding, currentY)
        currentY += box.lineHeight
      }
    })
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  renderButtons(ctx) {
    this.renderBackButton(ctx)
    this.renderStartButton(ctx)
  }

  renderBackButton(ctx) {
    const btn = this.backButton
    if (btn.image && btn.image.complete) {
      ctx.drawImage(btn.image, btn.x, btn.y, btn.width, btn.height)
    }
  }

  renderStartButton(ctx) {
    const btn = this.startButton

    // 放大40%并保证不溢出屏幕
    const scale = 1.4
    let w = btn.width * scale
    let h = btn.height * scale
    let x = btn.x
    let y = btn.y

    // 边距
    const margin = 10

    // 如果放大后超出屏幕，优先移动其位置，其次收缩尺寸
    if (x + w > SCREEN_WIDTH - margin) {
      x = Math.max(margin, SCREEN_WIDTH - margin - w)
      if (x === margin && x + w > SCREEN_WIDTH - margin) {
        // 仍然超出，则按最大可用宽度收缩
        w = Math.max(60, SCREEN_WIDTH - margin * 2)
      }
    }
    if (y + h > SCREEN_HEIGHT - margin) {
      y = Math.max(margin, SCREEN_HEIGHT - margin - h)
      if (y === margin && y + h > SCREEN_HEIGHT - margin) {
        // 仍然超出，则按最大可用高度收缩
        h = Math.max(40, SCREEN_HEIGHT - margin * 2)
      }
    }

    // 圆角半径随比例略增
    const radius = Math.round(10 * Math.min(w / btn.width, h / btn.height))

    this.roundRect(ctx, x, y, w, h, Math.max(10, radius))
    ctx.fillStyle = btn.color
    ctx.fill()
    ctx.strokeStyle = btn.borderColor
    ctx.lineWidth = 2
    ctx.stroke()

    // 文本
    ctx.fillStyle = btn.textColor
    ctx.font = `${Math.round(btn.fontSize * Math.min(w / btn.width, h / btn.height))}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(btn.text, x + w / 2, y + h / 2)
  }

  handleTouch(event) {
    const touch = event.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    if (this.isPointInRect(x, y, this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height)) {
      this.handleBackClick()
      return
    }

    if (this.isPointInRect(x, y, this.startButton.x, this.startButton.y, this.startButton.width, this.startButton.height)) {
      this.handleStartChallengeClick()
      return
    }
  }

  isPointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
  }

  handleBackClick() {
    try {
      GameGlobal.pageManager.switchToPage('home')
      Toast.show('返回主页')
    } catch (error) {
      GameGlobal.databus.currentPage = 'home'
      Toast.show('返回主页')
    }
  }

  handleStartChallengeClick() {
    GameGlobal.databus.modules.noodleLife.unlocked = true
    Toast.show('面条的一生模块已解锁！')
    GameGlobal.pageManager.switchToPage('noodleChallenge')
  }

  update() {}
}
