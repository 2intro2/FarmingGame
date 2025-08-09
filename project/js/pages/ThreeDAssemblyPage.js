import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * 立体组装页（全新页面）
 * - 左侧垂直 Tab
 * - 中央组装区域
 * - 无倒计时
 */
export default class ThreeDAssemblyPage {
  tabs = [];
  activeTabIndex = 0;
  buttons = {};
  assemblyArea = null;
  tabImages = {};
  assemblyBgImage = null;
  assemblyMainImage = null; // 主底图，置于最下方
  tabFloorImage = null; // Tab 区域“地板”底图
  tabFloorImageAlt = null; // 兼容命名差异的备用底图（zhuzhuang vs zuzhuang）
  // 底部按钮整体水平偏移（负值向左，正值向右）
  bottomButtonsShiftX = -100;
  // 底部按钮整体垂直偏移（负值向上，正值向下）
  bottomButtonsShiftY = -20;
  // 提交成功覆盖层
  successOverlayVisible = false;
  successOverlayImage = null;     // images/zuzhuang-chenggong.png
  successButtonImage = null;      // images/zuzhuang-qr.png
  successButtonBounds = null;     // {x, y, width, height}
  successNextPage = null;         // 点击确认后跳转的页面（外部可设置）
  // 提交失败覆盖层
  failureOverlayVisible = false;
  failureOverlayImage = null;      // images/zuzhuang-shibai.png
  failureButtonImage = null;       // images/zuzhuang-cxks.png
  failureButtonBounds = null;      // {x, y, width, height}
  // 组装区域灰底与判定区域整体偏移与缩放
  assemblyInnerOffsetX = 90;  // 向右为正
  assemblyInnerOffsetY = -70; // 向上为负
  assemblyInnerScale = 0.7;    // <1 缩小, >1 放大
  // Tab 外观缩放与整体下移
  tabScale = 1.3;              // 1 为原始大小
  tabPanelOffsetY = 30;        // Tab 整体下移像素
  tabPanelOffsetX = 30;        // Tab 整体右移像素
  // 提交完成后的最终状态
  isAssemblyCompleted = false;
  finalAssemblyImage = null;
  dragging = null; // 当前拖拽物 { key, x, y, width, height }
  placedParts = []; // 已放置的部件 [{ key, x, y, width, height }]
  snapTargets = []; // 预设吸附目标位（支持不规则多边形）
  partToTargets = {}; // 规则：每个部位允许的目标位索引数组
  targetLabels = []; // 与 snapTargets 对应的中文标签
  successEffect = null; // { index, endTime }
  failureEffect = null; // { x, y, startTime, endTime }
  showGuides = false; // 是否显示虚线与文字提示（拖拽判定区域）
  matchTolerancePx = 30; // 多边形附近命中的容差像素，越大越容易匹配
  matchBoundsMarginPx = 20; // 外接矩形粗过滤的外扩边距像素
  completedTabs = new Set(); // 已完成的部位（禁用再次选择）
  // 放置后的微调偏移（像素），用于精确微调显示位置
  placementOffsetByKey = {
    li_shao: { x: 124, y: 192 },
    li_e:    { x: -28, y: -15 },
    li_ji:   { x: -22, y: 170 },
    li_di:   { x: 50, y: -110 },
    li_hua:  { x: -152, y: -30 }
  };
  // Tab 对应拼音（含声调）
  pinyinByKey = {
    li_shao: 'lí shāo',
    li_e: 'lí yuán',
    li_ji: 'lí jiàn',
    li_di: 'lí dǐ',
    li_hua: 'lí chǎn'
  };
  // 放置后的缩放：全局系数与按部件分别设置（最终缩放 = global * perKey）
  globalPlacementScale = 4.2;
  placementScaleByKey = {
    li_shao: 1.0,
    li_e:    1.45,
    li_ji:   2.20,
    li_di:   1.28,
    li_hua:  1.80,
  };
  // 左侧预览区：按部件分别设置显示大小与偏移（scale 为在等比适配基础上的额外缩放）
  previewConfigByKey = {
    li_shao: { scale: 3.0, offsetX: 56,  offsetY: 200 },
    li_e:    { scale: 2.5, offsetX: -38,  offsetY: 90 },
    li_ji:   { scale: 3.0, offsetX: -40,  offsetY: -20 },
    li_di:   { scale: 3.0, offsetX: -28,  offsetY: -120 },
    li_hua:  { scale: 3.0, offsetX: -60,  offsetY: -180 }
  };
  // 目标位锚点（在各目标位外接矩形中的百分比坐标），以及图片自身锚点（在图片中的百分比坐标）
  targetAnchorByIndex = []; // [{x:0..1, y:0..1}]
  imageAnchorByKey = {}; // { partKey: {x:0..1, y:0..1} }

  constructor() {
    this.initTabs();
    this.initButtons();
    this.initLayoutMeta();
    this.loadTabImages();
    this.initSnapTargets();
    this.initPlacementRules();
    this.loadAssemblyBackground();
    this.initAnchors();
    this.loadTabFloorImage();
  }

  initTabs() {
    // 根据参考图定义五个部位（图片为占位，后续可替换）
    this.tabs = [
      { key: 'li_shao', name: '犁梢', imageSrc: 'images/lishao.png' },
      { key: 'li_e', name: '犁辕', imageSrc: 'images/liyuan.png' },
      { key: 'li_ji', name: '犁箭', imageSrc: 'images/lijian.png' },
      { key: 'li_di', name: '犁底', imageSrc: 'images/lidi.png' },
      { key: 'li_hua', name: '犁铲', imageSrc: 'images/lichan.png' }
    ];
  }

  loadTabImages() {
    // 预加载每个部位的图片，若加载失败仍可显示占位
    this.tabs.forEach(tab => {
      if (!tab.imageSrc) return;
      try {
        const img = wx.createImage();
        img.src = tab.imageSrc;
        this.tabImages[tab.key] = img;
      } catch (e) {
        // ignore 加载失败使用占位
      }
    });
  }

