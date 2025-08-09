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
        reward: 20,
        cardColor: '#e6f4ff', // 新的蓝色背景
        difficultyColor: '#4096ff', // 蓝色难度标签
        image: 'images/tool_hoe.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'stone_mill',
        name: '石磨',
        subtitle: '粮食加工重要工具',
        description: '石磨最早出现于战国时期，是古代粮食加工的重要工具。粮食从进料孔落入磨盘间，通过旋转摩擦被碾碎，粉末从边缘流出。',
        difficulty: 2,
        reward: 25,
        cardColor: '#d9f7be', // 新的绿色背景
        difficultyColor: '#73d13d', // 绿色难度标签
        image: 'images/tool_shovel.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'water_wheel',
        name: '水车',
        subtitle: '重要水利灌溉工具',
        description: '水车最早可追溯至汉代，是中国古代重要的水利灌溉工具。水流冲击叶片带动水轮旋转，提水斗将水从低处舀起，升至高处后倒入灌溉渠。',
        difficulty: 3,
        reward: 30,
        cardColor: '#fff1b8', // 新的黄色背景
        difficultyColor: '#ffc53d', // 黄色难度标签
        image: 'images/tool_rake.png',
        unlocked: true,
        completed: false
      }
    ];
  }

  /**
   * 初始化布局参数
   */
  initLayout() {
    // 堆叠卡片布局参数 - 最大化尺寸但避免遮挡其他组件
    // 可用垂直空间：SCREEN_HEIGHT - 80(顶部) - 120(底部) = SCREEN_HEIGHT - 200
    const availableHeight = SCREEN_HEIGHT - 200; // 减去顶部和底部组件
    const availableWidth = SCREEN_WIDTH - 40; // 留出左右边距
    
    this.cardWidth = Math.min(750, availableWidth);  // 再次增大宽度，最大750px
    this.cardHeight = Math.min(450, availableHeight * 0.85); // 再次增大高度，占可用空间85%
    this.cardSpacing = 60;  // 卡片之间的间距
    this.stackOffset = 130; // 增大堆叠偏移量适配更大卡片
    this.scaleRatio = 0.75; // 进一步调整缩放比例，突出大小对比
    this.maxVisibleCards = 2; // 保持显示2张卡片突出中心卡片
    
    // 滑动手势参数
    this.swipeThreshold = 50; // 滑动触发阈值
    this.swipeVelocityThreshold = 0.3; // 滑动速度阈值
    this.isSwipeInProgress = false; // 滑动进行中标志
    this.swipeStartX = 0; // 滑动起始X坐标
    this.swipeStartTime = 0; // 滑动起始时间
    
    this.steps = [
      { id: 'step1', name: '观看视频', status: 'completed', title: '第一步 (已完成)' },
      { id: 'step2', name: '基础认知', status: 'current', title: '第二步 (进行中)' },
      { id: 'step3', name: '立体组装', status: 'locked', title: '第三步 (未解锁)' }
    ];
  }

  /**
   * 加载状态图标
   */
  loadStatusIcons() {
    // 加载已完成图标
    try {
      this.finishIcon = wx.createImage();
      this.finishIcon.onload = () => {
        this.finishIconLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('已完成图标加载成功: finish.png', null, 'toolAssemblyNav');
        }
      };
      this.finishIcon.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('已完成图标加载失败: finish.png', null, 'toolAssemblyNav');
        }
        this.finishIconLoaded = false;
      };
      this.finishIcon.src = 'images/finish.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('已完成图标加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.finishIconLoaded = false;
    }

    // 加载锁定图标
    try {
      this.lockIcon = wx.createImage();
      this.lockIcon.onload = () => {
        this.lockIconLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('锁定图标加载成功: lock.png', null, 'toolAssemblyNav');
        }
      };
      this.lockIcon.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('锁定图标加载失败: lock.png', null, 'toolAssemblyNav');
        }
        this.lockIconLoaded = false;
      };
      this.lockIcon.src = 'images/lock.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('锁定图标加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.lockIconLoaded = false;
    }
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载状态图标
    this.loadStatusIcons();
    
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

    // 返回按钮（圆形绿色按钮，带渐变和阴影效果，稍微增大尺寸）
    const buttonX = 40;
    const buttonY = 40;
    const buttonRadius = 24; // 从20增加到24，稍微大一点
    
    // 绘制阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    // 绘制按钮背景（使用#19C472系列渐变效果）
    const gradient = ctx.createRadialGradient(
      buttonX - 8, buttonY - 8, 0,
      buttonX, buttonY, buttonRadius
    );
    gradient.addColorStop(0, '#4DD58A'); // 更亮的绿色（高光，基于#19C472调亮）
    gradient.addColorStop(0.3, '#2DD071'); // 亮绿色
    gradient.addColorStop(0.7, '#19C472'); // 主绿色 - 用户指定颜色
    gradient.addColorStop(1, '#15A862'); // 较深的绿色（阴影，基于#19C472调暗）
    
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

    // 返回箭头（适配按钮尺寸放大，更粗更清晰）
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3; // 从2.5增加到3，线条更粗
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 绘制箭头主体（放大尺寸）
    ctx.beginPath();
    ctx.moveTo(buttonX + 8, buttonY); // 从+6增加到+8
    ctx.lineTo(buttonX - 6, buttonY); // 从-4增加到-6
    ctx.stroke();
    
    // 绘制箭头头部（放大尺寸）
    ctx.beginPath();
    ctx.moveTo(buttonX - 3, buttonY - 4); // 从-2,-3调整到-3,-4
    ctx.lineTo(buttonX - 6, buttonY);     // 从-4调整到-6
    ctx.lineTo(buttonX - 3, buttonY + 4); // 从-2,+3调整到-3,+4
    ctx.stroke();
    
    ctx.restore();

    // 标题 - 现代化字体，去掉加粗，向上调整位置
    ctx.fillStyle = '#333333';
    ctx.font = '24px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('农具拼装', 80, 40);
  }

  /**
   * 渲染工具卡片 - 堆叠样式
   */
  renderToolCards(ctx) {
    const centerX = SCREEN_WIDTH / 2; // 屏幕中心X坐标
    // 在顶部导航栏(80px)和底部步骤指示器(120px)之间居中
    const availableTop = 80;
    const availableBottom = SCREEN_HEIGHT - 120;
    const centerY = (availableTop + availableBottom) / 2; // 在可用空间中居中
    
    // 创建卡片渲染队列，按Z-order排序（确保中央卡片在顶层）
    const cardsToRender = [];
    
    for (let i = -this.maxVisibleCards; i <= this.maxVisibleCards; i++) {
      const cardIndex = this.selectedToolIndex + i;
      
      // 跳过超出范围的卡片
      if (cardIndex < 0 || cardIndex >= this.tools.length) continue;
      
      const tool = this.tools[cardIndex];
      const isActive = i === 0; // 中心卡片为活跃状态
      
      // 计算卡片位置和变换
      const cardX = centerX - this.cardWidth / 2 + i * this.stackOffset;
      const cardY = centerY - this.cardHeight / 2;
      const scale = isActive ? 1.0 : this.scaleRatio;
      const zIndex = this.maxVisibleCards - Math.abs(i); // Z层级（中央卡片最高）
      
      cardsToRender.push({
        tool,
        cardX,
        cardY,
        scale,
        isActive,
        zIndex,
        relativeIndex: i
      });
    }
    
    // 按Z-order排序渲染，确保中央卡片(zIndex最高)最后渲染在顶层
    cardsToRender
      .sort((a, b) => a.zIndex - b.zIndex) // 从低到高排序
      .forEach(card => {
        this.renderStackedToolCard(ctx, card.tool, card.cardX, card.cardY, card.scale, card.isActive, card.zIndex);
      });
  }

  /**
   * 渲染堆叠样式的工具卡片
   */
  renderStackedToolCard(ctx, tool, x, y, scale, isActive, zIndex) {
    ctx.save();
    
    try {
      // 应用透明度（非活跃卡片降低透明度减少干扰）
      if (!isActive) {
        ctx.globalAlpha = 0.6; // 非活跃卡片透明度60%
      }
      
      // 应用缩放变换
      ctx.translate(x + this.cardWidth / 2, y + this.cardHeight / 2);
      ctx.scale(scale, scale);
      ctx.translate(-this.cardWidth / 2, -this.cardHeight / 2);
      
      // 绘制卡片阴影（仅对活跃卡片）
      if (isActive) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // 增强中央卡片阴影
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
      }
      
      // 使用纯色背景
      ctx.fillStyle = tool.cardColor || '#FFFFFF';
      
      // 绘制圆角矩形背景 - 使用非常大的圆角半径确保效果明显
      const borderRadius = Math.min(120, this.cardWidth / 4, this.cardHeight / 4); // 更大的圆角半径
      
      if (GameGlobal.logger) {
        GameGlobal.logger.debug(`绘制卡片圆角，半径: ${borderRadius}px`, { 
          hasRoundRect: !!(ctx.roundRect && typeof ctx.roundRect === 'function'),
          cardWidth: this.cardWidth,
          cardHeight: this.cardHeight
        }, 'toolAssemblyNav');
      }
      
      // 直接使用兼容性最好的手动圆角绘制
      try {
        this.drawSimpleRoundedRect(ctx, 0, 0, this.cardWidth, this.cardHeight, borderRadius);
        ctx.fill();
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('使用简化圆角绘制卡片背景', { borderRadius }, 'toolAssemblyNav');
        }
      } catch (rectError) {
        // 如果圆角绘制失败，使用普通矩形
        ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('圆角绘制失败，使用普通矩形', { 
            error: rectError.message,
            stack: rectError.stack,
            borderRadius,
            cardWidth: this.cardWidth,
            cardHeight: this.cardHeight
          }, 'toolAssemblyNav');
        }
      }
      
      if (isActive) {
        ctx.restore(); // 恢复阴影设置
      }
      
      // 绘制卡片边框（活跃卡片增强边框）
      if (isActive) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.lineWidth = 3; // 增强中央卡片边框
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
      }
      try {
        this.drawSimpleRoundedRect(ctx, 0, 0, this.cardWidth, this.cardHeight, borderRadius);
        ctx.stroke();
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('使用简化圆角绘制卡片边框', { borderRadius }, 'toolAssemblyNav');
        }
      } catch (rectError) {
        ctx.strokeRect(0, 0, this.cardWidth, this.cardHeight);
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('圆角边框绘制失败，使用普通边框', { 
            error: rectError.message,
            borderRadius 
          }, 'toolAssemblyNav');
        }
      }
      
      // 渲染工具图标（左侧，适配最大卡片）
      const iconSize = 160; // 适配更大卡片的图标尺寸
      const iconX = 50;
      const iconY = (this.cardHeight - iconSize) / 2;
      
      if (tool.imageLoaded && !tool.usePlaceholder && tool.imageElement) {
        try {
          ctx.drawImage(tool.imageElement, iconX, iconY, iconSize, iconSize);
        } catch (drawError) {
          this.renderImagePlaceholder(ctx, iconX, iconY, iconSize, iconSize);
        }
      } else {
        this.renderImagePlaceholder(ctx, iconX, iconY, iconSize, iconSize);
      }
      
      // 渲染文本内容（右侧，适配最大卡片）
      const textX = iconX + iconSize + 40;
      const textY = 60;
      
      // 一级标题（工具名称）- 现代化字体，深色，加黑加粗
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 28px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif'; // 现代化字体，调整大小
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(tool.name, textX, textY);
      
      // 二级标题（副标题）- 现代化字体，中等色，加黑加粗但比一级标题小
      ctx.fillStyle = '#444444';
      ctx.font = 'bold 20px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif'; // 现代化字体，调整大小
      ctx.fillText(tool.subtitle, textX, textY + 40);
      
      // 描述文字（现代化字体，适配最大空间）
      ctx.fillStyle = '#666666';
      ctx.font = '16px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif'; // 现代化字体
      const maxDescWidth = this.cardWidth - textX - 50;
      this.drawTruncatedText(ctx, tool.description, textX, textY + 80, maxDescWidth, 140);
      
      // 渲染难度标签（右上角，向左移动更多以优化视觉平衡）
      const difficultyTagWidth = 110;
      const difficultyX = this.cardWidth - difficultyTagWidth - 80; // 增加左移距离到80px
      this.renderDifficultyTag(ctx, tool.difficulty, difficultyX, 30, tool);
      
      if (GameGlobal.logger && isActive) {
        GameGlobal.logger.debug('标签位置计算', { 
          cardWidth: this.cardWidth,
          difficultyX,
          difficultyRightEdge: difficultyX + difficultyTagWidth,
          rewardX: this.cardWidth - 120 - 80,
          rewardRightEdge: (this.cardWidth - 120 - 80) + 120
        }, 'toolAssemblyNav');
      }
      
      // 渲染奖励信息（右下角，向左移动更多以优化视觉平衡）
      const rewardTagWidth = 120;
      const rewardX = this.cardWidth - rewardTagWidth - 80; // 增加左移距离到80px
      this.renderRewardTag(ctx, tool.reward, rewardX, this.cardHeight - 40);
      
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染堆叠卡片失败', { error: error.message, tool: tool.name }, 'toolAssemblyNav');
      }
    }
    
    ctx.restore();
  }

  /**
   * 渲染单个工具卡片（保留旧方法以备用）
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
   * 简化的圆角矩形绘制（最大兼容性）
   */
  drawSimpleRoundedRect(ctx, x, y, width, height, radius) {
    // 限制圆角半径，确保不会过大
    const maxRadius = Math.min(width / 2, height / 2);
    const r = Math.min(Math.max(0, radius), maxRadius);
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug(`简化圆角矩形绘制`, { 
        x, y, width, height, 
        requestedRadius: radius, 
        effectiveRadius: r
      }, 'toolAssemblyNav');
    }
    
    // 如果圆角半径为0或很小，直接绘制普通矩形
    if (r < 1) {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.closePath();
      return;
    }
    
    // 使用最基础的arc方法绘制圆角
    try {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.arc(x + width - r, y + r, r, -Math.PI/2, 0);
      ctx.lineTo(x + width, y + height - r);
      ctx.arc(x + width - r, y + height - r, r, 0, Math.PI/2);
      ctx.lineTo(x + r, y + height);
      ctx.arc(x + r, y + height - r, r, Math.PI/2, Math.PI);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, -Math.PI/2);
      ctx.closePath();
    } catch (error) {
      // 如果arc方法也失败，使用最基础的rect
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.closePath();
      if (GameGlobal.logger) {
        GameGlobal.logger.warn('弧线绘制失败，使用矩形', { error: error.message }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 手动绘制圆角矩形（兼容性方案 - 备用）
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    // 限制圆角半径不超过宽高的一半
    const maxRadius = Math.min(width / 2, height / 2);
    const effectiveRadius = Math.min(radius, maxRadius);
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug(`手动绘制圆角矩形`, { 
        x, y, width, height, 
        requestedRadius: radius, 
        effectiveRadius, 
        maxRadius 
      }, 'toolAssemblyNav');
    }
    
    ctx.beginPath();
    ctx.moveTo(x + effectiveRadius, y);
    ctx.lineTo(x + width - effectiveRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + effectiveRadius);
    ctx.lineTo(x + width, y + height - effectiveRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - effectiveRadius, y + height);
    ctx.lineTo(x + effectiveRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - effectiveRadius);
    ctx.lineTo(x, y + effectiveRadius);
    ctx.quadraticCurveTo(x, y, x + effectiveRadius, y);
    ctx.closePath();
  }

  /**
   * 绘制截断文本
   */
  drawTruncatedText(ctx, text, x, y, maxWidth, maxLines = 2) {
    if (!text || typeof text !== 'string') return;
    
    const words = text.split('');
    let line = '';
    let lineCount = 0;
    const lineHeight = 16;
    
    for (let i = 0; i < words.length && lineCount < maxLines; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = words[i];
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    if (lineCount < maxLines && line !== '') {
      // 如果是最后一行且文本被截断，添加省略号
      if (lineCount === maxLines - 1 && words.length > 0) {
        const testWithEllipsis = line + '...';
        const metrics = ctx.measureText(testWithEllipsis);
        if (metrics.width <= maxWidth) {
          line = testWithEllipsis;
        } else {
          line = line.substring(0, Math.floor(line.length * 0.8)) + '...';
        }
      }
      ctx.fillText(line, x, y + lineCount * lineHeight);
    }
  }

  /**
   * 渲染难度标签
   */
  renderDifficultyTag(ctx, difficulty, x, y, tool) {
    const tagWidth = 110; // 适配最大卡片的标签宽度
    const tagHeight = 40;  // 适配最大卡片的标签高度
    
    // 使用工具指定的难度标签颜色
    ctx.fillStyle = tool.difficultyColor || '#4096ff';
    // 使用更大的圆角半径，确保效果明显
    const tagRadius = Math.min(25, tagHeight / 2); // 最大25px或标签高度的一半
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug('绘制难度标签圆角', { 
        tagWidth, tagHeight, tagRadius 
      }, 'toolAssemblyNav');
    }
    
    // 直接使用兼容性最好的圆角绘制方法
    try {
      this.drawSimpleRoundedRect(ctx, x, y, tagWidth, tagHeight, tagRadius);
      ctx.fill();
    } catch (rectError) {
      ctx.fillRect(x, y, tagWidth, tagHeight);
      if (GameGlobal.logger) {
        GameGlobal.logger.warn('难度标签圆角绘制失败', { error: rectError.message }, 'toolAssemblyNav');
      }
    }
    
    // 绘制星级（适配最大标签，现代化字体）
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < difficulty ? '★' : '☆';
    }
    ctx.fillText(stars, x + tagWidth / 2, y + tagHeight / 2);
  }

  /**
   * 渲染奖励标签
   */
  renderRewardTag(ctx, reward, x, y) {
    const tagWidth = 120; // 增加宽度以适应"奖励"文本前缀
    const tagHeight = 35; // 适配最大卡片的标签高度
    
    // 绘制标签背景
    const gradient = ctx.createLinearGradient(x, y - tagHeight, x + tagWidth, y);
    gradient.addColorStop(0, '#FFB74D');
    gradient.addColorStop(1, '#FF9800');
    
    ctx.fillStyle = gradient;
    // 使用更大的圆角半径，与难度标签保持一致
    const tagRadius = Math.min(25, tagHeight / 2); // 最大25px或标签高度的一半
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug('绘制奖励标签圆角', { 
        tagWidth, tagHeight, tagRadius 
      }, 'toolAssemblyNav');
    }
    
    // 直接使用兼容性最好的圆角绘制方法
    try {
      this.drawSimpleRoundedRect(ctx, x, y - tagHeight, tagWidth, tagHeight, tagRadius);
      ctx.fill();
    } catch (rectError) {
      ctx.fillRect(x, y - tagHeight, tagWidth, tagHeight);
      if (GameGlobal.logger) {
        GameGlobal.logger.warn('奖励标签圆角绘制失败', { error: rectError.message }, 'toolAssemblyNav');
      }
    }
    
    // 绘制奖励文本和数值（添加"奖励:"前缀，现代化字体）
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`奖励:${reward}`, x + tagWidth / 2, y - tagHeight / 2);
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
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('加载中', x + width / 2, y + height / 2);
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
    const startY = SCREEN_HEIGHT - 150; // 从-140调整到-150，为更大卡片留出更多空间
    const stepWidth = 200; // 从180进一步增加到200，卡片再次变大
    const spacing = 65; // 从55进一步增加到65，间距再次变宽
    const totalWidth = this.steps.length * stepWidth + (this.steps.length - 1) * spacing;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    // 移除虚线边框，保持简洁的设计

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
      
      // 使用绿色圆角卡片样式，再次增大高度
      const cardHeight = 105; // 从95进一步增加到105，适配200px宽度的更大卡片
      const borderRadius = 22; // 适当增大圆角，与卡片尺寸协调
      
      // 背景颜色 - 统一使用绿色背景，文字改为正文颜色
      let bgColor, textColor;
      if (isCompleted) {
        bgColor = '#d9f7be'; // 浅绿色背景
        textColor = '#333333'; // 正文颜色 - 深灰色
      } else if (isCurrent) {
        bgColor = '#d9f7be'; // 当前步骤也使用绿色背景
        textColor = '#333333'; // 正文颜色 - 深灰色
      } else {
        bgColor = '#f0f0f0'; // 锁定状态使用灰色背景
        textColor = '#999999'; // 锁定状态保持灰色文字
      }
      
      // 绘制圆角卡片背景
      ctx.fillStyle = bgColor;
      try {
        this.drawSimpleRoundedRect(ctx, x, y, width, cardHeight, borderRadius);
        ctx.fill();
      } catch (rectError) {
        ctx.fillRect(x, y, width, cardHeight);
      }
      
      // 步骤标题（第一行） - 现代化字体，较小
      ctx.fillStyle = textColor;
      ctx.font = '12px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(step.title, x + width / 2, y + 35); // 从y+30调整到y+35，适配105px高度

      // 步骤名称（第二行） - 现代化字体，比第一行大且加黑
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
      ctx.fillText(step.name, x + width / 2, y + 70); // 从y+65调整到y+70，适配105px高度

      // 状态图标
      if (isCompleted) {
        // 已完成图标 - 使用finish.png图片，适配更大卡片
        const iconSize = 28; // 从24增加到28，图标尺寸更大
        const iconX = x + width - iconSize - 10; // 右上角位置，增加到10px边距
        const iconY = y + 10; // 顶部增加到10px边距
        
        if (this.finishIconLoaded && this.finishIcon) {
          try {
            ctx.drawImage(this.finishIcon, iconX, iconY, iconSize, iconSize);
          } catch (drawError) {
            // 图片绘制失败，使用备用方案
            this.drawFallbackCompletedIcon(ctx, x + width - 15, y + 15);
          }
        } else {
          // 图片未加载，使用备用方案
          this.drawFallbackCompletedIcon(ctx, x + width - 15, y + 15);
        }
      } else if (isLocked) {
        // 锁定图标 - 使用lock.png图片，适配更大卡片
        const iconSize = 28; // 从24增加到28，图标尺寸更大
        const iconX = x + width - iconSize - 10; // 右上角位置，增加到10px边距
        const iconY = y + 10; // 顶部增加到10px边距
        
        if (this.lockIconLoaded && this.lockIcon) {
          try {
            ctx.drawImage(this.lockIcon, iconX, iconY, iconSize, iconSize);
          } catch (drawError) {
            // 图片绘制失败，使用备用方案
            this.drawFallbackLockedIcon(ctx, x + width - 15, y + 15);
          }
        } else {
          // 图片未加载，使用备用方案
          this.drawFallbackLockedIcon(ctx, x + width - 15, y + 15);
        }
      }
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染进度步骤失败', { error: error.message, step: step.name }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 绘制备用已完成图标
   */
  drawFallbackCompletedIcon(ctx, x, y) {
    ctx.fillStyle = '#52c41a';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', x, y);
  }

  /**
   * 绘制备用锁定图标
   */
  drawFallbackLockedIcon(ctx, x, y) {
    ctx.fillStyle = '#bfbfbf';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', x, y);
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
   * 处理触摸事件（保持兼容性）
   */
  handleTouch(event) {
    // 将处理逻辑委托给touchEnd，保持与现有PageManager的兼容性
    this.handleTouchEnd(event);
  }

  /**
   * 导航到指定卡片（添加动画支持）
   */
  navigateToCard(direction) {
    const newIndex = this.selectedToolIndex + direction;
    if (newIndex >= 0 && newIndex < this.tools.length) {
      const oldIndex = this.selectedToolIndex;
      this.selectedToolIndex = newIndex;
      
      // 触发平滑切换动画
      this.animateCardTransition(oldIndex, newIndex);
      
      if (GameGlobal.logger) {
        GameGlobal.logger.info(`切换到卡片: ${this.tools[this.selectedToolIndex].name}`, 
          { oldIndex, newIndex, direction }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 卡片切换动画
   */
  animateCardTransition(fromIndex, toIndex) {
    // 这里可以添加更复杂的动画效果
    // 目前使用简单的即时切换，未来可以集成动画管理器
    if (GameGlobal.animationManager) {
      try {
        // 创建简单的切换动画效果
        const animationData = {
          type: 'cardSwitch',
          fromIndex,
          toIndex,
          duration: 200, // 200ms动画时长
          easing: 'ease-out'
        };
        
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('开始卡片切换动画', animationData, 'toolAssemblyNav');
        }
        
        // TODO: 集成到动画管理器中
      } catch (error) {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('卡片动画创建失败', { error: error.message }, 'toolAssemblyNav');
        }
      }
    }
  }

  /**
   * 处理卡片点击
   */
  handleCardClick(tool) {
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`点击农具卡片: ${tool.name}`, { 
        toolId: tool.id, 
        unlocked: tool.unlocked 
      }, 'toolAssemblyNav');
    }
    
    if (tool.unlocked) {
      // TODO: 实现跳转到具体的农具拼装场景
      console.log(`开始 ${tool.name} 的拼装教程`);
      // GameGlobal.pageManager.switchToPage('toolAssemblyScene', { toolData: tool });
    } else {
      console.log(`${tool.name} 尚未解锁`);
    }
  }

  /**
   * 处理触摸开始事件
   */
  handleTouchStart(event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }
    
    const touch = event.touches[0];
    this.swipeStartX = touch.clientX;
    this.swipeStartTime = Date.now();
    this.isSwipeInProgress = true;
    this.isDragging = false; // 区分滑动和拖拽
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug('触摸开始', { x: this.swipeStartX }, 'toolAssemblyNav');
    }
  }

  /**
   * 处理触摸移动事件
   */
  handleTouchMove(event) {
    if (!this.isSwipeInProgress || !event.touches || event.touches.length === 0) {
      return;
    }
    
    const currentTouch = event.touches[0];
    const deltaX = currentTouch.clientX - this.swipeStartX;
    const deltaTime = Date.now() - this.swipeStartTime;
    
    // 只有移动距离超过一定阈值才认为是滑动
    if (Math.abs(deltaX) > 10) {
      this.isDragging = true;
      
      // 防止页面滚动（微信小游戏兼容性处理）
      try {
        if (event.preventDefault && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
      } catch (error) {
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('preventDefault不支持', { error: error.message }, 'toolAssemblyNav');
        }
      }
      
      if (GameGlobal.logger) {
        GameGlobal.logger.debug('触摸移动', { deltaX, deltaTime }, 'toolAssemblyNav');
      }
    }
  }

  /**
   * 处理触摸结束事件
   */
  handleTouchEnd(event) {
    if (!this.isSwipeInProgress) {
      return;
    }
    
    const endTime = Date.now();
    const totalTime = endTime - this.swipeStartTime;
    const endX = event.changedTouches ? event.changedTouches[0].clientX : this.swipeStartX;
    const totalDeltaX = endX - this.swipeStartX;
    const velocity = Math.abs(totalDeltaX) / totalTime; // 像素/毫秒
    
    this.isSwipeInProgress = false;
    
    if (GameGlobal.logger) {
      GameGlobal.logger.debug('触摸结束', { 
        totalDeltaX, 
        totalTime, 
        velocity, 
        isDragging: this.isDragging 
      }, 'toolAssemblyNav');
    }
    
    // 判断是否为有效滑动
    if (this.isDragging && 
        (Math.abs(totalDeltaX) > this.swipeThreshold || velocity > this.swipeVelocityThreshold)) {
      
      // 根据滑动方向切换卡片
      if (totalDeltaX > 0) {
        // 向右滑动，显示上一张卡片
        this.navigateToCard(-1);
      } else {
        // 向左滑动，显示下一张卡片
        this.navigateToCard(1);
      }
    } else if (!this.isDragging) {
      // 如果不是滑动，则处理点击事件
      this.handleTouchTap(endX, event.changedTouches ? event.changedTouches[0].clientY : 0);
    }
    
    this.isDragging = false;
  }

  /**
   * 处理点击事件
   */
  handleTouchTap(x, y) {
    // 检查返回按钮
    const distance = Math.sqrt((x - 40) * (x - 40) + (y - 40) * (y - 40));
    if (distance <= 20) {
      GameGlobal.pageManager.goBack();
      return;
    }

    // 检查堆叠卡片点击 - 使用更新后的位置计算
    const centerX = SCREEN_WIDTH / 2;
    const availableTop = 80;
    const availableBottom = SCREEN_HEIGHT - 120;
    const centerY = (availableTop + availableBottom) / 2; // 使用与渲染相同的位置计算
    
    // 检查左右导航区域
    if (y >= centerY - this.cardHeight / 2 && y <= centerY + this.cardHeight / 2) {
      if (x < centerX - this.cardWidth / 4) {
        // 点击左侧，切换到上一张卡片
        this.navigateToCard(-1);
        return;
      } else if (x > centerX + this.cardWidth / 4) {
        // 点击右侧，切换到下一张卡片
        this.navigateToCard(1);
        return;
      }
    }
    
    // 检查中心卡片点击（确保点击的是中央卡片）
    if (x >= centerX - this.cardWidth / 2 && x <= centerX + this.cardWidth / 2 &&
        y >= centerY - this.cardHeight / 2 && y <= centerY + this.cardHeight / 2) {
      const centerTool = this.tools[this.selectedToolIndex];
      if (centerTool) {
        this.handleCardClick(centerTool);
        if (GameGlobal.logger) {
          GameGlobal.logger.info(`点击中央卡片: ${centerTool.name}`, { 
            selectedIndex: this.selectedToolIndex 
          }, 'toolAssemblyNav');
        }
      }
    }
  }

  /**
   * 更新页面状态
   */
  update() {
    // 页面更新逻辑
  }
} 