import Toast from '../components/Toast.js'

const { screenWidth, screenHeight } = wx.getSystemInfoSync()
const SCREEN_WIDTH = screenWidth || 375
const SCREEN_HEIGHT = screenHeight || 667
const BG_OFFSET_Y = 0
const BG_SCALE_ADJUST = 1.0

export default class NoodleChallengePage2 {
  backgroundImage = null
  backImage = null
  farmerImage = null
  passImage = null
  failedImage = null
  bgNaturalWidth = 0
  bgNaturalHeight = 0

  backButton = { x: 20, y: 18, width: 56, height: 56, image: null }
  dialog = null
  options = []
  correctKey = 'liandao' // 第二关正确答案：镰刀

  panelRect = { x: 0, y: SCREEN_HEIGHT * 0.7, w: SCREEN_WIDTH, h: SCREEN_HEIGHT * 0.3 }

  // 固定前两格填充，第二格为当前
  progress = {
    x: 60,
    y: 82,
    width: Math.max(180, SCREEN_WIDTH - 120),
    height: 18,
    segments: 4,
    gap: 8,
    activeCount: 2,
    current: 2,
    activeFill: '#FFD54F',
    activeBorder: '#E6A700',
    filledBorder: '#D18F00',
    inactiveFill: 'rgba(255,255,255,0.55)',
    inactiveBorder: 'rgba(0,0,0,0.15)',
    radius: 9
  }

  farmerNaturalWidth = 0
  farmerNaturalHeight = 0

  result = { type: 'none' } // 'none' | 'pass' | 'failed'

  isLoaded = false

  constructor() {
    this.initDialog()
    this.initOptions()
    this.loadResources()
    // 固定为第二段高亮
    this.progress.activeCount = 2
    this.progress.current = 2
  }

  initDialog() {
    const boxWidth = SCREEN_WIDTH * 0.48
    this.dialog = {
      x: 20,
      y: SCREEN_HEIGHT * 0.28,
      width: boxWidth,
      height: SCREEN_HEIGHT * 0.16,
      radius: 14,
      padding: 16,
      text: '将小麦都收割进仓库吧！',
    }
  }

  initOptions() {
    const areaY = SCREEN_HEIGHT * 0.86
    const gap = 16
    const btnWidth = (SCREEN_WIDTH - 40 - gap * 3) / 4
    const btnHeight = 64

    const baseX = 20

    this.options = [
      { key: 'quyuanni', label: '曲辕犁', x: baseX + (btnWidth + gap) * 0, y: areaY, width: btnWidth, height: btnHeight },
      { key: 'youche',   label: '耧车',   x: baseX + (btnWidth + gap) * 1, y: areaY, width: btnWidth, height: btnHeight },
      { key: 'lianjia',  label: '连枷',   x: baseX + (btnWidth + gap) * 2, y: areaY, width: btnWidth, height: btnHeight },
      { key: 'liandao',  label: '镰刀',   x: baseX + (btnWidth + gap) * 3, y: areaY, width: btnWidth, height: btnHeight },
    ]
  }

  loadResources() {
    // 背景换为 bg12
    this.backgroundImage = wx.createImage()
    this.backgroundImage.src = 'images/lbg02.png'
    this.backgroundImage.onload = () => {
      this.bgNaturalWidth = this.backgroundImage.width || 0
      this.bgNaturalHeight = this.backgroundImage.height || 0
    }

    // 返回
    this.backImage = wx.createImage()
    this.backImage.src = 'images/back.png'
    this.backImage.onload = () => {
      this.backButton.image = this.backImage
    }

    // 左侧装饰图
    this.farmerImage = wx.createImage()
    this.farmerImage.src = 'images/bg05.png'
    this.farmerImage.onload = () => {
      this.farmerNaturalWidth = this.farmerImage.width || 0
      this.farmerNaturalHeight = this.farmerImage.height || 0
    }

    // 结果图
    this.passImage = wx.createImage(); this.passImage.src = 'images/pass.png'
    this.failedImage = wx.createImage(); this.failedImage.src = 'images/failed.png'

    this.isLoaded = true
  }