  loadAssemblyBackground() {
    try {
      const img = wx.createImage();
      img.src = 'images/quyuanli-huidi.png';
      this.assemblyBgImage = img;
    } catch (e) {
      this.assemblyBgImage = null;
    }
    try {
      const mainImg = wx.createImage();
      mainImg.src = 'images/zuzhuang-main.png';
      this.assemblyMainImage = mainImg;
    } catch (e) {
      this.assemblyMainImage = null;
    }
  }

  loadTabFloorImage() {
    // 优先使用 zhuzhuang-diban.png（项目中已存在），兼容 zuzhuang-diban.png
    try {
      const img = wx.createImage();
      img.src = 'images/zhuzhuang-diban.png';
      this.tabFloorImage = img;
    } catch (e) {
      this.tabFloorImage = null;
    }
    try {
      const img2 = wx.createImage();
      img2.src = 'images/zhuzhuang-diban.png';
      this.tabFloorImageAlt = img2;
    } catch (e) {
      this.tabFloorImageAlt = null;
    }
  }

  // 加载提交成功相关素材
  loadSuccessAssets() {
    if (!this.successOverlayImage) {
      try {
        const img = wx.createImage();
        img.src = 'images/zuzhuang-chenggong.png';
        this.successOverlayImage = img;
      } catch (e) {
        this.successOverlayImage = null;
      }
    }
    if (!this.successButtonImage) {
      try {
        const btnImg = wx.createImage();
        btnImg.src = 'images/zuzhuang-qr.png';
        this.successButtonImage = btnImg;
      } catch (e) {
        this.successButtonImage = null;
      }
    }
  }

  // 加载提交失败相关素材
  loadFailureAssets() {
    if (!this.failureOverlayImage) {
      try {
        const img = wx.createImage();
        img.src = 'images/zuzhuang-shibai.png';
        this.failureOverlayImage = img;
      } catch (e) {
        this.failureOverlayImage = null;
      }
    }
    if (!this.failureButtonImage) {
      try {
        const btnImg = wx.createImage();
        btnImg.src = 'images/zuzhuang-cxks.png';
        this.failureButtonImage = btnImg;
      } catch (e) {
        this.failureButtonImage = null;
      }
    }
  }

