import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import BasePage from './BasePage';

/**
 * 农具拼装导航页面
 */
export default class ToolAssemblyNavPage extends BasePage {
  tools = [];
  selectedToolIndex = 0;
  scrollOffset = 0;
  isDragging = false;
  lastTouchX = 0;
  cardWidth = 300;
  cardHeight = 450;
  cardSpacing = 30;
  steps = [
    { id: 'step1', name: '观看视频', status: 'completed', title: '第一步 (已完成)' },
    { id: 'step2', name: '基础认知', status: 'current', title: '第二步 (进行中)' },
    { id: 'step3', name: '立体组装', status: 'locked', title: '第三步 (未解锁)' }
  ];

  constructor() {
    super();
    try {
      this.initTools();
      this.initLayout();
      this.loadResources();
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('ToolAssemblyNavPage构造函数错误', { error: error.message }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 初始化工具数据
   */
  initTools() {
    this.tools = [
      {
        id: 'quyuan_plow',
        name: '曲辕犁',
        subtitle: '古代农具革新代表',
        description: '曲辕犁是中国古代农业技术的巅峰之作，体现了"天人合一"的哲学思想。牛或人力拉动犁辕，犁铧切入土壤并翻动，犁箭调节深度以适应不同土质。',
        difficulty: 2,
        reward: 10,
        cardColor: '#E3F2FD',
        image: 'images/tool_hoe.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'ancient_mill',
        name: '古代石磨',
        subtitle: '粮食加工工具',
        description: '古代石磨是重要的粮食加工工具，用于将谷物磨成面粉。它由上下两个石盘组成，通过旋转运动实现研磨功能。',
        difficulty: 2,
        reward: 20,
        cardColor: '#E8F5E8',
        image: 'images/tool_shovel.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'ancient_weight',
        name: '古代秤',
        subtitle: '计量工具',
        description: '古代秤是重要的计量工具，用于称量物品的重量。它体现了古代工匠的智慧和精确的测量技术。',
        difficulty: 1,
        reward: 10,
        cardColor: '#FFF8E1',
        image: 'images/tool_sickle.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'ancient_waterwheel',
        name: '古代水车',
        subtitle: '水利工程',
        description: '古代水车是重要的水利工程工具，利用水流动力进行灌溉和机械传动，体现了古代工程技术的智慧。',
        difficulty: 3,
        reward: 30,
        cardColor: '#F3E5F5',
        image: 'images/tool_rake.png',
        unlocked: false,
        completed: false
      },
      {
        id: 'ancient_sickle',
        name: '古代镰刀',
        subtitle: '收割工具',
        description: '古代镰刀是重要的收割工具，用于收割农作物。它的设计体现了古代工匠对实用性和效率的追求。',
        difficulty: 2,
        reward: 15,
        cardColor: '#E0F2F1',
        image: 'images/tool_hoe.png',
        unlocked: false,
        completed: false
      }
    ];
  }

  /**
   * 初始化布局参数
   */
  initLayout() {
    this.cardWidth = 800;  // 增加宽度
    this.cardHeight = 500; // 增加高度
    this.cardSpacing = 30;
    this.steps = [
      { id: 'step1', name: '观看视频', status: 'completed', title: '第一步 (已完成)' },
      { id: 'step2', name: '基础认知', status: 'current', title: '第二步 (进行中)' },
      { id: 'step3', name: '立体组装', status: 'locked', title: '第三步 (未解锁)' }
    ];
  }

  /**
   * 加载资源
   */
  loadResources() {
    this.tools.forEach(tool => {
      try {
        const img = wx.createImage();
        img.onload = () => {
          tool.imageLoaded = true;
          tool.imageElement = img; // 保存图片元素
          if (GameGlobal.logger) {
            GameGlobal.logger.info(`图片加载成功: ${tool.image}`, null, 'toolAssemblyNav');
          }
        };
        img.onerror = () => {
          if (GameGlobal.logger) {
            GameGlobal.logger.warn(`图片加载失败: ${tool.image}`, null, 'toolAssemblyNav');
          }
          tool.usePlaceholder = true;
          tool.imageLoaded = false;
        };
        img.src = tool.image;
      } catch (error) {
        if (GameGlobal.logger) {
          GameGlobal.logger.error(`加载图片失败: ${tool.image}`, { error: error.message }, 'toolAssemblyNav');
        }
        tool.usePlaceholder = true;
        tool.imageLoaded = false;
      }
    });
  }

  /**
   * 渲染页面内容
   */
  renderContent(ctx) {
    try {
      // 绘制白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      
      this.renderTopNav(ctx);
      this.renderToolCards(ctx);
      this.renderProgressSteps(ctx);
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染页面内容失败', { error: error.message }, 'toolAssemblyNav');
      }
      // 备用渲染方案
      this.renderFallbackContent(ctx);
    }
  }

  /**
   * 备用渲染方案
   */
  renderFallbackContent(ctx) {
    try {
      // 清空画布
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      // 显示错误信息
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('农具拼装', SCREEN_WIDTH / 2, 50);

      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.fillText('页面加载中...', SCREEN_WIDTH / 2, 100);

      // 显示工具列表
      this.tools.forEach((tool, index) => {
        const y = 150 + index * 60;
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(20, y, SCREEN_WIDTH - 40, 50);
        
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(tool.name, 30, y + 30);
      });
    } catch (fallbackError) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('备用渲染也失败', { error: fallbackError.message }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 渲染顶部导航栏
   */
  renderTopNav(ctx) {
    // 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, SCREEN_WIDTH, 80);

    // 返回按钮（圆形绿色按钮，带渐变和阴影效果）
    const buttonX = 40;
    const buttonY = 40;
    const buttonRadius = 20;
    
    // 绘制阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    // 绘制按钮背景（更亮的渐变效果）
    const gradient = ctx.createRadialGradient(
      buttonX - 8, buttonY - 8, 0,
      buttonX, buttonY, buttonRadius
    );
    gradient.addColorStop(0, '#81C784'); // 更亮的绿色（高光）
    gradient.addColorStop(0.3, '#66BB6A'); // 亮绿色
    gradient.addColorStop(0.7, '#4CAF50'); // 主绿色
    gradient.addColorStop(1, '#388E3C'); // 较深的绿色（阴影）
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();

    // 绘制高光效果（顶部亮光）
    ctx.save();
    const highlightGradient = ctx.createRadialGradient(
      buttonX - 5, buttonY - 5, 0,
      buttonX - 5, buttonY - 5, 8
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(buttonX - 5, buttonY - 5, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // 绘制按钮边框（更细的边框）
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 返回箭头（更精细的绘制，更亮）
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 绘制箭头主体
    ctx.beginPath();
    ctx.moveTo(buttonX + 6, buttonY);
    ctx.lineTo(buttonX - 4, buttonY);
    ctx.stroke();
    
    // 绘制箭头头部
    ctx.beginPath();
    ctx.moveTo(buttonX - 2, buttonY - 3);
    ctx.lineTo(buttonX - 4, buttonY);
    ctx.lineTo(buttonX - 2, buttonY + 3);
    ctx.stroke();
    
    ctx.restore();

    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('农具拼装', 80, 45);
  }

  /**
   * 渲染工具卡片
   */
  renderToolCards(ctx) {
    const startY = 120; // 调整起始位置，因为卡片变矮了
    const cardMargin = 30; // 增加卡片之间的间距
    
    this.tools.forEach((tool, index) => {
      // 横向排列，每个卡片占一列
      const cardX = 20 + index * (this.cardWidth + cardMargin); // 水平排列，从左边开始
      const cardY = startY; // 垂直位置固定
      
      this.renderToolCard(ctx, tool, cardX, cardY, index === this.selectedToolIndex);
    });
  }

  /**
   * 渲染单个工具卡片
   */
  renderToolCard(ctx, tool, x, y, isSelected) {
    try {
      // 绘制卡片阴影
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      // 卡片背景（使用自然淡雅的纯色）
      const cardColors = {
        '#E3F2FD': '#F8FBFF', // 淡蓝色
        '#E8F5E8': '#F5FCF5', // 淡绿色
        '#FFF8E1': '#FFFEFF', // 淡黄色
        '#F3E5F5': '#FDFAFF', // 淡紫色
        '#E0F2F1': '#F5FFFE'  // 淡青色
      };
      
      const backgroundColor = cardColors[tool.cardColor] || '#FFFFFF';
      ctx.fillStyle = backgroundColor;
      
      // 绘制圆角矩形（更高的圆角程度）
      try {
        if (ctx.roundRect && typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 85); // 增加圆角半径
          ctx.fill();
        } else {
          // 降级方案
          ctx.fillRect(x, y, this.cardWidth, this.cardHeight);
        }
      } catch (rectError) {
        // 如果圆角矩形失败，使用普通矩形
        ctx.fillRect(x, y, this.cardWidth, this.cardHeight);
      }
      
      ctx.restore();

      // 绘制白色轮廓
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      try {
        if (ctx.roundRect && typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, this.cardWidth, this.cardHeight, 85); // 增加圆角半径
          ctx.stroke();
        } else {
          // 降级方案
          ctx.strokeRect(x, y, this.cardWidth, this.cardHeight);
        }
      } catch (rectError) {
        ctx.strokeRect(x, y, this.cardWidth, this.cardHeight);
      }

      // 计算布局区域（适应800x500的卡片）
      const imageWidth = 300;  // 增加图片宽度
      const imageHeight = 300; // 增加图片高度
      const imageX = x + 50;   // 增加左边距
      const imageY = y + 80;   // 图片Y坐标（留出顶部空间给难度）
      const contentX = x + imageWidth + 80; // 内容区域X坐标
      const contentY = y + 80; // 内容区域Y坐标
      const contentWidth = this.cardWidth - imageWidth - 130; // 内容区域宽度

      // 难度横幅（在卡片右上角）
      const bannerWidth = 120;
      const bannerHeight = 35;
      const bannerX = x + this.cardWidth - bannerWidth - 30; // 右上角
      const bannerY = y + 30;
      
      const bannerGradient = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerWidth, bannerY + bannerHeight);
      bannerGradient.addColorStop(0, '#42A5F5');
      bannerGradient.addColorStop(1, '#1976D2');
      
      ctx.fillStyle = bannerGradient;
      ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
      
      // 难度横幅边框
      ctx.strokeStyle = '#1565C0';
      ctx.lineWidth = 1;
      ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('难度:', bannerX + 10, bannerY + 22);

      // 难度星级
      this.renderDifficultyStars(ctx, tool.difficulty, bannerX + 10, bannerY + 32);

      // 工具图片（左侧）
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      
      if (tool.imageLoaded && !tool.usePlaceholder && tool.imageElement) {
        try {
          ctx.drawImage(tool.imageElement, imageX, imageY, imageWidth, imageHeight);
        } catch (drawError) {
          if (GameGlobal.logger) {
            GameGlobal.logger.warn('绘制图片失败，使用占位符', { error: drawError.message, tool: tool.name }, 'toolAssemblyNav');
          }
          this.renderImagePlaceholder(ctx, imageX, imageY, imageWidth, imageHeight);
        }
      } else {
        // 占位符
        this.renderImagePlaceholder(ctx, imageX, imageY, imageWidth, imageHeight);
      }
      
      ctx.restore();

      // 内容区域（右侧）
      // 工具名称
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 28px Arial'; // 增加字体大小
      ctx.textAlign = 'left';
      ctx.fillText(tool.name, contentX, contentY + 35);
      
      ctx.restore();

      // 副标题
      ctx.fillStyle = '#666666';
      ctx.font = '18px Arial'; // 增加字体大小
      ctx.textAlign = 'left';
      ctx.fillText(tool.subtitle, contentX, contentY + 70);

      // 描述文字（自动换行，限制行数）
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial'; // 增加字体大小
      ctx.textAlign = 'left';
      this.drawWrappedText(ctx, tool.description, contentX, contentY + 120, contentWidth - 20, 24, 6); // 限制6行

      // 奖励信息（底部中央）
      const rewardX = x + this.cardWidth / 2; // 水平居中
      const rewardY = y + this.cardHeight - 50; // 底部
      this.renderReward(ctx, tool.reward, rewardX, rewardY);
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染工具卡片失败', { error: error.message, tool: tool.name }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 渲染图片占位符
   */
  renderImagePlaceholder(ctx, x, y, width, height) {
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(x, y, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // 绘制占位符文字
    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('图片加载中...', x + width / 2, y + height / 2);
  }

  /**
   * 渲染难度星级
   */
  renderDifficultyStars(ctx, difficulty, x, y) {
    // 绘制星级背景
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(x - 2, y - 8, 62, 16);
    
    // 绘制星级边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 8, 62, 16);
    
    // 绘制星星
    for (let i = 0; i < 5; i++) {
      if (i < difficulty) {
        // 实心星星（金色）
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
      } else {
        // 空心星星（灰色）
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '12px Arial';
      }
      ctx.textAlign = 'left';
      const star = i < difficulty ? '★' : '☆';
      ctx.fillText(star, x + i * 12, y);
    }
  }

  /**
   * 渲染奖励信息
   */
  renderReward(ctx, reward, centerX, y) {
    // 绘制奖励背景
    const rewardWidth = 120;
    const rewardHeight = 35;
    const rewardX = centerX - rewardWidth / 2; // 居中显示
    
    // 渐变背景
    const gradient = ctx.createLinearGradient(rewardX, y, rewardX + rewardWidth, y + rewardHeight);
    gradient.addColorStop(0, '#FFB74D');
    gradient.addColorStop(1, '#FF9800');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(rewardX, y - 25, rewardWidth, rewardHeight);
    
    // 边框
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 1;
    ctx.strokeRect(rewardX, y - 25, rewardWidth, rewardHeight);
    
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${reward}`, centerX, y - 5);
  }

  /**
   * 渲染进度步骤
   */
  renderProgressSteps(ctx) {
    const startY = SCREEN_HEIGHT - 120;
    const stepWidth = 120;
    const spacing = 20;
    const totalWidth = this.steps.length * stepWidth + (this.steps.length - 1) * spacing;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    // 绘制虚线边框
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(startX - 10, startY - 10, totalWidth + 20, 80);
    ctx.setLineDash([]);

    this.steps.forEach((step, index) => {
      this.renderProgressStep(ctx, step, startX + index * (stepWidth + spacing), startY, stepWidth);
    });
  }

  /**
   * 渲染单个进度步骤
   */
  renderProgressStep(ctx, step, x, y, width) {
    try {
      const isCompleted = step.status === 'completed';
      const isCurrent = step.status === 'current';
      const isLocked = step.status === 'locked';
      
      // 步骤背景
      ctx.fillStyle = isCompleted ? '#E8F5E8' : isCurrent ? '#E3F2FD' : '#F5F5F5';
      ctx.strokeStyle = isCompleted ? '#4CAF50' : isCurrent ? '#2196F3' : '#CCCCCC';
      ctx.lineWidth = 2;
      
      try {
        if (ctx.roundRect && typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, width, 60, 10);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x, y, width, 60);
          ctx.strokeRect(x, y, width, 60);
        }
      } catch (rectError) {
        ctx.fillRect(x, y, width, 60);
        ctx.strokeRect(x, y, width, 60);
      }

      // 步骤标题
      ctx.fillStyle = isCompleted ? '#4CAF50' : isCurrent ? '#2196F3' : '#999999';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(step.title, x + width / 2, y + 20);

      // 步骤名称
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(step.name, x + width / 2, y + 40);

      // 状态图标
      if (isCompleted) {
        // 已完成印章
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(x + width - 15, y + 15, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('已完成', x + width - 15, y + 18);
      } else if (isLocked) {
        // 锁定图标
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', x + width - 15, y + 20);
      }
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染进度步骤失败', { error: error.message, step: step.name }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 绘制自动换行文字
   */
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    try {
      if (!text || typeof text !== 'string') {
        return;
      }

      const words = text.split('');
      let line = '';
      let currentY = y;
      let lineCount = 0;

      for (let i = 0; i < words.length && lineCount < maxLines; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, x, currentY);
          line = words[i];
          currentY += lineHeight;
          lineCount++;
        } else {
          line = testLine;
        }
      }
      
      if (line !== '' && lineCount < maxLines) {
        ctx.fillText(line, x, currentY);
      }

      // 如果文字被截断，添加省略号
      if (lineCount >= maxLines && words.length > 0) {
        const lastLine = line.substring(0, Math.floor(line.length * 0.8)) + '...';
        ctx.fillText(lastLine, x, currentY);
      }
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('绘制换行文字失败', { error: error.message, text: text }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 处理触摸事件
   */
  handleTouch(event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }

    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 检查返回按钮
    const distance = Math.sqrt((x - 40) * (x - 40) + (y - 40) * (y - 40));
    if (distance <= 20) {
      GameGlobal.pageManager.goBack();
      return;
    }

    // 检查工具卡片点击
    const cardY = 100;
    const centerX = SCREEN_WIDTH / 2;
    
    this.tools.forEach((tool, index) => {
      const cardX = centerX - this.cardWidth / 2 + (index - this.selectedToolIndex) * (this.cardWidth + this.cardSpacing) + this.scrollOffset;
      
      if (x >= cardX && x <= cardX + this.cardWidth && 
          y >= cardY && y <= cardY + this.cardHeight) {
        this.selectedToolIndex = index;
        this.scrollOffset = 0;
        return;
      }
    });
  }

  /**
   * 处理触摸开始事件
   */
  handleTouchStart(event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }
    
    this.isDragging = true;
    this.lastTouchX = event.touches[0].clientX;
  }

  /**
   * 处理触摸移动事件
   */
  handleTouchMove(event) {
    if (!this.isDragging || !event.touches || event.touches.length === 0) {
      return;
    }
    
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - this.lastTouchX;
    
    this.scrollOffset += deltaX;
    this.lastTouchX = currentX;
  }

  /**
   * 处理触摸结束事件
   */
  handleTouchEnd(event) {
    if (!this.isDragging) {
      return;
    }
    
    this.isDragging = false;
    
    // 自动对齐到最近的卡片
    const cardSpacing = this.cardWidth + this.cardSpacing;
    const targetOffset = -this.selectedToolIndex * cardSpacing;
    
    if (Math.abs(this.scrollOffset - targetOffset) > cardSpacing / 2) {
      if (this.scrollOffset > targetOffset) {
        this.selectedToolIndex = Math.max(0, this.selectedToolIndex - 1);
      } else {
        this.selectedToolIndex = Math.min(this.tools.length - 1, this.selectedToolIndex + 1);
      }
    }
    
    this.scrollOffset = -this.selectedToolIndex * cardSpacing;
  }

  /**
   * 更新页面状态
   */
  update() {
    // 页面更新逻辑
  }
} 