  computeContainSize(nw, nh, maxW, maxH) {
    if (!nw || !nh) return { width: maxW, height: maxH }
    const scale = Math.min(maxW / nw, maxH / nh)
    return { width: nw * scale, height: nh * scale }
  }
  computeCoverSize(nw, nh, targetW, targetH) {
    if (!nw || !nh) return { width: targetW, height: targetH }
    const scale = Math.max(targetW / nw, targetH / nh)
    return { width: nw * scale, height: nh * scale }
  }

  render(ctx) {
    if (!this.isLoaded) return

    // 背景：等比cover铺满
    if (this.backgroundImage) {
      const base = this.computeCoverSize(this.bgNaturalWidth, this.bgNaturalHeight, SCREEN_WIDTH, SCREEN_HEIGHT)
      const drawW = base.width * BG_SCALE_ADJUST
      const drawH = base.height * BG_SCALE_ADJUST
      const dx = (SCREEN_WIDTH - drawW) / 2
      const dy = (SCREEN_HEIGHT - drawH) / 2 + BG_OFFSET_Y
      ctx.drawImage(this.backgroundImage, dx, dy, drawW, drawH)
    }

    this.renderProgressBar(ctx)
    this.renderBack(ctx)
    this.renderOptionsPanel(ctx)

    // 固定对话框布局
    const d = this.dialog
    d.width = Math.min(SCREEN_WIDTH * 0.42, SCREEN_WIDTH - 40)
    d.height = SCREEN_HEIGHT * 0.13
    d.x = 90
    d.y = Math.max(20, this.panelRect.y - d.height - 25)

    this.renderDialog(ctx)
    this.renderOptions(ctx)

    if (this.result.type === 'pass') this.renderPassLayer(ctx)
    if (this.result.type === 'failed') this.renderFailedLayer(ctx)
  }

  renderProgressBar(ctx) {
    const p = this.progress
    const segW = (p.width - p.gap * (p.segments - 1)) / p.segments
    for (let i = 0; i < p.segments; i++) {
      const sx = p.x + i * (segW + p.gap)
      const index = i + 1
      const isFilled = index <= p.activeCount
      const isCurrent = index === p.current
      this.roundRect(ctx, sx, p.y, segW, p.height, p.radius)
      ctx.fillStyle = isFilled ? p.activeFill : p.inactiveFill
      ctx.fill()
      if (isCurrent) {
        ctx.strokeStyle = p.activeBorder
        ctx.lineWidth = 2
      } else if (isFilled) {
        ctx.strokeStyle = p.filledBorder
        ctx.lineWidth = 1.5
      } else {
        ctx.strokeStyle = p.inactiveBorder
        ctx.lineWidth = 1
      }
      ctx.stroke()
    }
  }

  renderBack(ctx) {
    const b = this.backButton
    if (b.image) ctx.drawImage(b.image, b.x, b.y, b.width, b.height)
  }

  renderDialog(ctx) {
    const d = this.dialog
    this.roundRect(ctx, d.x, d.y, d.width, d.height, d.radius)
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 8
    ctx.fillStyle = 'rgba(255,255,255,0.78)'
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#333'
    ctx.font = '22px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const lines = d.text.split('\n')
    let yy = d.y + d.padding
    const maxWidth = d.width - d.padding * 2
    lines.forEach(line => {
      this.fillWrapText(ctx, line, d.x + d.padding, yy, maxWidth, 30)
      yy += 30
    })
  }

