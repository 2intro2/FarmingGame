import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import BasePage from './BasePage';
import Toast from '../components/Toast';

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
  steps = []; // 步骤状态将在构造函数中动态计算
  
  // 状态相关属性
  toolQylStatus = 0; // 存储中的tool_qyl状态值 (0,1,2,3)
  starStatusImage = null; // star_status.png图片对象
  starStatusImageLoaded = false; // 状态图片是否加载完成
  
  // 状态图片位置配置 - 四个位置供用户指定 (相对于底部导航栏背景的位置)
  starStatusPositions = [
    { x: 0.2, y: 0.3 }, 
    { x: 0.8, y: 0.3 }, 
    { x: 0.2, y: 0.7 }, 
    { x: 0.8, y: 0.7 }  
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
   * 检查第一步是否完成（模拟函数，实际由同事实现）
   * @returns {boolean} 第一步是否完成
   */
  checkStep1Completed() {
    // 模拟逻辑：这里可以根据需要返回不同值来测试
    // 实际实现时这里会调用同事提供的函数
    return true; // 模拟第一步已完成，可改为false测试
  }

  /**
   * 检查第二步是否完成（模拟函数，实际由同事实现）
   * @returns {boolean} 第二步是否完成
   */
  checkStep2Completed() {
    // 模拟逻辑：这里可以根据需要返回不同值来测试
    // 实际实现时这里会调用同事提供的函数
    return false; // 模拟第二步未完成，可改为true测试
  }

  /**
   * 检查第三步是否完成（模拟函数，实际由同事实现）
   * @returns {boolean} 第三步是否完成
   */
  checkStep3Completed() {
    // 模拟逻辑：这里可以根据需要返回不同值来测试
    // 实际实现时这里会调用同事提供的函数
    return false; // 模拟第三步未完成，可改为true测试
  }

  /**
   * 动态计算步骤状态
   * 根据步骤完成情况返回正确的状态和文案
   */
  calculateStepStatus() {
    const step1Completed = this.checkStep1Completed();
    const step2Completed = this.checkStep2Completed();
    const step3Completed = this.checkStep3Completed();

    // 根据完成状态计算每个步骤的状态
    let step1Status, step2Status, step3Status;
    let step1Title, step2Title, step3Title;

    if (!step1Completed) {
      // 第一步未完成：第一步进行中，其余待解锁
      step1Status = 'current';
      step1Title = '第一步 (进行中)';
      step2Status = 'locked';
      step2Title = '第二步 (待解锁)';
      step3Status = 'locked';
      step3Title = '第三步 (待解锁)';
    } else if (step1Completed && !step2Completed) {
      // 第一步完成，第二步未完成：第一步已完成，第二步进行中，第三步待解锁
      step1Status = 'completed';
      step1Title = '第一步 (已完成)';
      step2Status = 'current';
      step2Title = '第二步 (进行中)';
      step3Status = 'locked';
      step3Title = '第三步 (待解锁)';
    } else if (step1Completed && step2Completed && !step3Completed) {
      // 前两步完成，第三步未完成：前两步已完成，第三步进行中
      step1Status = 'completed';
      step1Title = '第一步 (已完成)';
      step2Status = 'completed';
      step2Title = '第二步 (已完成)';
      step3Status = 'current';
      step3Title = '第三步 (进行中)';
    } else {
      // 全部完成：所有步骤都已完成
      step1Status = 'completed';
      step1Title = '第一步 (已完成)';
      step2Status = 'completed';
      step2Title = '第二步 (已完成)';
      step3Status = 'completed';
      step3Title = '第三步 (已完成)';
    }

    // 返回更新后的步骤数组
    return [
      { id: 'step1', name: '观看视频', status: step1Status, title: step1Title },
      { id: 'step2', name: '基础认知', status: step2Status, title: step2Title },
      { id: 'step3', name: '立体组装', status: step3Status, title: step3Title }
    ];
  }

  /**
   * 更新步骤状态
   * 重新计算并更新步骤状态
   */
  updateStepStatus() {
    this.steps = this.calculateStepStatus();
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info('步骤状态已更新', { 
        step1: this.steps[0].status,
        step2: this.steps[1].status,
        step3: this.steps[2].status
      }, 'toolAssemblyNav');
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
        image: 'images/card_qyl.png',
        unlocked: true,
        completed: false
      },
      {
        id: 'stone_mill', 
        name: '石磨',
        image: 'images/card_sm.png',
        unlocked: false, // 设置为未解锁状态
        completed: false
      },
      {
        id: 'water_wheel',
        name: '水车',
        image: 'images/card_sc.png',
        unlocked: false, // 设置为未解锁状态
        completed: false
      }
    ];
  }

  /**
   * 初始化布局参数
   */
  initLayout() {
    // 计算可用空间
    const availableHeight = SCREEN_HEIGHT - 200;
    const availableWidth = SCREEN_WIDTH - 40;
    
    // 卡片布局参数 - 增大卡片尺寸
    this.cardWidth = Math.min(900, availableWidth); // 从750增加到900
    this.cardHeight = Math.min(600, availableHeight * 0.9); // 从450增加到600，占用空间从85%增加到90%
    this.cardSpacing = 60;
    this.stackOffset = 130;
    this.scaleRatio = 0.75;
    this.maxVisibleCards = 2;
    
    // 滑动手势参数
    this.swipeThreshold = 50;
    this.swipeVelocityThreshold = 0.3;
    this.isSwipeInProgress = false;
    this.swipeStartX = 0;
    this.swipeStartTime = 0;
  }

  /**
   * 加载导航栏图片
   */
  loadNavImages() {
    // 加载返回按钮图片
    try {
      this.backIcon = wx.createImage();
      this.backIcon.onload = () => {
        this.backIconLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('返回按钮图片加载成功: back.png', null, 'toolAssemblyNav');
        }
      };
      this.backIcon.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('返回按钮图片加载失败: back.png', null, 'toolAssemblyNav');
        }
        this.backIconLoaded = false;
      };
      this.backIcon.src = 'images/back.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('返回按钮图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.backIconLoaded = false;
    }

    // 加载标题图片
    try {
      this.titleImage = wx.createImage();
      this.titleImage.onload = () => {
        this.titleImageLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('标题图片加载成功: title.png', null, 'toolAssemblyNav');
        }
      };
      this.titleImage.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('标题图片加载失败: title.png', null, 'toolAssemblyNav');
        }
        this.titleImageLoaded = false;
      };
      this.titleImage.src = 'images/title.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('标题图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.titleImageLoaded = false;
    }

    // 加载主背景图片
    try {
      this.backgroundImage = wx.createImage();
      this.backgroundImage.onload = () => {
        this.backgroundImageLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('主背景图片加载成功: background.png', null, 'toolAssemblyNav');
        }
      };
      this.backgroundImage.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('主背景图片加载失败: background.png', null, 'toolAssemblyNav');
        }
        this.backgroundImageLoaded = false;
      };
      this.backgroundImage.src = 'images/background.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('主背景图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.backgroundImageLoaded = false;
    }

    // 加载工具区域背景图片
    try {
      this.toolBackgroundImage = wx.createImage();
      this.toolBackgroundImage.onload = () => {
        this.toolBackgroundImageLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('工具背景图片加载成功: bg_tool.png', null, 'toolAssemblyNav');
        }
      };
      this.toolBackgroundImage.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('工具背景图片加载失败: bg_tool.png', null, 'toolAssemblyNav');
        }
        this.toolBackgroundImageLoaded = false;
      };
      this.toolBackgroundImage.src = 'images/bg_tool.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('工具背景图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.toolBackgroundImageLoaded = false;
    }

    // 加载底部导航栏背景图片
    try {
      this.bottomNavBgImage = wx.createImage();
      this.bottomNavBgImage.onload = () => {
        this.bottomNavBgImageLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('底部导航栏背景图片加载成功: bottom_nav_bg.png', null, 'toolAssemblyNav');
        }
      };
      this.bottomNavBgImage.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('底部导航栏背景图片加载失败: bottom_nav_bg.png', null, 'toolAssemblyNav');
        }
        this.bottomNavBgImageLoaded = false;
      };
      this.bottomNavBgImage.src = 'images/bottom_nav_bg.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('底部导航栏背景图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.bottomNavBgImageLoaded = false;
    }

    // 加载状态图片
    try {
      this.starStatusImage = wx.createImage();
      this.starStatusImage.onload = () => {
        this.starStatusImageLoaded = true;
        if (GameGlobal.logger) {
          GameGlobal.logger.info('状态图片加载成功: star_status.png', null, 'toolAssemblyNav');
        }
      };
      this.starStatusImage.onerror = () => {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('状态图片加载失败: star_status.png', null, 'toolAssemblyNav');
        }
        this.starStatusImageLoaded = false;
      };
      this.starStatusImage.src = 'images/star_status.png';
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('状态图片加载异常', { error: error.message }, 'toolAssemblyNav');
      }
      this.starStatusImageLoaded = false;
    }
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载导航栏图片
    this.loadNavImages();
    
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
      
      // 绘制背景 - 优先使用背景图片，否则使用白色背景
      this.renderBackground(ctx);
      
      // 绘制工具区域背景 - 在主背景之上，UI元素之下
      this.renderToolBackground(ctx);
      
      this.renderTopNav(ctx);
      this.renderToolCards(ctx);
      this.renderBottomNavBg(ctx);
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
    // 不再绘制独立的白色背景，让全局背景图片显示在标题栏

    // 返回按钮 - 使用图片或降级到原始按钮
    const buttonX = 40;
    const buttonY = 40;
    const buttonSize = 48; // 适当的按钮尺寸
    
    if (this.backIconLoaded && this.backIcon) {
      // 使用图片渲染返回按钮
      try {
        ctx.drawImage(
          this.backIcon, 
          buttonX - buttonSize/2, 
          buttonY - buttonSize/2, 
          buttonSize, 
          buttonSize
        );

      } catch (drawError) {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('返回按钮图片渲染失败，使用降级方案', { error: drawError.message }, 'toolAssemblyNav');
        }
        this.renderFallbackBackButton(ctx, buttonX, buttonY);
      }
    } else {
      // 降级方案：使用原始的圆形绿色按钮
      this.renderFallbackBackButton(ctx, buttonX, buttonY);
    }

    // 标题 - 使用图片或降级到文字
    const titleX = 80;
    const titleY = 40;
    
    if (this.titleImageLoaded && this.titleImage) {
      // 使用图片渲染标题
      try {
        // 计算图片尺寸，保持比例，适当放大以增强视觉效果
        const maxHeight = 64; // 增大标题图片尺寸，提升视觉效果
        const titleImageRatio = this.titleImage.naturalWidth / this.titleImage.naturalHeight;
        const titleImageHeight = Math.min(maxHeight, this.titleImage.naturalHeight);
        const titleImageWidth = titleImageHeight * titleImageRatio;
        
        ctx.drawImage(
          this.titleImage,
          titleX,
          titleY - titleImageHeight/2,
          titleImageWidth,
          titleImageHeight
        );
        

      } catch (drawError) {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('标题图片渲染失败，使用降级方案', { error: drawError.message }, 'toolAssemblyNav');
        }
        this.renderFallbackTitle(ctx, titleX, titleY);
      }
    } else {
      // 降级方案：使用原始的文字标题
      this.renderFallbackTitle(ctx, titleX, titleY);
    }
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
    
    // 定义三个固定位置：左、中、右
    const leftX = centerX - this.cardWidth / 2 - 150;   // 左侧位置
    const centerCardX = centerX - this.cardWidth / 2;   // 中央位置
    const rightX = centerX - this.cardWidth / 2 + 150;  // 右侧位置
    const fixedPositions = [leftX, centerCardX, rightX];
    
    // 创建卡片渲染队列
    const cardsToRender = [];
    
    // 始终显示三张卡片，分别在三个固定位置
    for (let positionIndex = 0; positionIndex < 3; positionIndex++) {
      // 计算当前位置应该显示的工具索引
      const toolIndex = (this.selectedToolIndex - 1 + positionIndex + this.tools.length) % this.tools.length;
      const tool = this.tools[toolIndex];
      
      if (!tool) continue;
      
      const isActive = positionIndex === 1; // 中间位置为活跃状态
      const cardX = fixedPositions[positionIndex];
      const cardY = centerY - this.cardHeight / 2;
      const scale = isActive ? 1.0 : this.scaleRatio;
      const zIndex = isActive ? 2 : (positionIndex === 0 ? 1 : 0); // 中央最高，左侧次之，右侧最低
      
      cardsToRender.push({
        tool,
        cardX,
        cardY,
        scale,
        isActive,
        zIndex,
        positionIndex // 记录位置索引
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
      // 应用透明度（非活跃卡片降低透明度）
      if (!isActive) {
        ctx.globalAlpha = 0.7; // 非活跃卡片透明度70%
      }
      
      // 应用缩放变换
      ctx.translate(x + this.cardWidth / 2, y + this.cardHeight / 2);
      ctx.scale(scale, scale);
      ctx.translate(-this.cardWidth / 2, -this.cardHeight / 2);
      
      // 绘制卡片阴影（仅对活跃卡片）
      if (isActive) {
      ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
      }
      
      // 绘制卡片图片
      if (tool.imageLoaded && !tool.usePlaceholder && tool.imageElement) {
        try {
          // 保持图片原始比例，避免拉伸变形
          const imgWidth = tool.imageElement.naturalWidth;
          const imgHeight = tool.imageElement.naturalHeight;
          const imgRatio = imgWidth / imgHeight;
          const cardRatio = this.cardWidth / this.cardHeight;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgRatio > cardRatio) {
            // 图片更宽，按卡片宽度缩放
            drawWidth = this.cardWidth;
            drawHeight = this.cardWidth / imgRatio;
            drawX = 0;
            drawY = (this.cardHeight - drawHeight) / 2; // 垂直居中
        } else {
            // 图片更高，按卡片高度缩放
            drawHeight = this.cardHeight;
            drawWidth = this.cardHeight * imgRatio;
            drawX = (this.cardWidth - drawWidth) / 2; // 水平居中
            drawY = 0;
          }
          
          ctx.drawImage(
            tool.imageElement,
            drawX, drawY, // 目标位置
            drawWidth, drawHeight // 目标尺寸
          );
          
          if (GameGlobal.logger && isActive) {
            GameGlobal.logger.info(`卡片图片渲染成功: ${tool.name}`, {
              image: tool.image,
              cardWidth: this.cardWidth,
              cardHeight: this.cardHeight
            }, 'toolAssemblyNav');
          }
        } catch (drawError) {
          if (GameGlobal.logger) {
            GameGlobal.logger.warn(`卡片图片渲染失败: ${tool.name}`, { 
              error: drawError.message,
              image: tool.image
            }, 'toolAssemblyNav');
          }
          // 绘制占位符
          this.renderCardPlaceholder(ctx, tool);
        }
        } else {
        // 绘制占位符
        this.renderCardPlaceholder(ctx, tool);
      }
      
      // 恢复阴影设置
      if (isActive) {
        ctx.restore();
      }


      
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染堆叠卡片失败', { error: error.message, tool: tool.name }, 'toolAssemblyNav');
      }
    }
    
    ctx.restore();
  }

  /**
   * 简化的圆角矩形绘制（最大兼容性）
   */
  drawSimpleRoundedRect(ctx, x, y, width, height, radius) {
    // 限制圆角半径，确保不会过大
    const maxRadius = Math.min(width / 2, height / 2);
    const r = Math.min(Math.max(0, radius), maxRadius);
    
    
    
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
   * 渲染底部导航栏背景图片
   */
  renderBottomNavBg(ctx) {
    try {
      if (this.bottomNavBgImageLoaded && this.bottomNavBgImage) {
        // 获取图片原始尺寸
        const imgOriginalWidth = this.bottomNavBgImage.naturalWidth || this.bottomNavBgImage.width;
        const imgOriginalHeight = this.bottomNavBgImage.naturalHeight || this.bottomNavBgImage.height;
        
        if (imgOriginalWidth && imgOriginalHeight) {
          // 计算底部导航栏区域 - 增大宽度和高度
          const maxNavHeight = 160; // 从120增加到160，高度适当变高
          const maxNavWidth = Math.min(SCREEN_WIDTH * 0.95, 800); // 从90%/600px增加到95%/800px，宽度变长
          
          // 计算缩放比例，保持宽高比
          const scaleX = maxNavWidth / imgOriginalWidth;
          const scaleY = maxNavHeight / imgOriginalHeight;
          const scale = Math.min(scaleX, scaleY); // 使用较小的缩放比例确保图片完全显示
          
          // 计算实际渲染尺寸
          const renderWidth = imgOriginalWidth * scale;
          const renderHeight = imgOriginalHeight * scale;
          
          // 计算居中位置 - 向上移动
          const navY = SCREEN_HEIGHT - maxNavHeight - 40; // 从20px增加到40px，图片向上移动
          const navX = (SCREEN_WIDTH - renderWidth) / 2; // 水平居中
          
          // 绘制底部导航栏背景图片，保持宽高比和清晰度
          ctx.drawImage(
            this.bottomNavBgImage,
            navX, navY, // 居中位置
            renderWidth, renderHeight // 保持比例的尺寸
          );
          
          // 渲染状态图片
          this.renderStarStatus(ctx, navX, navY, renderWidth, renderHeight);
          
          if (GameGlobal.logger) {
            GameGlobal.logger.debug('底部导航栏背景图片渲染成功', {
              originalSize: `${imgOriginalWidth}x${imgOriginalHeight}`,
              renderSize: `${Math.round(renderWidth)}x${Math.round(renderHeight)}`,
              position: `${Math.round(navX)}, ${Math.round(navY)}`,
              scale: scale.toFixed(3),
              toolQylStatus: this.toolQylStatus
            }, 'toolAssemblyNav');
          }
        } else {
          if (GameGlobal.logger) {
            GameGlobal.logger.warn('无法获取底部导航栏背景图片尺寸', null, 'toolAssemblyNav');
          }
        }
      } else {
        // 图片未加载成功，使用备用方案（暂时为空，因为用户要求完全删除原有导航栏）
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('底部导航栏背景图片未加载，跳过渲染', null, 'toolAssemblyNav');
        }
      }
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染底部导航栏背景失败', { error: error.message }, 'toolAssemblyNav');
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
   * 处理触摸事件（保持兼容性）
   */
  handleTouch(event) {
    // 将处理逻辑委托给touchEnd，保持与现有PageManager的兼容性
    this.handleTouchEnd(event);
  }

  /**
   * 导航到指定卡片（循环滑动支持）
   */
  navigateToCard(direction) {
    const oldIndex = this.selectedToolIndex;
    
    // 使用模运算实现循环滑动
    let newIndex = this.selectedToolIndex + direction;
    
    // 处理正向越界：第三张 -> 第一张
    if (newIndex >= this.tools.length) {
      newIndex = 0;
    }
    // 处理负向越界：第一张 -> 第三张
    else if (newIndex < 0) {
      newIndex = this.tools.length - 1;
    }
    
    this.selectedToolIndex = newIndex;
    
    // 触发平滑切换动画
    this.animateCardTransition(oldIndex, newIndex);
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`循环切换到卡片: ${this.tools[this.selectedToolIndex].name}`, 
        { oldIndex, newIndex, direction, isCircular: oldIndex === 0 && newIndex === 2 || oldIndex === 2 && newIndex === 0 }, 'toolAssemblyNav');
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
      // 第一张卡片（曲辕犁）- 跳转到指定页面
      if (tool.id === 'quyuan_plow') {
        // TODO: 替换为实际的页面名称和参数
        // 参数说明：
        // - 第一个参数：目标页面名称（字符串），例如：'ToolAssemblyDetailPage'
        // - 第二个参数：传递的数据对象，例如：{ toolData: tool, level: 1 }
        console.log(`跳转到 ${tool.name} 的拼装页面`);
        
        // 示例跳转代码（需要根据实际页面名称替换）：
        // GameGlobal.pageManager.switchToPage('TARGET_PAGE_NAME', { 
        //   toolData: tool,
        //   // 可以添加其他需要传递的参数
        //   level: 1,
        //   difficulty: 'normal'
        // });
        
        if (GameGlobal.logger) {
          GameGlobal.logger.info(`${tool.name} 页面跳转触发`, { toolId: tool.id }, 'toolAssemblyNav');
        }
      }
    } else {
      // 后两张卡片（石磨、水车）- 显示未解锁Toast
      Toast.show('功能未解锁，敬请期待～', { duration: 2000 });
      
      if (GameGlobal.logger) {
        GameGlobal.logger.info(`${tool.name} 功能未解锁`, { toolId: tool.id }, 'toolAssemblyNav');
      }
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

  /**
   * 页面显示时调用
   */
  onShow() {
    super.onShow();
    
    // 读取微信存储中的tool_qyl状态
    this.loadToolQylStatus();
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info('农具拼装导航页显示', null, 'toolAssemblyNav');
    }
  }

  /**
   * 读取tool_qyl状态值
   */
  loadToolQylStatus() {
    try {
      wx.getStorage({
        key: 'tool_qyl',
        success: (res) => {
          const status = parseInt(res.data);
          if (status >= 0 && status <= 3) {
            this.toolQylStatus = status;
            if (GameGlobal.logger) {
              GameGlobal.logger.info('tool_qyl状态读取成功', { status: this.toolQylStatus }, 'toolAssemblyNav');
            }
          } else {
            // 状态值超出范围，使用默认值0
            this.toolQylStatus = 0;
            if (GameGlobal.logger) {
              GameGlobal.logger.warn('tool_qyl状态值超出范围，使用默认值', { 
                originalValue: res.data, 
                defaultValue: this.toolQylStatus 
              }, 'toolAssemblyNav');
            }
          }
        },
        fail: (error) => {
          // 读取失败，使用默认值0
          this.toolQylStatus = 0;
          if (GameGlobal.logger) {
            GameGlobal.logger.warn('tool_qyl状态读取失败，使用默认值', { 
              error: error.errMsg, 
              defaultValue: this.toolQylStatus 
            }, 'toolAssemblyNav');
          }
        }
      });
    } catch (error) {
      // 异常情况，使用默认值0
      this.toolQylStatus = 0;
      if (GameGlobal.logger) {
        GameGlobal.logger.error('tool_qyl状态读取异常，使用默认值', { 
          error: error.message, 
          defaultValue: this.toolQylStatus 
        }, 'toolAssemblyNav');
      }
    }
    
    // 临时强制设置状态值为0，用于测试位置变化
    // TODO: 测试完成后请删除此行
    this.toolQylStatus = 0;
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info('临时强制设置toolQylStatus=0，用于测试位置变化', { 
        finalStatus: this.toolQylStatus 
      }, 'toolAssemblyNav');
    }
  }

  /**
   * 页面隐藏时调用
   */
  onHide() {
    super.onHide();
    if (GameGlobal.logger) {
      GameGlobal.logger.info('农具拼装导航页隐藏', null, 'toolAssemblyNav');
    }
  }

  /**
   * 渲染备用返回按钮（图片加载失败时使用）
   */
  renderFallbackBackButton(ctx, buttonX, buttonY) {
    const buttonRadius = 24;
    
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
    gradient.addColorStop(0, '#4DD58A');
    gradient.addColorStop(0.3, '#2DD071');
    gradient.addColorStop(0.7, '#19C472');
    gradient.addColorStop(1, '#15A862');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();

    // 绘制高光效果
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

    // 绘制按钮边框
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 返回箭头
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 绘制箭头主体
    ctx.beginPath();
    ctx.moveTo(buttonX + 8, buttonY);
    ctx.lineTo(buttonX - 6, buttonY);
    ctx.stroke();
    
    // 绘制箭头头部
    ctx.beginPath();
    ctx.moveTo(buttonX - 3, buttonY - 4);
    ctx.lineTo(buttonX - 6, buttonY);
    ctx.lineTo(buttonX - 3, buttonY + 4);
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * 渲染备用标题（图片加载失败时使用）
   */
  renderFallbackTitle(ctx, titleX, titleY) {
    ctx.fillStyle = '#333333';
    ctx.font = '24px "Nunito", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('农具拼装', titleX, titleY);
  }

  /**
   * 渲染背景
   */
  renderBackground(ctx) {
    if (this.backgroundImageLoaded && this.backgroundImage) {
      // 使用背景图片
      try {
        // 计算背景图片尺寸，铺满整个屏幕
        ctx.drawImage(
          this.backgroundImage,
          0,
          0,
          SCREEN_WIDTH,
          SCREEN_HEIGHT
        );
        
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('背景图片渲染成功', {
            screenWidth: SCREEN_WIDTH,
            screenHeight: SCREEN_HEIGHT
          }, 'toolAssemblyNav');
        }
      } catch (drawError) {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('背景图片渲染失败，使用白色背景', { error: drawError.message }, 'toolAssemblyNav');
        }
        this.renderFallbackBackground(ctx);
      }
    } else {
      // 降级方案：使用白色背景
      this.renderFallbackBackground(ctx);
    }
  }

  /**
   * 渲染备用背景（图片加载失败时使用）
   */
  renderFallbackBackground(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /**
   * 渲染工具区域背景
   */
  renderToolBackground(ctx) {
    if (this.toolBackgroundImageLoaded && this.toolBackgroundImage) {
      try {
        // 计算工具区域范围：卡片区域 + 底部导航栏区域
        const topNavHeight = 80; // 顶部导航栏高度
        const toolAreaY = topNavHeight; // 工具区域起始Y坐标
        const toolAreaHeight = SCREEN_HEIGHT - topNavHeight; // 工具区域高度（包含卡片和底部导航）
        
        // 绘制工具背景图片到整个工具区域
        ctx.drawImage(
          this.toolBackgroundImage,
          0, // 源图X
          0, // 源图Y
          this.toolBackgroundImage.naturalWidth, // 源图宽度
          this.toolBackgroundImage.naturalHeight, // 源图高度
          0, // 目标X
          toolAreaY, // 目标Y - 从顶部导航栏下方开始
          SCREEN_WIDTH, // 目标宽度 - 覆盖整个屏幕宽度
          toolAreaHeight // 目标高度 - 覆盖卡片和底部导航区域
        );
        
        if (GameGlobal.logger) {
          GameGlobal.logger.info('工具背景图片渲染成功', {
            toolAreaY,
            toolAreaHeight,
            screenWidth: SCREEN_WIDTH
          }, 'toolAssemblyNav');
        }
      } catch (drawError) {
        if (GameGlobal.logger) {
          GameGlobal.logger.warn('工具背景图片渲染失败', { error: drawError.message }, 'toolAssemblyNav');
        }
        // 工具背景渲染失败时不做任何处理，让主背景显示
      }
    }
    // 如果工具背景未加载，不做任何处理，让主背景显示
  }

  /**
   * 渲染卡片占位符
   */
  renderCardPlaceholder(ctx, tool) {
    // 绘制简单的占位符背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.cardWidth, this.cardHeight);
    
    // 绘制工具名称
    ctx.fillStyle = '#666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tool.name, this.cardWidth / 2, this.cardHeight / 2 - 10);
    
    // 绘制加载提示
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.fillText('图片加载中...', this.cardWidth / 2, this.cardHeight / 2 + 20);
  }

  /**
   * 渲染状态图片
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} bgX - 背景图片X坐标
   * @param {number} bgY - 背景图片Y坐标  
   * @param {number} bgWidth - 背景图片宽度
   * @param {number} bgHeight - 背景图片高度
   */
  renderStarStatus(ctx, bgX, bgY, bgWidth, bgHeight) {
    try {
      // 临时强制设置状态值为0，确保每次渲染都使用位置0
      // TODO: 测试完成后请删除此行
      this.toolQylStatus = 0;
      
      if (this.starStatusImageLoaded && this.starStatusImage) {
        // 获取当前状态对应的位置配置
        if (this.toolQylStatus >= 0 && this.toolQylStatus < this.starStatusPositions.length) {
          const position = this.starStatusPositions[this.toolQylStatus];
          
          // 计算状态图片的实际位置（相对于背景图片）- 进一步增大尺寸
          const starSize = Math.min(bgWidth * 0.2, bgHeight * 0.4, 80); // 状态图片大小：宽度20%/高度40%，最大80px
          const starX = bgX + bgWidth * position.x - starSize / 2; // 以位置为中心
          const starY = bgY + bgHeight * position.y - starSize / 2; // 以位置为中心
          
          // 绘制状态图片
          ctx.drawImage(
            this.starStatusImage,
            starX, starY,
            starSize, starSize
          );
          
          // 直接在控制台输出调试信息，确保用户能看到
          console.log('🌟 状态图片渲染详情:', {
            toolQylStatus: this.toolQylStatus,
            selectedPosition: position,
            '当前位置配置x': position.x,
            '当前位置配置y': position.y,
            allPositions: this.starStatusPositions,
            backgroundArea: `${Math.round(bgX)}, ${Math.round(bgY)}, ${Math.round(bgWidth)}x${Math.round(bgHeight)}`,
            calculatedStarPosition: `${Math.round(starX)}, ${Math.round(starY)}`,
            starSize: Math.round(starSize)
          });
          
          if (GameGlobal.logger) {
            GameGlobal.logger.info('状态图片渲染详情', {
              toolQylStatus: this.toolQylStatus,
              selectedPosition: position,
              allPositions: this.starStatusPositions,
              backgroundArea: `${Math.round(bgX)}, ${Math.round(bgY)}, ${Math.round(bgWidth)}x${Math.round(bgHeight)}`,
              calculatedStarPosition: `${Math.round(starX)}, ${Math.round(starY)}`,
              starSize: Math.round(starSize)
            }, 'toolAssemblyNav');
          }
        } else {
          if (GameGlobal.logger) {
            GameGlobal.logger.warn('tool_qyl状态值超出位置配置范围', { 
              status: this.toolQylStatus,
              maxPositions: this.starStatusPositions.length 
            }, 'toolAssemblyNav');
          }
        }
      } else {
        if (GameGlobal.logger) {
          GameGlobal.logger.debug('状态图片未加载，跳过渲染', { 
            imageLoaded: this.starStatusImageLoaded 
          }, 'toolAssemblyNav');
        }
      }
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.error('渲染状态图片失败', { error: error.message }, 'toolAssemblyNav');
      }
    }
  }
} 