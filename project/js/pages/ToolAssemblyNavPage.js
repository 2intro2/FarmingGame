import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import BasePage from './BasePage';

/**
 * 农具拼装导航页
 * 展示所有可用的农具列表，采用卡片式设计
 */
export default class ToolAssemblyNavPage extends BasePage {
  tools = [];
  selectedToolIndex = 0;
  scrollOffset = 0;
  isDragging = false;
  lastTouchX = 0;

  constructor() {
    super();
    this.initTools();
    this.initLayout();
    this.loadResources();
  }

  /**
   * 初始化农具数据
   */
  initTools() {
    this.tools = [
      {
        id: 'quyuan_plow',
        name: '曲辕犁',
        subtitle: '古代农具革新代表',
        description: '曲辕犁是中国古代农业技术的巅峰之作，体现了"天人合一"的哲学思想。牛或人力拉动犁辕，犁铧切入土壤并翻动，犁箭调节深度以适应不同土质。',
        difficulty: 2, // 星级
        reward: 10,
        image: 'images/tool_hoe.png',
        unlocked: true,
        completed: false,
        progress: 0,
        cardColor: '#E3F2FD' // 浅蓝色
      },
      {
        id: 'ancient_mill',
        name: '古代粮食',
        subtitle: '孔落入磨',
        description: '粉末从边',
        difficulty: 2,
        reward: 20,
        image: 'images/tool_shovel.png',
        unlocked: true,
        completed: false,
        progress: 0,
        cardColor: '#E8F5E8' // 浅绿色
      },
      {
        id: 'ancient_weight',
        name: '古代重',
        subtitle: '片带动',
        description: '起,升',
        difficulty: 1,
        reward: 10,
        image: 'images/tool_sickle.png',
        unlocked: true,
        completed: false,
        progress: 0,
        cardColor: '#FFF8E1' // 浅黄色
      },
      {
        id: 'hoe',
        name: '锄头',
        subtitle: '基础农具',
        description: '用于松土和除草的重要农具，是农业生产的基础工具。',
        difficulty: 1,
        reward: 5,
        image: 'images/tool_hoe.png',
        unlocked: true,
        completed: false,
        progress: 0,
        cardColor: '#F3E5F5' // 浅紫色
      },
      {
        id: 'shovel',
        name: '铁锹',
        subtitle: '挖掘工具',
        description: '用于挖土和翻地的农具，适合各种土壤类型。',
        difficulty: 2,
        reward: 8,
        image: 'images/tool_shovel.png',
        unlocked: true,
        completed: false,
        progress: 0,
        cardColor: '#E0F2F1' // 浅青色
      }
    ];
  }

  /**
   * 初始化布局
   */
  initLayout() {
    // 卡片尺寸
    this.cardWidth = SCREEN_WIDTH * 0.7;
    this.cardHeight = SCREEN_HEIGHT * 0.4;
    this.cardGap = 20;
    
    // 卡片位置计算
    this.cardsStartX = (SCREEN_WIDTH - this.cardWidth) / 2;
    this.cardsY = SCREEN_HEIGHT * 0.25;
    
    // 进度步骤
    this.steps = [
      { id: 'step1', name: '第一步', subtitle: '观看视频', status: 'completed' },
      { id: 'step2', name: '第二步', subtitle: '基础认知', status: 'in_progress' },
      { id: 'step3', name: '第三步', subtitle: '立体组装', status: 'locked' }
    ];
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载农具图片
    this.tools.forEach(tool => {
      if (tool.image) {
        try {
          // 使用微信小游戏的图片创建API
          const img = wx.createImage();
          img.onload = () => {
            tool.imageLoaded = true;
            tool.imageElement = img;
          };
          img.onerror = (error) => {
            console.warn(`图片加载失败: ${tool.image}，将使用占位符`, error);
            // 图片加载失败时使用占位符
            tool.imageLoaded = false;
            tool.usePlaceholder = true;
          };
          img.src = tool.image;
        } catch (error) {
          console.error(`创建图片对象失败: ${tool.image}`, error);
          tool.imageLoaded = false;
          tool.usePlaceholder = true;
        }
      }
    });
  }