  renderOptionsPanel(ctx) {
    const top = this.options.length ? (this.options[0].y - 70) : (SCREEN_HEIGHT * 0.76 - 70)
    const x = 12
    const y = Math.max(top, SCREEN_HEIGHT * 0.72)
    const w = SCREEN_WIDTH - x * 2
    const h = SCREEN_HEIGHT - y - 10
    const r = 18

    this.panelRect = { x, y, w, h }

    this.roundRect(ctx, x, y, w, h, r)
    ctx.fillStyle = '#FFE7A3'
    ctx.fill()
    ctx.strokeStyle = '#F6C864'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(SCREEN_WIDTH / 2, y, 12, Math.PI, 2 * Math.PI)
    ctx.fillStyle = '#FFD978'
    ctx.fill()

    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.setLineDash([6, 10])
    for (let i = x + 24; i < x + w - 24; i += (w - 48) / 6) {
      ctx.beginPath()
      ctx.moveTo(i, y + 16)
      ctx.lineTo(i, y + h - 16)
      ctx.stroke()
    }
    ctx.restore()

    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.font = '20px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('请选择正确播种农具收割小麦', 30, y + 30)
  }

  renderOptions(ctx) {
    this.options.forEach(opt => {
      const isCorrect = opt.key === this.correctKey && opt.active
      const bg = isCorrect ? '#4CAF50' : '#FFFFFF'
      const border = isCorrect ? '#43A047' : 'rgba(0,0,0,0.08)'
      const color = isCorrect ? '#FFFFFF' : '#333333'

      this.roundRect(ctx, opt.x, opt.y, opt.width, opt.height, 16)
      ctx.fillStyle = bg
      ctx.fill()
      ctx.strokeStyle = border
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = color
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(opt.label, opt.x + opt.width / 2, opt.y + opt.height / 2)
    })
  }

  renderPassLayer(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    const nw = this.passImage ? this.passImage.width : 0
    const nh = this.passImage ? this.passImage.height : 0
    let drawH = Math.max(10, SCREEN_HEIGHT * 0.55)
    let drawW = nw && nh ? drawH * (nw / nh) : SCREEN_WIDTH * 0.6
    const maxW = SCREEN_WIDTH * 0.9
    if (drawW > maxW) {
      drawW = maxW
      drawH = nw && nh ? drawW * (nh / nw) : drawH
    }
    const x = (SCREEN_WIDTH - drawW) / 2
    const y = (SCREEN_HEIGHT - drawH) / 2
    if (this.passImage) ctx.drawImage(this.passImage, x, y, drawW, drawH)
  }

  renderFailedLayer(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    const nw = this.failedImage ? this.failedImage.width : 0
    const nh = this.failedImage ? this.failedImage.height : 0
    let drawH = Math.max(10, SCREEN_HEIGHT * 0.5)
    let drawW = nw && nh ? drawH * (nw / nh) : SCREEN_WIDTH * 0.6
    const maxW = SCREEN_WIDTH * 0.9
    if (drawW > maxW) {
      drawW = maxW
      drawH = nw && nh ? drawW * (nh / nw) : drawH
    }
    const x = (SCREEN_WIDTH - drawW) / 2
    const y = (SCREEN_HEIGHT - drawH) / 2
    if (this.failedImage) ctx.drawImage(this.failedImage, x, y, drawW, drawH)
  }

  handleTouch(event) {
    const t = event.touches[0]
    const x = t.clientX
    const y = t.clientY

    if (this.result.type === 'pass') {
      this.result.type = 'none'
      // 第二关通过后跳转到第三关
      GameGlobal.pageManager.switchToPage('noodleChallenge3')
      return
    }
    if (this.result.type === 'failed') {
      this.result.type = 'none'
      this.resetChoices()
      return
    }

    if (this.pointInRect(x, y, this.backButton)) {
      GameGlobal.pageManager.switchToPage('noodleLife')
      return
    }

    for (const opt of this.options) {
      if (this.pointInRect(x, y, opt)) {
        opt.active = true
        if (opt.key === this.correctKey) {
          this.result.type = 'pass'
        } else {
          this.result.type = 'failed'
        }
        break
      }
    }
  }

  resetChoices() {
    this.options.forEach(o => { o.active = false })
    // 保持两段已填充，当前为第二段
    this.progress.activeCount = 2
    this.progress.current = 2
  }

  pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  fillWrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = ''
    for (const ch of text) {
      const test = line + ch
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, y)
        line = ch
        y += lineHeight
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, y)
  }

  update() {}
}
