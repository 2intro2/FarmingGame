import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import BasePage from './BasePage';

/**
 * 农具拼接页面
 */
export default class ToolAssemblyPage extends BasePage {
  tools = [];
  currentToolIndex = 0;
  toolImage = null;
  buttons = {};

  constructor() {
    super();
    this.initTools();
    this.initButtons();
    this.loadResources();
  }

  /**
   * 初始化农具数据
   */
  initTools() {
    this.tools = [
      {
        id: 'hoe',
        name: '锄头',
        image: 'images/tool_hoe.png',
        unlocked: true,
        completed: false,
        progress: 0,
        steps: [
          { id: 'step1', name: '选择锄头头', status: 'in_progress' },
          { id: 'step2', name: '选择木柄', status: 'locked' },
          { id: 'step3', name: '组装完成', status: 'locked' }
        ]
      },
      {
        id: 'shovel',
        name: '铁锹',
        image: 'images/tool_shovel.png',
        unlocked: true,
        completed: false,
        progress: 0,
        steps: [
          { id: 'step1', name: '选择铁锹头', status: 'in_progress' },
          { id: 'step2', name: '选择手柄', status: 'locked' },
          { id: 'step3', name: '组装完成', status: 'locked' }
        ]
      },
      {
        id: 'sickle',
        name: '镰刀',
        image: 'images/tool_sickle.png',
        unlocked: false,
        completed: false,
        progress: 0,
        steps: [
          { id: 'step1', name: '选择镰刀头', status: 'locked' },
          { id: 'step2', name: '选择刀柄', status: 'locked' },
          { id: 'step3', name: '组装完成', status: 'locked' }
        ]
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
        height: 40,
        text: '返回'
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
      },
      step1: {
        x: SCREEN_WIDTH * 0.1,
        y: SCREEN_HEIGHT * 0.8,
        width: SCREEN_WIDTH * 0.2,
        height: 50,
        text: '第一步'
      },
      step2: {
        x: SCREEN_WIDTH * 0.35,
        y: SCREEN_HEIGHT * 0.8,
        width: SCREEN_WIDTH * 0.2,
        height: 50,
        text: '第二步'
      },
      step3: {
        x: SCREEN_WIDTH * 0.6,
        y: SCREEN_HEIGHT * 0.8,
        width: SCREEN_WIDTH * 0.2,
        height: 50,
        text: '第三步'
      }
    };
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
   * 渲染页面内容
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderContent(ctx) {
    // 绘制背景
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 渲染返回按钮
    this.renderBackButton(ctx);

    // 渲染农具信息
    this.renderToolInfo(ctx);

    // 渲染农具图片
    this.renderToolImage(ctx);

    // 渲染导航按钮
    this.renderNavigationButtons(ctx);

    // 渲染步骤按钮
    this.renderStepButtons(ctx);
  }

  /**
   * 渲染返回按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderBackButton(ctx) {
    const btn = this.buttons.back;
    
    // 绘制按钮背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    // 绘制按钮文字
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
  }

  /**
   * 渲染农具信息
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderToolInfo(ctx) {
    const currentTool = this.tools[this.currentToolIndex];
    
    // 绘制农具名称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(currentTool.name, SCREEN_WIDTH / 2, 100);

    // 绘制农具描述
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 文字换行处理
    const maxWidth = SCREEN_WIDTH * 0.6;
    const lineHeight = 20;
    const words = currentTool.description.split('');
    let line = '';
    let y = 140;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, SCREEN_WIDTH * 0.2, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      ctx.fillText(line, SCREEN_WIDTH * 0.2, y);
    }
  }

  /**
   * 渲染农具图片
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderToolImage(ctx) {
    const currentTool = this.tools[this.currentToolIndex];
    const imageX = SCREEN_WIDTH * 0.2;
    const imageY = 200;
    const imageWidth = SCREEN_WIDTH * 0.6;
    const imageHeight = SCREEN_HEIGHT * 0.4;

    if (this.toolImage && this.toolImage.complete) {
      ctx.drawImage(this.toolImage, imageX, imageY, imageWidth, imageHeight);
    } else {
      // 如果图片未加载，绘制占位符
      ctx.fillStyle = '#DDDDDD';
      ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
      
      ctx.fillStyle = '#999999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('农具图片', imageX + imageWidth / 2, imageY + imageHeight / 2);
    }
  }

  /**
   * 渲染导航按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderNavigationButtons(ctx) {
    ['prev', 'next'].forEach(key => {
      const btn = this.buttons[key];
      
      // 绘制按钮背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      // 绘制按钮文字
      ctx.fillStyle = '#333333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
    });
  }

  /**
   * 渲染步骤按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderStepButtons(ctx) {
    const currentTool = this.tools[this.currentToolIndex];
    
    ['step1', 'step2', 'step3'].forEach((key, index) => {
      const btn = this.buttons[key];
      const step = currentTool.steps[index];
      
      // 根据步骤状态设置颜色
      let bgColor = '#FFFFFF';
      let textColor = '#333333';
      
      switch (step.status) {
        case 'in_progress':
          bgColor = '#FFD700';
          textColor = '#333333';
          break;
        case 'completed':
          bgColor = '#90EE90';
          textColor = '#333333';
          break;
        case 'locked':
          bgColor = '#CCCCCC';
          textColor = '#999999';
          break;
      }
      
      // 绘制按钮背景
      ctx.fillStyle = bgColor;
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      // 绘制按钮文字
      ctx.fillStyle = textColor;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(step.name, btn.x + btn.width / 2, btn.y + btn.height / 2);
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
        this.handleBackButton();
        break;
      case 'prev':
        this.switchTool('prev');
        break;
      case 'next':
        this.switchTool('next');
        break;
      case 'step1':
      case 'step2':
      case 'step3':
        this.handleStepClick(buttonKey);
        break;
    }
  }

  /**
   * 处理返回按钮点击
   */
  handleBackButton() {
    if (GameGlobal.pageManager && GameGlobal.pageManager.goBack()) {
      this.showToast('返回上一页');
    } else {
      // 如果没有历史，直接返回主页
      GameGlobal.pageManager.switchToPage('home', { addToHistory: false });
      this.showToast('返回主页');
    }
  }

  /**
   * 切换农具
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
   * 处理步骤点击
   * @param {string} stepKey - 步骤键名
   */
  handleStepClick(stepKey) {
    const stepIndex = parseInt(stepKey.replace('step', '')) - 1;
    const currentTool = this.tools[this.currentToolIndex];
    const step = currentTool.steps[stepIndex];
    
    switch (step.status) {
      case 'in_progress':
        this.showStepDialog(stepIndex);
        break;
      case 'completed':
        this.showStepResult(stepIndex);
        break;
      case 'locked':
        this.showToast('该步骤尚未解锁');
        break;
    }
  }

  /**
   * 显示步骤对话框
   * @param {number} stepIndex - 步骤索引
   */
  showStepDialog(stepIndex) {
    const currentTool = this.tools[this.currentToolIndex];
    const step = currentTool.steps[stepIndex];
    
    // 显示步骤对话框
    GameGlobal.wechatAPI.showModal({
      title: step.name,
      content: step.description,
      confirmText: '开始操作',
      cancelText: '取消'
    }).then(confirmed => {
      if (confirmed) {
        // 模拟步骤完成
        setTimeout(() => {
          step.status = 'completed';
          this.showToast('步骤完成！');
          
          // 解锁下一个步骤
          if (stepIndex < currentTool.steps.length - 1) {
            currentTool.steps[stepIndex + 1].status = 'in_progress';
          }
        }, 1000);
      }
    });
  }

  /**
   * 显示步骤结果
   * @param {number} stepIndex - 步骤索引
   */
  showStepResult(stepIndex) {
    console.log(`显示步骤 ${stepIndex + 1} 的结果`);
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    // 调用Toast组件显示提示
    import('../components/Toast').then(module => {
      const Toast = module.default;
      Toast.show(message);
    }).catch(error => {
      console.error('Toast加载失败:', error);
      // 降级到微信原生Toast
      if (GameGlobal.wechatAPI) {
        GameGlobal.wechatAPI.showToast(message);
      }
    });
  }

  /**
   * 更新页面
   */
  update() {
    // 农具拼接页面不需要特殊更新逻辑
  }
}