  /**
   * 渲染页面内容
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderContent(ctx) {
    // 绘制背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 渲染顶部导航栏
    this.renderTopNav(ctx);

    // 渲染农具卡片
    this.renderToolCards(ctx);

    // 渲染底部进度条
    this.renderProgressSteps(ctx);
  }

  /**
   * 渲染顶部导航栏
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderTopNav(ctx) {
    // 返回按钮
    const backBtnSize = 40;
    const backBtnX = 20;
    const backBtnY = 20;
    
    // 绘制圆形返回按钮
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(backBtnX + backBtnSize/2, backBtnY + backBtnSize/2, backBtnSize/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制返回箭头
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←', backBtnX + backBtnSize/2, backBtnY + backBtnSize/2);

    // 绘制标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('农具拼装', backBtnX + backBtnSize + 20, backBtnY + backBtnSize/2 + 8);
  }

  /**
   * 渲染农具卡片
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderToolCards(ctx) {
    this.tools.forEach((tool, index) => {
      const cardX = this.cardsStartX + index * (this.cardWidth + this.cardGap) - this.scrollOffset;
      const cardY = this.cardsY;
      
      this.renderToolCard(ctx, tool, cardX, cardY);
    });
  }

  /**
   * 渲染单个农具卡片
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} tool - 农具对象
   * @param {number} x - 卡片X坐标
   * @param {number} y - 卡片Y坐标
   */
  renderToolCard(ctx, tool, x, y) {
    // 绘制卡片背景
    ctx.fillStyle = tool.cardColor;
    ctx.beginPath();
    ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 15);
    ctx.fill();
    
    // 绘制卡片边框
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制难度星级
    this.renderDifficultyStars(ctx, tool, x + 15, y + 15);

    // 绘制农具图片
    if (tool.imageElement && tool.imageLoaded) {
      const imgSize = this.cardWidth * 0.4;
      const imgX = x + (this.cardWidth - imgSize) / 2;
      const imgY = y + 50;
      
      ctx.globalAlpha = tool.unlocked ? 1 : 0.5;
      ctx.drawImage(tool.imageElement, imgX, imgY, imgSize, imgSize);
      ctx.globalAlpha = 1;
    } else if (tool.usePlaceholder) {
      // 绘制占位符
      const placeholderSize = this.cardWidth * 0.3;
      const placeholderX = x + (this.cardWidth - placeholderSize) / 2;
      const placeholderY = y + 50;
      
      // 绘制占位符背景
      ctx.fillStyle = '#F0F0F0';
      ctx.beginPath();
      ctx.roundRect(placeholderX, placeholderY, placeholderSize, placeholderSize, 8);
      ctx.fill();
      
      // 绘制占位符图标
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛠️', placeholderX + placeholderSize / 2, placeholderY + placeholderSize / 2);
      
      // 绘制占位符文字
      ctx.fillStyle = '#999999';
      ctx.font = '12px Arial';
      ctx.fillText('农具图片', placeholderX + placeholderSize / 2, placeholderY + placeholderSize + 20);
    }

    // 绘制农具名称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tool.name, x + this.cardWidth / 2, y + 120);

    // 绘制副标题
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText(tool.subtitle, x + this.cardWidth / 2, y + 145);

    // 绘制描述
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    this.drawWrappedText(ctx, tool.description, x + 15, y + 170, this.cardWidth - 30, 16);

    // 绘制奖励
    this.renderReward(ctx, tool, x + 15, y + this.cardHeight - 30);

