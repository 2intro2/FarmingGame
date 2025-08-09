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
  steps = []; // 步骤状态将在构造函数中动态计算

  constructor() {
    super();
    try {
      this.initTools();
      this.initLayout();
      this.updateStepStatus(); // 初始化时动态计算步骤状态
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
        unlocked: true,
        completed: false
      },
      {
        id: 'water_wheel',
        name: '水车',
        image: 'images/card_sc.png',
        unlocked: true,
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
    
    this.steps = [
      { id: 'step1', name: '观看视频', status: 'completed', title: '第一步 (已完成)' },
      { id: 'step2', name: '基础认知', status: 'current', title: '第二步 (进行中)' },
      { id: 'step3', name: '立体组装', status: 'locked', title: '第三步 (未解锁)' }
    ];
  }

  /**
   * 加载状态图标和导航图片
   */
  loadStatusIcons() {
    // 加载导航栏图片
    this.loadNavImages();
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
      // 每次渲染前更新步骤状态，确保状态是最新的
      this.updateStepStatus();
      
      // 绘制背景 - 优先使用背景图片，否则使用白色背景
      this.renderBackground(ctx);
      
      // 绘制工具区域背景 - 在主背景之上，UI元素之下
      this.renderToolBackground(ctx);
      
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
      
      // 背景颜色 - 三张卡片使用不同的绿色系背景
      let bgColor, textColor;
      if (isCompleted) {
        bgColor = '#f6ffed'; // 第一张卡片：最浅绿色背景
        textColor = '#333333'; // 正文颜色 - 深灰色
      } else if (isCurrent) {
        bgColor = '#d9f7be'; // 第二张卡片：中等绿色背景
        textColor = '#333333'; // 正文颜色 - 深灰色
        } else {
        bgColor = '#b7eb8f'; // 第三张卡片：较深绿色背景
        textColor = '#333333'; // 改为正文颜色，保持一致性
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
        // 已完成图标 - 使用finish.png图片，再次增大尺寸
        const iconSize = 32; // 从28增加到32，图标尺寸再次变大
        const iconX = x + width - iconSize - 12; // 右上角位置，增加到12px边距
        const iconY = y + 12; // 顶部增加到12px边距
        
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
        // 锁定图标 - 使用lock.png图片，再次增大尺寸
        const iconSize = 32; // 从28增加到32，图标尺寸再次变大
        const iconX = x + width - iconSize - 12; // 右上角位置，增加到12px边距
        const iconY = y + 12; // 顶部增加到12px边距
        
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

  /**
   * 页面显示时调用
   */
  onShow() {
    super.onShow();
    // 页面显示时更新步骤状态
    this.updateStepStatus();
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info('农具拼装导航页显示，步骤状态已更新', {
        step1: this.steps[0]?.status,
        step2: this.steps[1]?.status,
        step3: this.steps[2]?.status
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
   * 强制刷新步骤状态
   * 可供外部调用，当知道步骤状态可能发生变化时使用
   */
  refreshStepStatus() {
    this.updateStepStatus();
    
    if (GameGlobal.logger) {
      GameGlobal.logger.info('步骤状态已强制刷新', {
        step1: this.steps[0]?.status,
        step2: this.steps[1]?.status,
        step3: this.steps[2]?.status
      }, 'toolAssemblyNav');
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
} 