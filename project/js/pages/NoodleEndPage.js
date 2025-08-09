import Toast from '../components/Toast.js'

const SCREEN_WIDTH = wx.getSystemInfoSync().screenWidth || 375
const SCREEN_HEIGHT = wx.getSystemInfoSync().screenHeight || 667
const BG_OFFSET_Y = -50

export default class NoodleEndPage {
  backgroundImage = null
  // 无返回按钮
  startButton = {}
  dialogBox = {}

  isLoaded = false

  constructor() {
    this.initButtons()
    this.initDialogBox()
    this.loadResources()
  }

  initButtons() {
    this.startButton = {
      x: SCREEN_WIDTH - 150,
      y: SCREEN_HEIGHT - 100,
      width: 120,
      height: 50,
      color: '#4CAF50',
      borderColor: '#45a049',
      text: '返回主页',
      textColor: '#ffffff',
      fontSize: 16
    }
  }

  initDialogBox() {
    this.dialogBox = {
      x: 330,
      y: 540,
      width: 420,
      height: 160,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#e0e0e0',
      borderRadius: 18,
      padding: 18,
      text: '恭喜你！完成了面条的一生',
      textColor: '#333333',
      fontSize: 22,
      lineHeight: 30
    }
  }

  loadResources() {
    this.backgroundImage = wx.createImage()
    this.backgroundImage.src = 'images/lbg.png'
    this.backgroundImage.onload = () => { this.isLoaded = true }
  }

  render(ctx) {
    if (!this.isLoaded) return

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    this.renderBackground(ctx)
    this.renderDialogBox(ctx)
    this.renderStartButton(ctx)
  }

  renderBackground(ctx) {
    if (this.backgroundImage) {
      const destY = BG_OFFSET_Y
      const destH = SCREEN_HEIGHT - destY
      ctx.drawImage(this.backgroundImage, 0, destY, SCREEN_WIDTH, destH)
    }
  }

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

  renderStartButton(ctx) {
    const btn = this.startButton

    // 和 NoodleLifePage 一致：放大40%并防溢出
    const scale = 1.4
    let w = btn.width * scale
    let h = btn.height * scale
    let x = btn.x
    let y = btn.y
    const margin = 10

    if (x + w > SCREEN_WIDTH - margin) {
      x = Math.max(margin, SCREEN_WIDTH - margin - w)
      if (x === margin && x + w > SCREEN_WIDTH - margin) {
        w = Math.max(60, SCREEN_WIDTH - margin * 2)
      }
    }
    if (y + h > SCREEN_HEIGHT - margin) {
      y = Math.max(margin, SCREEN_HEIGHT - margin - h)
      if (y === margin && y + h > SCREEN_HEIGHT - margin) {
        h = Math.max(40, SCREEN_HEIGHT - margin * 2)
      }
    }

    const radius = Math.round(10 * Math.min(w / btn.width, h / btn.height))

    this.roundRect(ctx, x, y, w, h, Math.max(10, radius))
    ctx.fillStyle = btn.color
    ctx.fill()
    ctx.strokeStyle = btn.borderColor
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = btn.textColor
    ctx.font = `${Math.round(btn.fontSize * Math.min(w / btn.width, h / btn.height))}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(btn.text, x + w / 2, y + h / 2)
  }

  handleTouch(event) {
    const t = event.touches[0]
    const x = t.clientX
    const y = t.clientY

    // 点击“返回主页”按钮
    const btn = this.startButton
    // 使用与渲染相同的放大参数计算当前按钮实际区域
    const scale = 1.4
    let w = btn.width * scale
    let h = btn.height * scale
    let bx = btn.x
    let by = btn.y
    const margin = 10
    if (bx + w > SCREEN_WIDTH - margin) {
      bx = Math.max(margin, SCREEN_WIDTH - margin - w)
      if (bx === margin && bx + w > SCREEN_WIDTH - margin) w = Math.max(60, SCREEN_WIDTH - margin * 2)
    }
    if (by + h > SCREEN_HEIGHT - margin) {
      by = Math.max(margin, SCREEN_HEIGHT - margin - h)
      if (by === margin && by + h > SCREEN_HEIGHT - margin) h = Math.max(40, SCREEN_HEIGHT - margin * 2)
    }

    if (x >= bx && x <= bx + w && y >= by && y <= by + h) {
      GameGlobal.pageManager.switchToPage('home')
      Toast.show('已返回主页')
      return
    }
  }
}