    // 绘制开始拼装按钮
    this.renderStartButton(ctx, tool, x, y);
  }

  /**
   * 渲染开始拼装按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} tool - 农具对象
   * @param {number} x - 卡片X坐标
   * @param {number} y - 卡片Y坐标
   */
  renderStartButton(ctx, tool, x, y) {
    const buttonWidth = 80;
    const buttonHeight = 30;
    const buttonX = x + this.cardWidth - buttonWidth - 15;
    const buttonY = y + this.cardHeight - buttonHeight - 15;

    // 保存按钮位置信息
    tool.startButton = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };

    if (tool.unlocked) {
      // 绘制按钮背景
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
      ctx.fill();

      // 绘制按钮文字
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('开始拼装', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    } else {
      // 绘制锁定状态
      ctx.fillStyle = '#CCCCCC';
      ctx.beginPath();
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
      ctx.fill();

      ctx.fillStyle = '#999999';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('未解锁', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    }
  }

  /**
   * 渲染难度星级
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} tool - 农具对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderDifficultyStars(ctx, tool, x, y) {
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    let stars = '';
    for (let i = 0; i < tool.difficulty; i++) {
      stars += '★';
    }
    for (let i = tool.difficulty; i < 3; i++) {
      stars += '☆';
    }
    
    ctx.fillText(`难度: ${stars}`, x, y);
  }

  /**
   * 渲染奖励
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} tool - 农具对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderReward(ctx, tool, x, y) {
    // 绘制奖励图标
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制奖励文字
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`奖励: ${tool.reward}`, x + 20, y + 12);
  }

  /**
   * 渲染底部进度步骤
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderProgressSteps(ctx) {
    const stepsContainerY = SCREEN_HEIGHT * 0.75;
    const stepWidth = (SCREEN_WIDTH - 60) / 3;
    const stepHeight = 80;
    
    // 绘制容器边框
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(30, stepsContainerY, SCREEN_WIDTH - 60, stepHeight);
    ctx.setLineDash([]);

    this.steps.forEach((step, index) => {
      const stepX = 30 + index * stepWidth;
      const stepY = stepsContainerY;
      
      this.renderProgressStep(ctx, step, stepX, stepY, stepWidth, stepHeight);
    });
  }

  /**
   * 渲染单个进度步骤
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} step - 步骤对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  renderProgressStep(ctx, step, x, y, width, height) {
    // 根据状态设置颜色
    let bgColor = '#FFFFFF';
    let textColor = '#333333';
    let statusText = '';
    
    switch (step.status) {
      case 'completed':
        bgColor = '#E8F5E8';
        textColor = '#27AE60';
        statusText = '(已完成)';
        break;
      case 'in_progress':
        bgColor = '#FFF3CD';
        textColor = '#F39C12';
        statusText = '(进行中)';
        break;
      case 'locked':
        bgColor = '#F8F9FA';
        textColor = '#6C757D';
        statusText = '(未解锁)';
        break;
    }

    // 绘制步骤背景
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, width - 10, height - 10, 8);
    ctx.fill();

    // 绘制步骤名称
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${step.name} ${statusText}`, x + width / 2, y + 25);

    // 绘制步骤副标题
    ctx.fillStyle = textColor;
    ctx.font = '12px Arial';
    ctx.fillText(step.subtitle, x + width / 2, y + 45);

    // 绘制状态图标
    if (step.status === 'completed') {
      // 完成标记
      ctx.fillStyle = '#27AE60';
      ctx.beginPath();
      ctx.arc(x + width - 20, y + 20, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✓', x + width - 20, y + 20 + 4);
    } else if (step.status === 'locked') {
      // 锁定图标
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔒', x + width - 20, y + 20);
    }
  }

  /**
   * 绘制换行文本
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {string} text - 文本内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} maxWidth - 最大宽度
   * @param {number} lineHeight - 行高
   */
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      ctx.fillText(line, x, currentY);
    }
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 检查返回按钮点击
    const backBtnSize = 40;
    const backBtnX = 20;
    const backBtnY = 20;
    
    if (x >= backBtnX && x <= backBtnX + backBtnSize &&
        y >= backBtnY && y <= backBtnY + backBtnSize) {
      this.handleBackButton();
      return;
    }

    // 检查农具卡片点击
    this.tools.forEach((tool, index) => {
      const cardX = this.cardsStartX + index * (this.cardWidth + this.cardGap) - this.scrollOffset;
      const cardY = this.cardsY;
      
      if (x >= cardX && x <= cardX + this.cardWidth &&
          y >= cardY && y <= cardY + this.cardHeight) {
        
        // 检查是否点击了开始拼装按钮
        if (tool.startButton) {
          const btnX = tool.startButton.x;
          const btnY = tool.startButton.y;
          const btnWidth = tool.startButton.width;
          const btnHeight = tool.startButton.height;
          
          if (x >= btnX && x <= btnX + btnWidth &&
              y >= btnY && y <= btnY + btnHeight) {
            this.handleStartAssembly(tool);
            return;
          }
        }
        
        this.handleToolClick(tool, index);
      }
    });

    // 检查进度步骤点击
    const stepsContainerY = SCREEN_HEIGHT * 0.75;
    const stepWidth = (SCREEN_WIDTH - 60) / 3;
    const stepHeight = 80;
    
    this.steps.forEach((step, index) => {
      const stepX = 30 + index * stepWidth;
      const stepY = stepsContainerY;
      
      if (x >= stepX && x <= stepX + stepWidth &&
          y >= stepY && y <= stepY + stepHeight) {
        this.handleStepClick(step, index);
      }
    });
  }

  /**
   * 处理触摸开始事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchStart(event) {
    const touch = event.touches[0];
    this.lastTouchX = touch.clientX;
    this.isDragging = false;
  }

  /**
   * 处理触摸移动事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchMove(event) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.lastTouchX;
    
    // 检查是否为水平滑动
    if (Math.abs(deltaX) > 10) {
      this.isDragging = true;
      
      // 限制滑动范围
      const maxScrollOffset = (this.tools.length - 1) * (this.cardWidth + this.cardGap);
      this.scrollOffset = Math.max(0, Math.min(maxScrollOffset, this.scrollOffset - deltaX));
      
      this.lastTouchX = touch.clientX;
    }
  }

  /**
   * 处理触摸结束事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchEnd(event) {
    if (this.isDragging) {
      // 自动对齐到最近的卡片
      this.snapToNearestCard();
      this.isDragging = false;
    }
  }

  /**
   * 对齐到最近的卡片
   */
  snapToNearestCard() {
    const cardSpacing = this.cardWidth + this.cardGap;
    const nearestIndex = Math.round(this.scrollOffset / cardSpacing);
    const targetOffset = nearestIndex * cardSpacing;
    
    // 添加动画效果
    this.animateScrollTo(targetOffset);
  }

  /**
   * 动画滚动到指定位置
   * @param {number} targetOffset - 目标偏移量
   */
  animateScrollTo(targetOffset) {
    const startOffset = this.scrollOffset;
    const distance = targetOffset - startOffset;
    const duration = 300; // 300ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.scrollOffset = startOffset + distance * easeOut;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  /**
   * 处理返回按钮点击
   */
  handleBackButton() {
    if (GameGlobal.pageManager && GameGlobal.pageManager.goBack()) {
      this.showToast('返回上一页');
    } else {
      GameGlobal.pageManager.switchToPage('home', { addToHistory: false });
      this.showToast('返回主页');
    }
  }

  /**
   * 处理农具点击
   * @param {Object} tool - 农具对象
   * @param {number} index - 农具索引
   */
  handleToolClick(tool, index) {
    this.selectedToolIndex = index;
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`选择农具: ${tool.name}`, {
        toolId: tool.id,
        unlocked: tool.unlocked,
        progress: tool.progress
      }, 'tool-assembly-nav');
    }

    // 自动滚动到选中的卡片
    this.scrollToCard(index);
  }

  /**
   * 处理开始拼装
   * @param {Object} tool - 农具对象
   */
  handleStartAssembly(tool) {
    if (!tool.unlocked) {
      this.showToast('该农具尚未解锁');
      return;
    }

    // 保存选中的农具到数据总线
    if (GameGlobal.databus) {
      GameGlobal.databus.setCurrentTool(tool);
    }

    // 切换到农具拼装页面
    if (GameGlobal.pageManager) {
      GameGlobal.pageManager.switchToPage('toolAssembly', {
        animationType: 'slideLeft'
      });
    }

    this.showToast(`开始拼装 ${tool.name}`);
  }

  /**
   * 处理步骤点击
   * @param {Object} step - 步骤对象
   * @param {number} index - 步骤索引
   */
  handleStepClick(step, index) {
    if (step.status === 'locked') {
      this.showToast('该步骤尚未解锁');
      return;
    }
    
    this.showToast(`进入${step.name}`);
  }

  /**
   * 滚动到指定卡片
   * @param {number} cardIndex - 卡片索引
   */
  scrollToCard(cardIndex) {
    const targetOffset = cardIndex * (this.cardWidth + this.cardGap);
    this.scrollOffset = targetOffset;
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    import('../components/Toast').then(module => {
      const Toast = module.default;
      Toast.show(message);
    }).catch(error => {
      console.error('Toast加载失败:', error);
      if (GameGlobal.wechatAPI) {
        GameGlobal.wechatAPI.showToast(message);
      }
    });
  }

  /**
   * 更新页面
   */
  update() {
    // 更新农具进度（从数据总线获取）
    if (GameGlobal.databus) {
      this.tools.forEach(tool => {
        const toolData = GameGlobal.databus.getToolData(tool.id);
        if (toolData) {
          tool.progress = toolData.progress || 0;
          tool.completed = toolData.completed || false;
          tool.unlocked = toolData.unlocked !== false;
        }
      });
    }
  }
} 