  // 计算多边形外接矩形
  computePolygonBounds(points) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxY = Math.max.apply(null, ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // 画多边形描边
  strokePolygon(ctx, points) {
    if (!points || points.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  // 点是否在多边形内部（射线法）
  isPointInPolygon(px, py, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi + 0.00001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // 点到线段的最短距离
  distancePointToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D || 1;
    let t = dot / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * C;
    const projY = y1 + t * D;
    const dx = px - projX;
    const dy = py - projY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 点是否在多边形附近（容差像素）
  isPointNearPolygon(px, py, points, tolerance = 15) {
    if (this.isPointInPolygon(px, py, points)) return true;
    let minDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const d = this.distancePointToSegment(px, py, a.x, a.y, b.x, b.y);
      if (d < minDist) minDist = d;
      if (minDist <= tolerance) return true;
    }
    return false;
  }

  // 计算多边形质心（用于默认锚点）
  computeCentroid(points) {
    let x = 0, y = 0;
    points.forEach(p => { x += p.x; y += p.y; });
    return { x: x / points.length, y: y / points.length };
  }

  // 初始化各目标位和图片的锚点（可按需微调）
  initAnchors() {
    // 目标位默认锚点：外接矩形的中心
    this.targetAnchorByIndex = [
      { x: 0.52, y: 0.55 }, // 犁梢：稍偏右、偏下
      { x: 0.55, y: 0.45 }, // 犁辕：略偏右上
      { x: 0.50, y: 0.20 }, // 犁箭：靠上
      { x: 0.50, y: 0.60 }, // 犁底：偏下
      { x: 0.35, y: 0.45 }  // 犁铲：靠左中
    ];

    // 图片自身锚点：选择与实物接触/关键点对齐的位置
    this.imageAnchorByKey = {
      li_shao: { x: 0.5, y: 1.0 }, // 犁梢：以底部中心对齐
      li_e:    { x: 0.5, y: 0.5 }, // 犁辕：居中
      li_ji:   { x: 0.5, y: 1.0 }, // 犁箭：底部中心（竖件）
      li_di:   { x: 0.5, y: 0.5 }, // 犁底：居中
      li_hua:  { x: 0.3, y: 0.7 }  // 犁铲：略靠左下
    };
  }

  // 旋转一组相对点（绕原点）角度：度数
  rotateRelativePoints(points, angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return points.map(p => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }));
  }

  // 将图片按等比缩放适配盒子尺寸
  fitImageInBox(naturalWidth, naturalHeight, boxWidth, boxHeight) {
    if (!naturalWidth || !naturalHeight || !boxWidth || !boxHeight) {
      return { width: boxWidth, height: boxHeight };
    }
    const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    return {
      width: Math.max(1, Math.floor(naturalWidth * scale)),
      height: Math.max(1, Math.floor(naturalHeight * scale))
    };
  }

  initButtons() {
    this.buttons = {
      back: { x: 20, y: 20, width: 60, height: 60, icon: '←', image: 'images/zuzhuang-fanhui.png' },
      restart: { x: SCREEN_WIDTH * 0.2 + 40 + (this.bottomButtonsShiftX || 0), y: SCREEN_HEIGHT - 90 + (this.bottomButtonsShiftY || 0), width: 200, height: 60, image: 'images/zhuzhuang-restart.png' },
      submit:  { x: SCREEN_WIDTH - 260 + (this.bottomButtonsShiftX || 0),        y: SCREEN_HEIGHT - 90 + (this.bottomButtonsShiftY || 0), width: 220, height: 60, image: 'images/zhuzhuang-commit.png' }
    };
  }

  initLayoutMeta() {
    // 放大 Tab 区域宽度、整体下移
    const leftPanelWidth = Math.max(200, Math.floor(SCREEN_WIDTH * 0.24));
    const contentPadding = 20;
    this.assemblyArea = {
      x: leftPanelWidth + contentPadding,
      y: 100,
      width: SCREEN_WIDTH - leftPanelWidth - contentPadding * 2,
      height: SCREEN_HEIGHT - 200
    };
    this.leftPanel = {
      x: (this.tabPanelOffsetX || 0),
      y: 80 + (this.tabPanelOffsetY || 0),
      width: leftPanelWidth,
      height: SCREEN_HEIGHT - 160
    };
  }

  initSnapTargets() {
    // 在组装区域内预设不规则形状（用多边形描述）
    const { x, y, width, height } = this.assemblyArea;
    const aw = width;
    const ah = height;
    const offx = this.assemblyInnerOffsetX || 0;
    const offy = this.assemblyInnerOffsetY || 0;

    const innerScale = this.assemblyInnerScale || 1;
    const makePolygon = (cx, cy, relPoints) => {
      const pts = relPoints.map(p => ({ x: cx + offx + p.x * innerScale, y: cy + offy + p.y * innerScale }));
      const bounds = this.computePolygonBounds(pts);
      return { points: pts, bounds };
    };

    // 近似形状（按大致比例）
    const w_shao = Math.max(aw * 0.10, 80), h_shao = Math.max(ah * 0.38, 170);
    const w_yuan = Math.max(aw * 0.32, 200), h_yuan = Math.max(ah * 0.14, 100);
    const w_jian = Math.max(aw * 0.12, 80),  h_jian = Math.max(ah * 0.32, 180);
    const w_di   = Math.max(aw * 0.40, 240), h_di   = Math.max(ah * 0.14, 100);
    const w_chan = Math.max(aw * 0.26, 180), h_chan = Math.max(ah * 0.18, 120);

    // 犁梢：类似数字“7”的轮廓（纠正方向：顶部朝左，竖干在右侧），并增加倾斜角度
    const stemW = Math.max(w_shao * 0.22, 35);
    const armL  = w_shao * 1.4; // 横臂略加长，角度更明显
    const rel7 = [
      // 顶部横臂从竖干右上出发向左延伸
      { x:  stemW / 2,         y: -h_shao * 0.50 }, // 竖干右上
      { x:  stemW / 2 - armL,  y: -h_shao * 0.50 }, // 左端
      { x:  stemW / 2 - armL * 0.85, y: -h_shao * 0.40 },
      { x:  stemW / 2 - armL * 0.55, y: -h_shao * 0.28 },
      { x: -stemW / 2,         y: -h_shao * 0.12 }, // 连接到竖干左边
      // 竖干到底部，再回到起点
      { x: -stemW / 2,         y:  h_shao * 0.50 },
      { x:  stemW / 2,         y:  h_shao * 0.50 },
      { x:  stemW / 2,         y: -h_shao * 0.50 }
    ];
    // 进一步顺时针旋转，使“7”的内角朝向右下角
    const rel7Rotated = this.rotateRelativePoints(rel7, -20);
    const poly_shao = makePolygon(
      x + width * 0.37,
      y + height * 0.46,
      rel7Rotated
    );

    const poly_yuan = makePolygon(
      x + width * 0.52,
      y + height * 0.52,
      (() => {
        const t = h_yuan * 0.10; // 带状厚度（保持基本恒定）
        const top = [
          { x: -w_yuan * 0.50, y: -h_yuan * 0.05 },
          { x: -w_yuan * 0.20, y: -h_yuan * 0.25 },
          { x:  0,              y: -h_yuan * 0.32 },
          { x:  w_yuan * 0.35,  y: -h_yuan * 0.16 },
          { x:  w_yuan * 0.52,  y:  h_yuan * 0.35 } // 右端再下弯、整体向左移
        ];
        const bottom = [
          { x:  w_yuan * 0.47,  y:  h_yuan * 0.40 + t },
          { x:  w_yuan * 0.30,  y: -h_yuan * 0.10 + t },
          { x: -w_yuan * 0.30,  y: -h_yuan * 0.00 + t },
          { x: -w_yuan * 0.50,  y: -h_yuan * 0.05 + t }
        ];
        return top.concat(bottom);
      })()
    );

    const poly_jian = makePolygon(
      // 前侧偏右的位置，竖直形态
      x + width * 0.53,
      y + height * 0.54,
      [
        { x: -w_jian * 0.30, y: -h_jian * 0.50 },
        { x:  w_jian * 0.30, y: -h_jian * 0.50 },
        { x:  w_jian * 0.40, y:  h_jian * 0.45 },
        { x: -w_jian * 0.40, y:  h_jian * 0.45 }
      ]
    );

    const poly_di = makePolygon(
      x + width * 0.48,
      y + height * 0.69,
      [
        { x: -w_di * 0.38, y: -h_di * 0.80 }, // 左侧上沿抬高一点
        { x:  w_di * 0.28, y: -h_di * 0.32 },
        { x:  w_di * 0.28, y:  h_di * 0.30 },
        { x: -w_di * 0.45, y: -h_di * 0.30 } // 左下沿上抬一点
      ]
    );

    const poly_chan = makePolygon(
      x + width * 0.57,
      y + height * 0.69,
      [
        // L 形：底座横向 + 竖向边
        // 横向底座（从左到右）
        { x: -w_chan * 0.48, y:  h_chan * 0.18 },
        { x:  w_chan * 0.40,  y:  h_chan * 0.18 },
        { x:  w_chan * 0.40,  y:  h_chan * 0.00 },
        // 竖向边（向上）
        { x: -w_chan * 0.10,  y: -h_chan * 0.45 },
        { x: -w_chan * 0.28,  y: -h_chan * 0.45 },
        { x: -w_chan * 0.28,  y:  h_chan * 0.00 },
      ]
    );

    this.snapTargets = [poly_shao, poly_yuan, poly_jian, poly_di, poly_chan];
    this.targetLabels = ['犁梢', '犁辕', '犁箭', '犁底', '犁铲'];
  }

  initPlacementRules() {
    // 简单规则：每个部位只能放在一个指定目标位
    // 后续你可按需调整为多个允许位
    this.partToTargets = {
      li_shao: [0],
      li_e: [1],
      li_ji: [2],
      li_di: [3],
      li_hua: [4]
    };
  }

  render(ctx) {
    // 全屏主底图（等比覆盖）
    if (this.assemblyMainImage && this.assemblyMainImage.width && this.assemblyMainImage.height) {
      const s = Math.max(
        SCREEN_WIDTH / this.assemblyMainImage.width,
        SCREEN_HEIGHT / this.assemblyMainImage.height
      );
      const dw = Math.floor(this.assemblyMainImage.width * s);
      const dh = Math.floor(this.assemblyMainImage.height * s);
      const dx = Math.floor((SCREEN_WIDTH - dw) / 2);
      const dy = Math.floor((SCREEN_HEIGHT - dh) / 2);
      ctx.drawImage(this.assemblyMainImage, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    this.renderHeader(ctx);
    this.renderLeftTabs(ctx);
    this.renderLeftPreview(ctx);
    this.renderAssemblyArea(ctx);
    this.renderBottomButtons(ctx);
    this.renderDragging(ctx);
    // 最上层渲染失败覆盖层（如可见）
    this.renderFailureOverlay(ctx);
    // 最上层渲染成功覆盖层（如可见）
    this.renderSuccessOverlay(ctx);
  }

  renderHeader(ctx) {
    const btn = this.buttons.back;
    // 使用图片绘制返回按钮（等比缩放居中），失败则回退为圆形加箭头
    if (btn && btn.image) {
      if (!btn._img) {
        try { btn._img = wx.createImage(); btn._img.src = btn.image; } catch (e) { btn._img = null; }
      }
      if (btn._img && btn._img.width && btn._img.height) {
        const fit = this.fitImageInBox(btn._img.width, btn._img.height, btn.width, btn.height);
        const drawX = btn.x + Math.floor((btn.width - fit.width) / 2);
        const drawY = btn.y + Math.floor((btn.height - fit.height) / 2);
        ctx.drawImage(btn._img, drawX, drawY, fit.width, fit.height);
      } else {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.icon || '←', btn.x + btn.width / 2, btn.y + btn.height / 2);
      }
    }

    // 标题已隐藏
  }

  renderLeftTabs(ctx) {
    const { x, y, width } = this.leftPanel;

    const tabHeight = Math.floor(56 * (this.tabScale || 1));
    const gap = Math.floor(12 * (this.tabScale || 1));
    this.tabs.forEach((tab, index) => {
      const tabX = x + 20;
      const tabY = y + 16 + index * (tabHeight + gap);
      const isActive = index === this.activeTabIndex;
      const isCompleted = this.completedTabs.has(tab.key);

      // 每个 Tab 使用地板底图等比绘制，去除原填充底色/边框
      const cardW = width - 40;
      const cardH = tabHeight;
      const floorImgCard = (this.tabFloorImage && this.tabFloorImage.width) ? this.tabFloorImage :
                           ((this.tabFloorImageAlt && this.tabFloorImageAlt.width) ? this.tabFloorImageAlt : null);
      if (floorImgCard && floorImgCard.width && floorImgCard.height) {
        const sCard = Math.min(cardW / floorImgCard.width, cardH / floorImgCard.height);
        const dW = Math.floor(floorImgCard.width * sCard);
        const dH = Math.floor(floorImgCard.height * sCard);
        const dX = tabX + Math.floor((cardW - dW) / 2);
        const dY = tabY + Math.floor((cardH - dH) / 2);
        ctx.drawImage(floorImgCard, dX, dY, dW, dH);
      }

      // 文本：拼音在上、中文在下；选中时拼音高亮提示
      const centerX = tabX + (width - 40) / 2;
      const centerY = tabY + tabHeight / 2;
      const scale = (this.tabScale || 1);
      const lineGap = Math.max(10, Math.floor(16 * scale)); // 控制拼音与汉字之间的间距
      const py = this.pinyinByKey[tab.key] || '';
      const pyColor = isActive ? '#FFD54F' : '#FFFFFF';
      // 选中或完成成功后用相同颜色，高亮；普通状态为白色
      const isPlaced = this.completedTabs.has(tab.key);
      const activeColor = '#FFD54F';
      const cnColor = isCompleted ? '#BDBDBD' : (isActive || isPlaced ? activeColor : '#FFFFFF');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 拼音（上）
      if (py) {
        ctx.fillStyle = pyColor;
        ctx.font = `${Math.floor(12 * scale)}px Arial`;
        ctx.fillText(py, centerX, centerY - Math.floor(lineGap / 2));
      }

      // 中文（下）
      ctx.fillStyle = cnColor;
      ctx.font = `${Math.floor(18 * scale)}px Arial`;
      ctx.fillText(tab.name, centerX, centerY + Math.floor(lineGap / 2));

      // 点击区域缓存
      tab.bounds = { x: tabX, y: tabY, width: width - 40, height: tabHeight };


      // 完成勾选标识
      if (isCompleted) {
        // 使用完成标识图片（zuzhuang-wancheng.png），左上角显示
        if (!this.completedIcon) {
          try {
            this.completedIcon = wx.createImage();
            this.completedIcon.src = 'images/zuzhuang-wancheng.png';
          } catch (e) {
            this.completedIcon = null;
          }
        }
        const iconSize = Math.floor(22 * (this.tabScale || 1));
        // 放到右上角，距离卡片边缘 8px；再向左偏移 10px
        const cardW = width - 40;
        const cardH = tabHeight;
        const edgePad = 8;
        const extraLeft = 38;
        if (this.completedIcon && this.completedIcon.width && this.completedIcon.height) {
          // 等比缩放
          const s = Math.min(iconSize / this.completedIcon.width, iconSize / this.completedIcon.height);
          const dw = Math.floor(this.completedIcon.width * s);
          const dh = Math.floor(this.completedIcon.height * s);
          const markX = tabX + cardW - dw - edgePad - extraLeft;
          const markY = tabY + edgePad;
          ctx.drawImage(this.completedIcon, markX, markY, dw, dh);
        } else {
          // fallback 圆形勾
          const markX = tabX + cardW - edgePad - 10 - extraLeft;
          const markY = tabY + edgePad;
          ctx.fillStyle = '#4CAF50';
          ctx.beginPath();
          ctx.arc(markX, markY, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', markX, markY);
        }
      }
    });
  }

  // 在左侧面板底部展示当前 Tab 对应的图片预览
  renderLeftPreview(ctx) {
    const { x, y, width } = this.leftPanel;
    // 预览展示改为在 Tab 右侧显示
    const active = this.tabs[this.activeTabIndex];
    const b = active && active.bounds ? active.bounds : { x: y + 16, y: y + 16, height: 56 };
    const areaW = 160; // 固定展示宽度
    const areaH = 160; // 固定展示高度
    const margin = 12;
    const areaX = x + width + margin; // 面板右侧
    // 纵向与当前 Tab 基本对齐（居中对齐）
    let areaY = (b.y || y + 16) + (b.height ? (b.height - areaH) / 2 : 0);
    // 边界保护
    areaY = Math.max(margin, Math.min(areaY, SCREEN_HEIGHT - areaH - margin));

    // 当前图片
    const current = this.tabs[this.activeTabIndex];
    const img = current && this.tabImages[current.key];
    if (img && img.width && img.height) {
      // 按等比缩放居中绘制
      const maxW = areaW - 16;
      const maxH = areaH - 16;
      let scale = Math.min(maxW / img.width, maxH / img.height);
      const key = this.tabs[this.activeTabIndex]?.key;
      const previewCfg = (key && this.previewConfigByKey[key]) || { scale: 1, offsetX: 0, offsetY: 0 };
      scale *= previewCfg.scale || 1;
      const drawW = Math.max(1, Math.floor(img.width * scale));
      const drawH = Math.max(1, Math.floor(img.height * scale));
      const drawX = areaX + (areaW - drawW) / 2 + (previewCfg.offsetX || 0);
      const drawY = areaY + (areaH - drawH) / 2 + (previewCfg.offsetY || 0);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // 占位提示
      ctx.fillStyle = '#7AD08C';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('预览：部件图片待补充', areaX + areaW / 2, areaY + areaH / 2);
    }
  }

  renderAssemblyArea(ctx) {
    const { x, y, width, height } = this.assemblyArea;

    // 完成前显示灰底，完成后显示最终成品图；若成品图未加载完成，继续显示灰底避免空白
    const bgImg = (this.isAssemblyCompleted && this.finalAssemblyImage && this.finalAssemblyImage.width && this.finalAssemblyImage.height)
      ? this.finalAssemblyImage
      : this.assemblyBgImage;
    if (bgImg && bgImg.width && bgImg.height) {
      const padding = 12;
      const bgW = width - padding * 2;
      const bgH = height - padding * 2;
      const s = Math.min(bgW / bgImg.width, bgH / bgImg.height);
      let dw = Math.floor(bgImg.width * s);
      let dh = Math.floor(bgImg.height * s);
      const innerScale = this.assemblyInnerScale || 1;
      dw = Math.floor(dw * innerScale);
      dh = Math.floor(dh * innerScale);
      const dx = x + Math.floor((width - dw) / 2) + (this.assemblyInnerOffsetX || 0);
      const dy = y + Math.floor((height - dh) / 2) + (this.assemblyInnerOffsetY || 0);
      ctx.drawImage(bgImg, dx, dy, dw, dh);

      // 在灰底(huidi)上方显示提示文案（仅在未完成且尚未放置任何部件时显示）
      if (!this.isAssemblyCompleted && (!this.placedParts || this.placedParts.length === 0)) {
        const promptText = '请将部件拖入这里进行组装';
        ctx.save();
        ctx.fillStyle = 'balck';
        ctx.font = '25px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const promptX = dx + 220;
        const promptY = dy + 196; // 下移到灰底内部靠上位置
        ctx.fillText(promptText, promptX, promptY);
        ctx.restore();
      }
    }

    if (this.showGuides && !this.isAssemblyCompleted) {
      // 绘制吸附目标位（虚线 + 阴影重合效果 + 标签）
      this.snapTargets.forEach((t, idx) => {
        const dash = [10, 6];
        // 阴影层（与虚线重合）
        ctx.save();
        ctx.setLineDash(dash);
        ctx.lineDashOffset = 0;
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.9)';
        ctx.shadowColor = 'rgba(0, 150, 70, 0.5)';
        ctx.shadowBlur = 10;
        this.strokePolygon(ctx, t.points);
        ctx.restore();

        // 前景线（与阴影同样的虚线对齐）
        ctx.setLineDash(dash);
        ctx.lineDashOffset = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00C853';
        this.strokePolygon(ctx, t.points);
        ctx.setLineDash([]);

        // 标签
        ctx.fillStyle = '#FF3B30';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const b = t.bounds;
        ctx.fillText(this.targetLabels[idx] || '', b.x + b.width / 2, b.y - 6);
      });
    }

    // 绘制已放置的部件（层级控制：犁铲最高；犁梢在犁底之上）
    // 层级优先级（数值越大越靠上）：保证犁铲最高、犁梢在犁底之上、且犁辕在犁箭之上
    const priority = { li_di: 0, li_ji: 1, li_e: 2, li_shao: 3, li_hua: 4 };
    if (!this.isAssemblyCompleted) {
      const orderedParts = [...this.placedParts].sort((a, b) => {
        const pa = priority[a.key] ?? 1;
        const pb = priority[b.key] ?? 1;
        return pa - pb; // 数值越大越后绘制（更靠上）
      });
      orderedParts.forEach(part => {
        const img = this.tabImages[part.key];
        if (img && img.width && img.height) {
          ctx.drawImage(img, part.x, part.y, part.width, part.height);
        } else {
          ctx.fillStyle = '#CDEACE';
          ctx.fillRect(part.x, part.y, part.width, part.height);
        }
      });
    }

    if (this.showGuides && !this.isAssemblyCompleted) {
      // 成功高亮效果
      if (this.successEffect && Date.now() < this.successEffect.endTime) {
        const t = this.successEffect;
        const target = this.snapTargets[t.index];
        if (target) {
          const dash = [10, 6];
          ctx.save();
          ctx.setLineDash(dash);
          ctx.shadowColor = 'rgba(0, 200, 83, 0.9)';
          ctx.shadowBlur = 25;
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#00C853';
          this.strokePolygon(ctx, target.points);
          ctx.restore();
        }
      }

      // 失败抖动效果
      if (this.failureEffect && Date.now() < this.failureEffect.endTime) {
        const f = this.failureEffect;
        const progress = (Date.now() - f.startTime) / 600;
        const dx = Math.sin(progress * Math.PI * 6) * 6;
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x + dx, f.y, 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // 提交失败覆盖层渲染
  renderFailureOverlay(ctx) {
    if (!this.failureOverlayVisible) return;

    // 半透明遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.restore();

    // 中心区域尺寸（图片最大容器）
    const maxPanelW = Math.floor(SCREEN_WIDTH * 0.72);
    const maxPanelH = Math.floor(SCREEN_HEIGHT * 0.56);

    // 失败大图
    let imgW = Math.floor(maxPanelW * 0.9);
    let imgH = Math.floor(maxPanelH * 0.65);
    if (this.failureOverlayImage && this.failureOverlayImage.width && this.failureOverlayImage.height) {
      const fit = this.fitImageInBox(this.failureOverlayImage.width, this.failureOverlayImage.height, imgW, imgH);
      imgW = fit.width; imgH = fit.height;
    }
    const imgX = Math.floor((SCREEN_WIDTH - imgW) / 2);
    const imgY = Math.floor((SCREEN_HEIGHT - imgH) / 2) - 30;
    if (this.failureOverlayImage && this.failureOverlayImage.width && this.failureOverlayImage.height) {
      ctx.drawImage(this.failureOverlayImage, imgX, imgY, imgW, imgH);
    } else {
      // fallback 面板
      ctx.fillStyle = '#FFFFFF';
      this.drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 16);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('拼装未通过', imgX + imgW / 2, imgY + imgH / 2);
    }

    // 按钮（位于图片下方居中）
    const btnTargetW = Math.max(180, Math.floor(maxPanelW * 0.36));
    const btnTargetH = 64;
    let btnW = btnTargetW;
    let btnH = btnTargetH;
    if (this.failureButtonImage && this.failureButtonImage.width && this.failureButtonImage.height) {
      const fitBtn = this.fitImageInBox(this.failureButtonImage.width, this.failureButtonImage.height, btnTargetW, btnTargetH);
      btnW = fitBtn.width; btnH = fitBtn.height;
    }
    const spacing = 18;
    const btnX = Math.floor((SCREEN_WIDTH - btnW) / 2);
    const btnY = imgY + imgH + spacing;

    if (this.failureButtonImage && this.failureButtonImage.width && this.failureButtonImage.height) {
      ctx.drawImage(this.failureButtonImage, btnX, btnY, btnW, btnH);
    } else {
      ctx.fillStyle = '#4CAF50';
      this.drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 24);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('重新开始', btnX + btnW / 2, btnY + btnH / 2);
    }

    // 记录按钮可点击区域
    this.failureButtonBounds = { x: btnX, y: btnY, width: btnW, height: btnH };
  }

  // 提交成功覆盖层渲染
  renderSuccessOverlay(ctx) {
    if (!this.successOverlayVisible) return;

    // 半透明遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.restore();

    // 中心区域尺寸（图片最大容器）
    const maxPanelW = Math.floor(SCREEN_WIDTH * 0.72);
    const maxPanelH = Math.floor(SCREEN_HEIGHT * 0.56);

    // 成功大图
    let imgW = Math.floor(maxPanelW * 0.9);
    let imgH = Math.floor(maxPanelH * 0.65);
    if (this.successOverlayImage && this.successOverlayImage.width && this.successOverlayImage.height) {
      const fit = this.fitImageInBox(this.successOverlayImage.width, this.successOverlayImage.height, imgW, imgH);
      imgW = fit.width; imgH = fit.height;
    }
    const imgX = Math.floor((SCREEN_WIDTH - imgW) / 2);
    const imgY = Math.floor((SCREEN_HEIGHT - imgH) / 2) - 30;
    if (this.successOverlayImage && this.successOverlayImage.width && this.successOverlayImage.height) {
      ctx.drawImage(this.successOverlayImage, imgX, imgY, imgW, imgH);
    } else {
      // fallback 面板
      ctx.fillStyle = '#FFFFFF';
      this.drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 16);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('拼装成功', imgX + imgW / 2, imgY + imgH / 2);
    }

    // 按钮（位于图片下方居中）
    const btnTargetW = Math.max(180, Math.floor(maxPanelW * 0.36));
    const btnTargetH = 64;
    let btnW = btnTargetW;
    let btnH = btnTargetH;
    if (this.successButtonImage && this.successButtonImage.width && this.successButtonImage.height) {
      const fitBtn = this.fitImageInBox(this.successButtonImage.width, this.successButtonImage.height, btnTargetW, btnTargetH);
      btnW = fitBtn.width; btnH = fitBtn.height;
    }
    const spacing = 18;
    const btnX = Math.floor((SCREEN_WIDTH - btnW) / 2);
    const btnY = imgY + imgH + spacing;

    if (this.successButtonImage && this.successButtonImage.width && this.successButtonImage.height) {
      ctx.drawImage(this.successButtonImage, btnX, btnY, btnW, btnH);
    } else {
      ctx.fillStyle = '#4CAF50';
      this.drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 24);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('确认', btnX + btnW / 2, btnY + btnH / 2);
    }

    // 记录按钮可点击区域
    this.successButtonBounds = { x: btnX, y: btnY, width: btnW, height: btnH };
  }

  renderBottomButtons(ctx) {
    const { restart, submit } = this.buttons;
    // 使用图片按钮
    const drawBtnImage = (btn) => {
      if (!btn._img && btn.image) {
        try { btn._img = wx.createImage(); btn._img.src = btn.image; } catch (e) { btn._img = null; }
      }
      if (btn._img && btn._img.width && btn._img.height) {
        // 按按钮矩形等比缩放并居中绘制，避免图片被拉伸变形
        const fit = this.fitImageInBox(
          btn._img.width,
          btn._img.height,
          btn.width,
          btn.height
        );
        const drawX = btn.x + Math.floor((btn.width - fit.width) / 2);
        const drawY = btn.y + Math.floor((btn.height - fit.height) / 2);
        ctx.drawImage(btn._img, drawX, drawY, fit.width, fit.height);
      } else {
        // fallback 绘制矩形
        ctx.fillStyle = '#CCCCCC';
        this.drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, 24);
        ctx.fill();
      }
    };

    drawBtnImage(restart);
    drawBtnImage(submit);
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  handleTouch(event) {
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 若成功覆盖层可见，仅处理成功覆盖层按钮点击
    if (this.successOverlayVisible) {
      const b = this.successButtonBounds;
      if (b && this.pointInRect(x, y, b.x, b.y, b.width, b.height)) {
        // 成功确认：跳转页面（如已配置），否则仅关闭覆盖层
        this.successOverlayVisible = false;
        if (this.successNextPage && GameGlobal.pageManager && GameGlobal.pageManager.switchToPage) {
          try { GameGlobal.pageManager.switchToPage(this.successNextPage); } catch (e) {}
        } else {
          try { const { showToast: showToastUtil } = require('../utils/toast'); showToastUtil('已确认'); } catch (e) {}
        }
      }
      return;
    }

    // 若失败覆盖层可见，仅处理覆盖层按钮点击
    if (this.failureOverlayVisible) {
      const b = this.failureButtonBounds;
      if (b && this.pointInRect(x, y, b.x, b.y, b.width, b.height)) {
        // 覆盖层按钮：重新开始
        this.activeTabIndex = 0;
        this.placedParts = [];
        this.dragging = null;
        this.successEffect = null;
        this.failureEffect = null;
        this.isAssemblyCompleted = false;
        this.finalAssemblyImage = null;
        if (this.completedTabs) this.completedTabs.clear();
        this.failureOverlayVisible = false;
        try {
          const { showToast: showToastUtil } = require('../utils/toast');
          showToastUtil('已重置所有步骤');
        } catch (e) {}
      }
      return;
    }

    // 返回按钮
    const back = this.buttons.back;
    if (this.pointInCircle(x, y, back.x + back.width / 2, back.y + back.height / 2, back.width / 2)) {
      GameGlobal.pageManager.switchToPage('home');
      return;
    }

    // 左侧 Tab 点击
    for (let i = 0; i < this.tabs.length; i++) {
      const b = this.tabs[i].bounds;
      // 已完成的部位不可再次选择
      if (b && this.pointInRect(x, y, b.x, b.y, b.width, b.height) && !this.completedTabs.has(this.tabs[i].key)) {
        this.activeTabIndex = i;
        // 开始拖拽：生成一个临时部件，大小参考目标位尺寸，且保持原图比例
        const partKey = this.tabs[i].key;
        const allowed = this.partToTargets[partKey] || [];
        const targetIdx = allowed.length ? allowed[0] : -1;
        const refTarget = this.snapTargets[targetIdx];
        let dw = (refTarget && refTarget.bounds) ? refTarget.bounds.width : 120;
        let dh = (refTarget && refTarget.bounds) ? refTarget.bounds.height : 120;
        const img = this.tabImages[partKey];
        if (img && img.width && img.height && refTarget && refTarget.bounds) {
          const fit = this.fitImageInBox(img.width, img.height, refTarget.bounds.width, refTarget.bounds.height);
          dw = fit.width;
          dh = fit.height;
        }
        this.dragging = {
          key: partKey,
          x: x - dw / 2,
          y: y - dh / 2,
          width: dw,
          height: dh
        };
        return;
      }
    }

    // 底部按钮
    const { restart, submit } = this.buttons;
    if (this.pointInRect(x, y, restart.x, restart.y, restart.width, restart.height)) {
      // 重置：清空已放置内容与拖拽状态、重置选中Tab
      this.activeTabIndex = 0;
      this.placedParts = [];
      this.dragging = null;
      this.successEffect = null;
      this.failureEffect = null;
      this.isAssemblyCompleted = false;
      this.finalAssemblyImage = null;
      this.failureOverlayVisible = false;
      if (this.completedTabs) this.completedTabs.clear();
      try {
        const { showToast: showToastUtil } = require('../utils/toast');
        showToastUtil('已重置所有步骤');
      } catch (e) {}
      return;
    }
    if (this.pointInRect(x, y, submit.x, submit.y, submit.width, submit.height)) {
      // 仅做提示（走内置 Toast 渲染）
      const allCompleted = this.tabs.every(t => this.completedTabs.has(t.key));
      if (allCompleted) {
        // 加载最终成品图并进入完成态
        if (!this.finalAssemblyImage) {
          try {
            this.finalAssemblyImage = wx.createImage();
            this.finalAssemblyImage.src = 'images/zuzhuang-quyuanli.png';
          } catch (e) {
            this.finalAssemblyImage = null;
          }
        }
        this.isAssemblyCompleted = true;
        this.showGuides = false;
        this.successEffect = null;
        this.failureEffect = null;
        this.dragging = null;
        this.failureOverlayVisible = false;
        // 显示成功覆盖层
        this.loadSuccessAssets();
        this.successOverlayVisible = true;
        try {
          const { showSuccessToast } = require('../utils/toast');
          showSuccessToast('拼装完成');
        } catch (e) {}
      } else {
        // 未全部正确：显示失败覆盖层（加载素材）
        this.loadFailureAssets();
        this.failureOverlayVisible = true;
        // 可选：仍弹出错误提示
        try {
          const { showErrorToast } = require('../utils/toast');
          showErrorToast('还有部位未放置正确');
        } catch (e) {}
      }
    }
  }

  handleTouchMove(event) {
    if (!this.dragging) return;
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    this.dragging.x = x - this.dragging.width / 2;
    this.dragging.y = y - this.dragging.height / 2;
  }

  handleTouchEnd() {
    if (!this.dragging) return;
    const centerX = this.dragging.x + this.dragging.width / 2;
    const centerY = this.dragging.y + this.dragging.height / 2;
    // 找到鼠标释放位置落在哪个多边形内部（使用其外接矩形做一次快速过滤以提升性能）
    const index = this.snapTargets.findIndex(t => {
      const b = t.bounds;
      const m = this.matchBoundsMarginPx || 0;
      if (!this.pointInRect(centerX, centerY, b.x - m, b.y - m, b.width + 2 * m, b.height + 2 * m)) return false;
      return this.isPointNearPolygon(centerX, centerY, t.points, this.matchTolerancePx || 18);
    });
    if (index >= 0) {
      const allowed = this.partToTargets[this.dragging.key] || [];
      const isAllowed = allowed.includes(index);
      if (isAllowed) {
        const target = this.snapTargets[index];
        // 吸附并记录
        const img = this.tabImages[this.dragging.key];
        let drawW = target.bounds.width;
        let drawH = target.bounds.height;
        if (img && img.width && img.height) {
          const fit = this.fitImageInBox(img.width, img.height, target.bounds.width, target.bounds.height);
          drawW = fit.width;
          drawH = fit.height;
        }
        // 放大已放置图片尺寸（匹配成功后，支持按部件分别设置）
        const perKeyScale = (this.placementScaleByKey && this.placementScaleByKey[this.dragging.key]) || 1;
        const globalScale = this.globalPlacementScale || 1;
        const finalScale = globalScale * perKeyScale;
        drawW *= finalScale;
        drawH *= finalScale;
        // 锚点对齐（目标位锚点 -> 图片锚点）
        const targetAnchor = this.targetAnchorByIndex[index] || { x: 0.5, y: 0.5 };
        const imageAnchor = this.imageAnchorByKey[this.dragging.key] || { x: 0.5, y: 0.5 };
        const targetAx = target.bounds.x + target.bounds.width * targetAnchor.x;
        const targetAy = target.bounds.y + target.bounds.height * targetAnchor.y;
        const imgOffsetX = drawW * imageAnchor.x;
        const imgOffsetY = drawH * imageAnchor.y;

        const placed = {
          key: this.dragging.key,
          x: targetAx - imgOffsetX,
          y: targetAy - imgOffsetY,
          width: drawW,
          height: drawH
        };
        // 应用每个部位的微调偏移（像素）
        const offset = this.placementOffsetByKey[this.dragging.key] || { x: 0, y: 0 };
        placed.x += offset.x;
        placed.y += offset.y;
        this.placedParts = this.placedParts.filter(p => p.key !== placed.key);
        this.placedParts.push(placed);

        // 标记当前部位完成并禁用对应 Tab
        const completedKey = this.tabs[this.activeTabIndex]?.key;
        if (completedKey) this.completedTabs.add(completedKey);
        this.successEffect = { index, endTime: Date.now() + 600 };
        this.failureEffect = null;
        try {
          const { showSuccessToast } = require('../utils/toast');
          showSuccessToast('放置成功');
        } catch (e) {}
      } else {
        this.failureEffect = { x: centerX, y: centerY, startTime: Date.now(), endTime: Date.now() + 600 };
        this.successEffect = null;
        if (GameGlobal.wechatAPI && GameGlobal.wechatAPI.vibrate) {
          GameGlobal.wechatAPI.vibrate('long');
        }
        try {
          const { showErrorToast } = require('../utils/toast');
          showErrorToast('放置位置不正确');
        } catch (e) {}
      }
    }
    this.dragging = null;
  }

  renderDragging(ctx) {
    if (!this.dragging) return;
    const d = this.dragging;
    const img = this.tabImages[d.key];
    ctx.globalAlpha = 0.85;
    if (img && img.width && img.height) {
      ctx.drawImage(img, d.x, d.y, d.width, d.height);
    } else {
      ctx.fillStyle = '#A2E2B5';
      ctx.fillRect(d.x, d.y, d.width, d.height);
    }
    ctx.globalAlpha = 1;
  }

  pointInRect(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }

  pointInCircle(px, py, cx, cy, r) {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= r * r;
  }

  update() {
    const now = Date.now();
    if (this.successEffect && now >= this.successEffect.endTime) this.successEffect = null;
    if (this.failureEffect && now >= this.failureEffect.endTime) this.failureEffect = null;
  }
}


