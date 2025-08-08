import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';

/**
 * 农具拼接页面
 */
export default class ToolAssemblyPage {
  tools = [];
  currentToolIndex = 0;
  toolImage = null;
  buttons = {};
  progressSteps = [];

  constructor() {
    this.initTools();
    this.initButtons();
    this.initProgressSteps();
    this.loadResources();
  }

  /**
   * 初始化农具数据
   */
  initTools() {
    this.tools = [
      {
        name: '石磨',
        subtitle: '粮食加工重要工具',
        description: '石磨最早出现于战国时期，是古代粮食加工的重要工具。粮食从进料孔落入磨盘间，通过旋转摩擦被碾碎，粉末从边缘流出。',
        difficulty: 2,
        reward: 20,
        image: 'images/tool1.png',
        status: 'active'
      },
      {
        name: '水车',
        subtitle: '水利灌溉工具',
        description: '水车利用水流动力驱动，将水从低处提升到高处，用于农田灌溉。',
        difficulty: 1,
        reward: 10,
        image: 'images/tool2.png',
        status: 'locked'
      },
      {
        name: '犁',
        subtitle: '耕地翻土工具',
        description: '犁是古代重要的耕地工具，用于翻土和松土，为播种做准备。',
        difficulty: 3,
        reward: 30,
        image: 'images/tool3.png',
        status: 'locked'
      },
      {
        name: '风车',
        subtitle: '风力利用工具',
        description: '风车利用风力驱动，用于磨面、抽水等农业生产活动。',
        difficulty: 2,
        reward: 20,
        image: 'images/tool4.png',
        status: 'locked'
      }
    ];
  }

  /**
   * 初始化按钮
   */
  initButtons() {
    this.buttons = {
      back: {
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        icon: '←'
      },
      prev: {
        x: 20,
        y: SCREEN_HEIGHT / 2 - 30,
        width: 50,
        height: 60,
        text: '◀'
      },
      next: {
        x: SCREEN_WIDTH - 70,
        y: SCREEN_HEIGHT / 2 - 30,
        width: 50,
        height: 60,
        text: '▶'
      }
    };
  }

  /**
   * 初始化进度步骤
   */
  initProgressSteps() {
    this.progressSteps = [
      {
        name: '第一步',
        title: '观看视频',
        status: 'completed',
        description: '(已完成)'
      },
      {
        name: '第二步',
        title: '基础认知',
        status: 'in_progress',
        description: '(进行中)'
      },
      {
        name: '第三步',
        title: '立体组装',
        status: 'locked',
        description: '(未解锁)'
      }
    ];
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载当前农具图片
    this.loadCurrentToolImage();
  }

  /**
   * 加载当前农具图片
   */
  loadCurrentToolImage() {
    const currentTool = this.tools[this.currentToolIndex];
    if (currentTool && currentTool.image) {
      this.toolImage = wx.createImage();
      this.toolImage.src = currentTool.image;
    }
  }

  /**
   * 渲染农具拼接页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 绘制顶部导航
    this.renderHeader(ctx);

    // 绘制工具卡片
    this.renderToolCards(ctx);

    // 绘制底部进度
    this.renderProgressSteps(ctx);
  }

  /**
   * 渲染顶部导航
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderHeader(ctx) {
    // 绘制返回按钮
    const btn = this.buttons.back;
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制返回箭头
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.icon, btn.x + btn.width / 2, btn.y + btn.height / 2);

    // 绘制标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('农具拼装', btn.x + btn.width + 20, btn.y + btn.height / 2);
  }

  /**
   * 渲染工具卡片
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderToolCards(ctx) {
    const cardWidth = SCREEN_WIDTH * 0.8;
    const cardHeight = SCREEN_HEIGHT * 0.6;
    const cardX = (SCREEN_WIDTH - cardWidth) / 2;
    const cardY = 120;

    // 绘制当前工具卡片
    const currentTool = this.tools[this.currentToolIndex];
    
    // 绘制卡片背景
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

    // 绘制难度
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`难度: ${'⭐'.repeat(currentTool.difficulty)}`, cardX + cardWidth - 20, cardY + 20);

    // 绘制工具图片（占位符）
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(cardX + 20, cardY + 60, 120, 120);

    // 绘制工具名称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(currentTool.name, cardX + 160, cardY + 60);

    // 绘制副标题
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.fillText(currentTool.subtitle, cardX + 160, cardY + 90);

    // 绘制描述
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.fillText(currentTool.description, cardX + 160, cardY + 120);

    // 绘制奖励
    ctx.fillStyle = '#FF6B6B';
    ctx.font = '16px Arial';
    ctx.fillText(`奖励: 🍬 ${currentTool.reward}`, cardX + 20, cardY + cardHeight - 40);
  }

  /**
   * 渲染底部进度
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderProgressSteps(ctx) {
    const stepWidth = SCREEN_WIDTH * 0.25;
    const stepHeight = 80;
    const stepY = SCREEN_HEIGHT - stepHeight - 20;

    // 绘制进度背景
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(20, stepY, SCREEN_WIDTH - 40, stepHeight);

    this.progressSteps.forEach((step, index) => {
      const stepX = 20 + index * stepWidth;
      
      // 绘制步骤背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(stepX + 10, stepY + 10, stepWidth - 20, stepHeight - 20);

      // 绘制步骤标题
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(step.title, stepX + stepWidth / 2, stepY + 20);

      // 绘制步骤状态
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(step.description, stepX + stepWidth / 2, stepY + 45);

      // 绘制状态图标
      if (step.status === 'completed') {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(stepX + stepWidth / 2, stepY + 60, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText('已完成', stepX + stepWidth / 2, stepY + 60);
      } else if (step.status === 'locked') {
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.fillText('🔒', stepX + stepWidth / 2, stepY + 60);
      }
    });
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 检查按钮点击
    Object.entries(this.buttons).forEach(([key, button]) => {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        this.handleButtonClick(key);
      }
    });
  }

  /**
   * 处理按钮点击
   * @param {string} buttonKey - 按钮键名
   */
  handleButtonClick(buttonKey) {
    switch (buttonKey) {
      case 'back':
        GameGlobal.pageManager.switchToPage('home');
        break;
      case 'prev':
        this.switchTool('prev');
        break;
      case 'next':
        this.switchTool('next');
        break;
    }
  }

  /**
   * 切换工具
   * @param {string} direction - 切换方向
   */
  switchTool(direction) {
    if (direction === 'prev') {
      this.currentToolIndex = this.currentToolIndex === 0 ? 
        this.tools.length - 1 : this.currentToolIndex - 1;
    } else if (direction === 'next') {
      this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
    }
    
    // 重新加载农具图片
    this.loadCurrentToolImage();
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    const { showToast: showToastUtil } = require('../utils/toast');
    showToastUtil(message);
  }

  /**
   * 显示页面
   */
  show() {
    // 农具拼接页面显示逻辑
  }

  /**
   * 隐藏页面
   */
  hide() {
    // 农具拼接页面隐藏逻辑
  }

  /**
   * 更新页面
   */
  update() {
    // 农具拼接页面不需要特殊更新逻辑
  }
}
