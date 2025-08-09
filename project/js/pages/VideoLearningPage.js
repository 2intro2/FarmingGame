import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';
import ImageLoader from '../utils/imageLoader';
import ImageTest from '../utils/imageTest';
import Toast from '../components/Toast';

/**
 * 视频学习页面
 * 包含视频播放器、学习进度和卡片匹配功能
 */
export default class VideoLearningPage {
  video = null;
  videoState = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isFullScreen: false,
    volume: 1,
    lastModuleIndex: -1, // 记录上次的模块索引，用于检测模块切换
    isCompleted: false // 视频是否播放完成
  };

  // 卡片数据
  cards = {
    column1: [
      { id: 'yuan', image: 'images/qylPic1.png', selected: false, permanentlySelected: false, label: '犁辕' },
      { id: 'jian', image: 'images/qylpic2.png', selected: false, permanentlySelected: false, label: '犁箭' },
      { id: 'hua', image: 'images/qylpic3.png', selected: false, permanentlySelected: false, label: '犁铧' }
    ],
    column2: [
      { id: 'liyuan', pinyin: 'lí yuán', chinese: '犁辕', selected: false, permanentlySelected: false, refId: 'yuan' },
      { id: 'lijian', pinyin: 'lí jiàn', chinese: '犁箭', selected: false, permanentlySelected: false, refId: 'jian' },
      { id: 'lihua', pinyin: 'lí huá', chinese: '犁铧', selected: false, permanentlySelected: false, refId: 'hua' }
    ]
  };

  // 确认提交按钮图片
  submitButtonImage = null;
  
  // 返回按钮图片
  backButtonImage = null;

  // 进度条拖动状态
  progressDrag = {
    isDragging: false,
    dragProgress: 0, // 拖动时的临时进度值 (0-1)
    startX: 0,
    startY: 0
  };

  selectedCardIds = {
    column1: null,
    column2: null
  };

  // UI布局参数
  layout = {
    video: {
      x: SCREEN_WIDTH * 0.02,
      y: SCREEN_HEIGHT * 0.12,
      width: SCREEN_WIDTH * 0.65,
      height: SCREEN_WIDTH * 0.65 * (9 / 16) // 16:9比例
    },
    progress: {
      x: SCREEN_WIDTH * 0.02,
      y: SCREEN_HEIGHT * 0.95 * (9 / 16) + SCREEN_HEIGHT * 0.12 + 20,
      width: SCREEN_WIDTH * 0.55,
      height: 30,
    },
    cards: {
      column1: {
        x: SCREEN_WIDTH * 0.68,
        y: SCREEN_HEIGHT * 0.20,
        width: SCREEN_WIDTH * 0.12,
        height: SCREEN_WIDTH * 0.12,
        gap: 15
      },
      column2: {
        x: SCREEN_WIDTH * 0.68 + SCREEN_WIDTH * 0.15 + 20,
        y: SCREEN_HEIGHT * 0.20,
        width: SCREEN_WIDTH * 0.12,
        height: SCREEN_WIDTH * 0.12,
        gap: 15
      }
    },
    submitButton: {
      x: SCREEN_WIDTH * 0.68,
      y: SCREEN_HEIGHT - 200,
      width: SCREEN_WIDTH * 0.3,
      height: 100
    },
    backButton: {
      x: 20,
      y: 20,
      width: 60,
      height: 60
    }
  };

  constructor() {
    // 初始化时重置卡片状态
    this.resetCardStates();
    
    this.loadResources();
    // 延迟初始化视频，只在页面显示时才创建
    
    // 测试图片文件
    this.testImages();
    this.store();
  }

  store(){
    wx.setStorage({
      key:"犁辕",
      data:"liyuan",
    })
    wx.setStorage({
      key:"犁箭",
      data:"lijian"
    })
    wx.setStorage({
      key:"犁铧",
      data:"lihua"
    })
  }

  /**
   * 初始化视频播放器
   */
  initVideo() {
    this.video = wx.createVideo({
      x: this.layout.video.x,
      y: this.layout.video.y,
      width: this.layout.video.width,
      height: this.layout.video.height,
      src: 'https://vdse.bdstatic.com//d3afbab61c9ff23eb2763b42448bf85c.mp4?authorization=bce-auth-v1%2F40f207e648424f47b2e3dfbb1014b1a5%2F2025-07-03T22%3A03%3A09Z%2F-1%2Fhost%2F185763c6468891f73873e7e1eb400846b5d653eb7f03097dddd46e90cc13f52f', // 使用测试视频，实际使用时请替换为真实视频URL
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      showCenterPlayBtn: true,
      showProgress: false,
      objectFit: 'contain',
      enablePlayGesture : true,
      poster: 'images/bg01.jpeg'
    });

    // 绑定视频事件
    this.bindVideoEvents();
  }

  /**
   * 绑定视频事件
   */
  bindVideoEvents() {
    this.video.onPlay(() => {
      this.videoState.isPlaying = true;
      console.log('视频开始播放');
    });

    this.video.onPause(() => {
      this.videoState.isPlaying = false;
      console.log('视频暂停');
    });

    this.video.onEnded(() => {
      this.videoState.isPlaying = false;
      this.videoState.isCompleted = true;
      console.log('视频播放结束，卡片已解锁');
      showToast('视频播放完成，现在可以进行连线了！');
    });

    this.video.onTimeUpdate((res) => {
      this.videoState.currentTime = res.position;
      this.videoState.duration = res.duration;
      
      // 检测模块切换
      this.checkModuleChange();
    //   console.error('视频当前时间:', res.position);
    //   console.error('视频总时长:', res.duration);
      // 实时更新进度显示
      // console.log(`视频进度: ${this.formatTime(res.position)} / ${this.formatTime(res.duration)} (${Math.round((res.position / res.duration) * 100)}%)`);
    });

    this.video.onError((error) => {
      console.error('视频播放错误:', error);
      showErrorToast('视频加载失败');
    });

    // this.video.onFullScreenChange((res) => {
    //   this.videoState.isFullScreen = res.fullScreen;
    //   console.log('全屏状态变化:', res.fullScreen);
    // });
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 预加载卡片图片
    this.cards.column1.forEach(card => {
      this.loadImage(card);
    });
    
    // 加载确认提交按钮图片
    this.loadSubmitButtonImage();
    
    // 加载返回按钮图片
    this.loadBackButtonImage();
  }

  /**
   * 测试图片文件
   */
  testImages() {
    // 测试卡片图片
    const cardImages = this.cards.column1.map(card => card.image);
    // 测试确认提交按钮图片
    cardImages.push('images/confirmSubmission.png');
    // 测试返回按钮图片
    cardImages.push('images/left.png');
    ImageTest.testImages(cardImages);
  }

  /**
   * 加载图片
   */
  loadImage(card) {
    ImageLoader.loadImage(card.image, { timeout: 5000 })
      .then(img => {
        card.imageObj = img;
        card.loaded = true;
      })
      .catch(error => {
        console.warn('图片加载失败:', card.image, error);
        card.loaded = false;
        card.imageObj = null;
      });
  }

  /**
   * 加载确认提交按钮图片
   */
  loadSubmitButtonImage() {
    ImageLoader.loadImage('images/confirmSubmission.png', { timeout: 5000 })
      .then(img => {
        this.submitButtonImage = img;
        console.log('确认提交按钮图片加载成功');
      })
      .catch(error => {
        console.warn('确认提交按钮图片加载失败:', error);
        this.submitButtonImage = null;
      });
  }

  /**
   * 加载返回按钮图片
   */
  loadBackButtonImage() {
    ImageLoader.loadImage('images/left.png', { timeout: 5000 })
      .then(img => {
        this.backButtonImage = img;
        console.log('返回按钮图片加载成功');
      })
      .catch(error => {
        console.warn('返回按钮图片加载失败:', error);
        this.backButtonImage = null;
      });
  }

  /**
   * 渲染页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制背景
    this.renderBackground(ctx);
    
    // 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 绘制学习进度区域
    this.renderProgressSection(ctx);
    
    // 绘制卡片
    this.renderCards(ctx);
    
    // 绘制提交按钮
    this.renderSubmitButton(ctx);
    
    // 渲染Toast提示
    Toast.render(ctx);
  }

  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 整体背景
    ctx.fillStyle = '#E0F2F1';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 左侧面板背景 - 添加圆角
    const leftPanelX = this.layout.video.x;
    const leftPanelY = this.layout.progress.y - 10;
    const leftPanelWidth = this.layout.video.width;
    const leftPanelHeight = SCREEN_HEIGHT - (this.layout.progress.y - 10) - this.layout.video.y;
    
    this.drawRoundedRect(ctx, leftPanelX, leftPanelY, leftPanelWidth, leftPanelHeight, 20, '#C8E6C9', '#A5D6A7', 2);
  }

  /**
   * 绘制圆角矩形带边框
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillColor, strokeColor, strokeWidth) {
    ctx.save();
    
    // 绘制圆角矩形路径
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
    
    // 填充背景
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // 绘制边框
    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * 绘制学习进度区域
   */
  renderProgressSection(ctx) {
    const { x, y, width } = this.layout.progress;
    
    // 绘制标题
    ctx.fillStyle = '#333333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('学习进度', x + width / 2, y + 30);
    
    // 绘制播放进度文字
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    // const currentTime = this.formatTime(this.videoState.position);
    const currentTime = this.videoState.currentTime;
    const duration = this.videoState.duration;
    const progressPercent = this.videoState.duration > 0 ? 
      Math.round((this.videoState.currentTime / this.videoState.duration) * 100) : 0;
    ctx.fillText(`播放进度: ${currentTime} / ${duration} (${progressPercent}%)`, x, y + 70);
    
    // 绘制视频播放进度条
    this.renderVideoProgressBar(ctx, x, y + 75, width);
    
    // 绘制当前学习模块
    const currentModule = this.getCurrentLearningModule();
    if (currentModule) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = '14px Arial';
      ctx.fillText(`当前学习: ${currentModule}`, x, y + 95);
    }
    
    // 绘制学习模块进度条
    this.renderLearningProgress(ctx, x, y + 110);
  }

  /**
   * 绘制学习模块进度条
   */
  renderLearningProgress(ctx, x, y) {
    const moduleNames = ['曲辕犁的历史', '结构组成', '使用技巧'];
    const moduleWidth = (this.layout.progress.width - 40) / 3;
    const moduleHeight = 20;
    
    // 计算视频播放进度百分比
    const videoProgress = this.videoState.duration > 0 ? 
      this.videoState.currentTime / this.videoState.duration : 0;
    
    // 根据视频进度计算各个模块的进度
    const moduleProgress = this.calculateModuleProgress(videoProgress);
    
    moduleNames.forEach((name, index) => {
      const moduleX = x + 20 + index * moduleWidth;
      
      // 绘制背景
      ctx.fillStyle = '#BBDEFB';
      ctx.fillRect(moduleX, y, moduleWidth, moduleHeight);
      
      // 绘制进度
      if (moduleProgress[index] > 0) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(moduleX, y, moduleWidth * moduleProgress[index], moduleHeight);
      }
      
      // 绘制文字
      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, moduleX + moduleWidth / 2, y + moduleHeight + 20);
      
      // 绘制进度百分比
      const progressPercent = Math.round(moduleProgress[index] * 100);
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(`${progressPercent}%`, moduleX + moduleWidth / 2, y + moduleHeight + 40);
    });
  }

  /**
   * 根据视频进度计算各个模块的进度
   * @param {number} videoProgress - 视频播放进度 (0-1)
   * @returns {Array} 各个模块的进度数组
   */
  calculateModuleProgress(videoProgress) {
    // 定义各个模块的时间段（占总视频时长的比例）
    const moduleTimeRanges = [
      { start: 0, end: 0.33 },    // 第一个模块：0-33%
      { start: 0.33, end: 0.66 }, // 第二个模块：33%-66%
      { start: 0.66, end: 1.0 }   // 第三个模块：66%-100%
    ];
    
    return moduleTimeRanges.map(range => {
      if (videoProgress <= range.start) {
        return 0; // 还没到这个模块
      } else if (videoProgress >= range.end) {
        return 1; // 这个模块已完成
      } else {
        // 计算当前模块的进度
        const moduleProgress = (videoProgress - range.start) / (range.end - range.start);
        return Math.min(moduleProgress, 1);
      }
    });
  }

  /**
   * 获取当前学习模块名称
   * @returns {string|null} 当前学习模块名称
   */
  getCurrentLearningModule() {
    const moduleNames = ['曲辕犁的历史', '结构组成', '使用技巧'];
    const videoProgress = this.videoState.duration > 0 ? 
      this.videoState.currentTime / this.videoState.duration : 0;
    
    if (videoProgress <= 0.33) {
      return moduleNames[0];
    } else if (videoProgress <= 0.66) {
      return moduleNames[1];
    } else if (videoProgress <= 1.0) {
      return moduleNames[2];
    }
    
    return null;
  }

  /**
   * 检测模块切换
   */
  checkModuleChange() {
    const videoProgress = this.videoState.duration > 0 ? 
      this.videoState.currentTime / this.videoState.duration : 0;
    
    let currentModuleIndex = -1;
    if (videoProgress <= 0.33) {
      currentModuleIndex = 0;
    } else if (videoProgress <= 0.66) {
      currentModuleIndex = 1;
    } else if (videoProgress <= 1.0) {
      currentModuleIndex = 2;
    }
    
    // 如果模块发生变化，显示提示
    if (currentModuleIndex !== this.videoState.lastModuleIndex && currentModuleIndex !== -1) {
      const moduleNames = ['曲辕犁的历史', '结构组成', '使用技巧'];
      const moduleName = moduleNames[currentModuleIndex];
      console.log(`进入新模块: ${moduleName}`);
      showToast(`进入学习模块: ${moduleName}`);
      this.videoState.lastModuleIndex = currentModuleIndex;
    }
  }

  /**
   * 绘制视频播放进度条
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} width - 宽度
   */
  renderVideoProgressBar(ctx, x, y, width) {
    const barHeight = 12; // 增加高度便于拖动
    
    // 使用拖动进度或实际播放进度
    const progress = this.progressDrag.isDragging ? 
      this.progressDrag.dragProgress : 
      (this.videoState.duration > 0 ? this.videoState.currentTime / this.videoState.duration : 0);
    
    // 绘制进度条背景（扩大可点击区域）
    const trackHeight = barHeight + 8;
    const trackY = y - 4;
    ctx.fillStyle = this.progressDrag.isDragging ? '#F5F5F5' : '#E0E0E0';
    ctx.fillRect(x, trackY, width, trackHeight);
    
    // 绘制进度条主体
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x, y, width, barHeight);
    
    // 绘制进度条填充
    if (progress > 0) {
      ctx.fillStyle = this.progressDrag.isDragging ? '#1976D2' : '#2196F3';
      ctx.fillRect(x, y, width * progress, barHeight);
    }
    
    // 绘制进度条边框
    ctx.strokeStyle = this.progressDrag.isDragging ? '#1976D2' : '#BDBDBD';
    ctx.lineWidth = this.progressDrag.isDragging ? 2 : 1;
    ctx.strokeRect(x, y, width, barHeight);
    
    // 绘制拖动滑块
    if (progress >= 0) {
      const sliderX = x + width * progress;
      const sliderRadius = this.progressDrag.isDragging ? 8 : 6;
      
      // 滑块阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(sliderX + 1, y + barHeight / 2 + 1, sliderRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 滑块主体
      ctx.fillStyle = this.progressDrag.isDragging ? '#1976D2' : '#2196F3';
      ctx.beginPath();
      ctx.arc(sliderX, y + barHeight / 2, sliderRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // 拖动时添加外圈效果
      if (this.progressDrag.isDragging) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // 绘制模块分割线
    const modulePositions = [0.33, 0.66];
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    modulePositions.forEach(pos => {
      const lineX = x + width * pos;
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + barHeight);
      ctx.stroke();
    });
  }

  /**
   * 获取进度条的点击区域
   */
  getProgressBarRect() {
    const { x, y, width } = this.layout.progress;
    const progressY = y + 75; // 对应 renderProgressSection 中调用时的 y + 75
    return {
      x: x,
      y: progressY - 4, // 包含扩展的点击区域
      width: width,
      height: 20 // 扩大的点击高度
    };
  }

  /**
   * 绘制卡片
   */
  renderCards(ctx) {
    // 绘制第一列（图片卡片）
    this.renderImageCards(ctx);
    
    // 绘制第二列（文字卡片）
    this.renderTextCards(ctx);
  }

  /**
   * 绘制图片卡片
   */
  renderImageCards(ctx) {
    const { x, y, width, height, gap } = this.layout.cards.column1;
    const isVideoCompleted = this.videoState.isCompleted;
    
    this.cards.column1.forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      // 判断卡片是否可用（视频完成或已永久选中）
      const isCardEnabled = isVideoCompleted || card.permanentlySelected;
      
      // 绘制卡片背景
      if (card.permanentlySelected) {
        ctx.fillStyle = '#4CAF50'; // 深绿色表示永久选中
      } else if (!isCardEnabled) {
        ctx.fillStyle = '#F5F5F5'; // 灰色表示锁定
      } else {
        ctx.fillStyle = card.selected ? '#A5D6A7' : '#FFFFFF';
      }
      ctx.fillRect(x, cardY, width, height);
      
      // 绘制边框
      if (card.permanentlySelected) {
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
      } else if (!isCardEnabled) {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // 虚线边框表示锁定
      } else {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // 恢复实线
      }
      ctx.strokeRect(x, cardY, width, height);
      ctx.setLineDash([]); // 确保恢复实线
      
      // 如果永久选中，绘制选中指示器
      if (card.permanentlySelected) {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + width - 15, cardY, 15, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', x + width - 7.5, cardY + 7.5);
      }
      
      // 绘制图片
      if (isCardEnabled) {
        ImageLoader.safeDrawImage(
          ctx, 
          card.imageObj, 
          x + 10, 
          cardY + 10, 
          width - 20, 
          height - 20,
          (ctx, x, y, width, height) => {
            this.drawImagePlaceholder(ctx, x, y, width, height, card.label);
          }
        );
      } else {
        // 锁定状态下绘制半透明图片
        ctx.save();
        ctx.globalAlpha = 0.3;
        ImageLoader.safeDrawImage(
          ctx, 
          card.imageObj, 
          x + 10, 
          cardY + 10, 
          width - 20, 
          height - 20,
          (ctx, x, y, width, height) => {
            this.drawImagePlaceholder(ctx, x, y, width, height, card.label);
          }
        );
        ctx.restore();
      }
    });
  }

  /**
   * 绘制图片占位符
   */
  drawImagePlaceholder(ctx, x, y, width, height, label) {
    // 绘制占位符背景
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(x, y, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // 绘制文字
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label || '图片', x + width / 2, y + height / 2);
  }

  /**
   * 绘制文字卡片
   */
  renderTextCards(ctx) {
    const { x, y, width, height, gap } = this.layout.cards.column2;
    const isVideoCompleted = this.videoState.isCompleted;
    
    this.cards.column2.forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      // 判断卡片是否可用（视频完成或已永久选中）
      const isCardEnabled = isVideoCompleted || card.permanentlySelected;
      
      // 绘制卡片背景
      if (card.permanentlySelected) {
        ctx.fillStyle = '#4CAF50'; // 深绿色表示永久选中
      } else if (!isCardEnabled) {
        ctx.fillStyle = '#F5F5F5'; // 灰色表示锁定
      } else {
        ctx.fillStyle = card.selected ? '#A5D6A7' : '#FFFFFF';
      }
      ctx.fillRect(x, cardY, width, height);
      
      // 绘制边框
      if (card.permanentlySelected) {
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
      } else if (!isCardEnabled) {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // 虚线边框表示锁定
      } else {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // 恢复实线
      }
      ctx.strokeRect(x, cardY, width, height);
      ctx.setLineDash([]); // 确保恢复实线
      
      // 如果永久选中，绘制选中指示器
      if (card.permanentlySelected) {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(x + width - 15, cardY, 15, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', x + width - 7.5, cardY + 7.5);
      }
      
      // 绘制文字内容
      if (isCardEnabled) {
        // 绘制拼音
        ctx.fillStyle = card.permanentlySelected ? '#FFFFFF' : '#333333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.pinyin, x + width / 2, cardY + height / 2 - 10);
        
        // 绘制汉字
        ctx.font = '24px Arial';
        ctx.fillText(card.chinese, x + width / 2, cardY + height / 2 + 20);
      } else {
        // 锁定状态下绘制半透明文字
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        // 绘制拼音
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.pinyin, x + width / 2, cardY + height / 2 - 10);
        
        // 绘制汉字
        ctx.font = '24px Arial';
        ctx.fillText(card.chinese, x + width / 2, cardY + height / 2 + 20);
        
        ctx.restore();
      }
    });
  }

  /**
   * 绘制返回按钮
   */
  renderBackButton(ctx) {
    const { x, y, width, height } = this.layout.backButton;
    
    // 如果有返回按钮图片且加载完成，绘制图片
    if (this.backButtonImage && ImageLoader.isValidImage(this.backButtonImage)) {
      try {
        ctx.drawImage(this.backButtonImage, x, y, width, height);
      } catch (error) {
        console.warn('返回按钮图片绘制失败:', error);
        this.renderBackButtonFallback(ctx, x, y, width, height);
      }
    } else {
      // 没有图片或图片加载失败，使用备用按钮
      this.renderBackButtonFallback(ctx, x, y, width, height);
    }
  }

  /**
   * 绘制备用返回按钮（当图片加载失败时）
   */
  renderBackButtonFallback(ctx, x, y, width, height) {
    // 绘制按钮背景
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, width, height);
    
    // 绘制返回箭头
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←', x + width / 2, y + height / 2);
  }

  /**
   * 绘制提交按钮
   */
  renderSubmitButton(ctx) {
    const { x, y, width, height } = this.layout.submitButton;
    
    // 如果有按钮图片且加载完成，绘制图片
    if (this.submitButtonImage && ImageLoader.isValidImage(this.submitButtonImage)) {
      try {
        ctx.drawImage(this.submitButtonImage, x, y, width, height);
      } catch (error) {
        console.warn('确认提交按钮图片绘制失败:', error);
        this.renderSubmitButtonFallback(ctx, x, y, width, height);
      }
    } else {
      // 没有图片或图片加载失败，使用备用按钮
      this.renderSubmitButtonFallback(ctx, x, y, width, height);
    }
  }

  /**
   * 绘制备用提交按钮（当图片加载失败时）
   */
  renderSubmitButtonFallback(ctx, x, y, width, height) {
    // 绘制按钮背景
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, width, height);
    
    // 绘制按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('确认提交', x + width / 2, y + height / 2);
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    this.handleTouchEvent(event, 'touchend');
  }

  /**
   * 处理触摸开始事件
   */
  handleTouchStart(event) {
    this.handleTouchEvent(event, 'touchstart');
  }

  /**
   * 处理触摸移动事件
   */
  handleTouchMove(event) {
    this.handleTouchEvent(event, 'touchmove');
  }

  /**
   * 处理触摸结束事件
   */
  handleTouchEnd(event) {
    this.handleTouchEvent(event, 'touchend');
  }

  /**
   * 统一的触摸事件处理
   */
  handleTouchEvent(event, eventType) {
    const touch = event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0];
    if (!touch) {
      console.log('没有触摸点信息');
      return;
    }
    
    const x = touch.clientX;
    const y = touch.clientY;
    
    console.log(`VideoLearningPage 触摸事件: ${eventType} at (${x}, ${y})`);
    
    // 优先检查进度条拖动
    const progressHandled = this.checkProgressBarDrag(x, y, eventType);
    console.log(`进度条拖动检查结果: ${progressHandled}`);
    
    if (progressHandled) {
      return;
    }
    
    // 仅在触摸结束时处理其他点击事件，避免拖动过程中误触发
    if (eventType === 'touchend') {
      console.log('处理其他点击事件');
      
      // 检查返回按钮点击
      this.checkBackButtonClick(x, y);
      
      // 检查卡片选择
      this.checkCardSelection(x, y);
      
      // 检查提交按钮点击
      this.checkSubmitButtonClick(x, y);
    }
  }

  /**
   * 检查进度条拖动事件
   */
  checkProgressBarDrag(touchX, touchY, eventType) {
    const progressRect = this.getProgressBarRect();
    
    console.log('🎯 进度条拖动检查:', {
      eventType,
      touchPosition: { x: touchX, y: touchY },
      progressRect,
      isDragging: this.progressDrag.isDragging
    });
    
    // 检查是否在进度条区域内或正在拖动中
    const inProgressArea = touchX >= progressRect.x && touchX <= progressRect.x + progressRect.width &&
                          touchY >= progressRect.y && touchY <= progressRect.y + progressRect.height;
    
    console.log('是否在进度条区域内:', inProgressArea);
    
    if (eventType === 'touchstart' && inProgressArea) {
      // 开始拖动
      console.log('✅ 开始拖动进度条');
      this.progressDrag.isDragging = true;
      this.progressDrag.startX = touchX;
      this.progressDrag.startY = touchY;
      
      // 计算初始进度
      const progress = Math.max(0, Math.min(1, (touchX - progressRect.x) / progressRect.width));
      this.progressDrag.dragProgress = progress;
      
      console.log('初始进度:', progress);
      showToast('开始拖动进度条');
      return true;
      
    } else if (eventType === 'touchmove' && this.progressDrag.isDragging) {
      // 拖动中
      console.log('🔄 拖动中');
      const progress = Math.max(0, Math.min(1, (touchX - progressRect.x) / progressRect.width));
      this.progressDrag.dragProgress = progress;
      
      console.log('当前进度:', progress);
      
      // 实时显示拖动到的时间
      if (this.videoState.duration > 0) {
        const targetTime = progress * this.videoState.duration;
        console.log('拖动到时间:', this.formatTime(targetTime));
      }
      
      return true;
      
    } else if (eventType === 'touchend' && this.progressDrag.isDragging) {
      // 结束拖动，应用进度
      console.log('🏁 结束拖动，应用进度');
      this.applyProgressDrag();
      return true;
    }
    
    console.log('❌ 进度条拖动未处理');
    return false;
  }

  /**
   * 应用拖动进度到视频
   */
  applyProgressDrag() {
    if (!this.progressDrag.isDragging) {
      console.log('没有在拖动状态，跳过应用进度');
      return;
    }
    
    console.log('应用拖动进度:', {
      dragProgress: this.progressDrag.dragProgress,
      videoExists: !!this.video,
      videoDuration: this.videoState.duration
    });
    
    try {
      if (this.video && this.videoState.duration > 0) {
        const targetTime = this.progressDrag.dragProgress * this.videoState.duration;
        
        console.log('尝试跳转到时间:', targetTime, '秒');
        
        // 尝试多种跳转方法，适配微信小游戏的视频API
        if (typeof this.video.seek === 'function') {
          console.log('使用 seek 方法');
          this.video.seek(targetTime);
          this.videoState.currentTime = targetTime;
          showToast(`已跳转到: ${this.formatTime(targetTime)}`);
        } else if (typeof this.video.currentTime !== 'undefined') {
          console.log('使用 currentTime 属性');
          this.video.currentTime = targetTime;
          this.videoState.currentTime = targetTime;
          showToast(`已跳转到: ${this.formatTime(targetTime)}`);
        } else {
          // 如果没有直接的跳转方法，我们可以尝试模拟跳转
          console.warn('视频组件不支持跳转方法，尝试模拟跳转');
          this.videoState.currentTime = targetTime;
          showToast(`已跳转到: ${this.formatTime(targetTime)}`);
        }
      } else {
        console.warn('视频未就绪:', {
          video: !!this.video,
          duration: this.videoState.duration
        });
        showToast('视频未就绪');
      }
    } catch (error) {
      console.error('视频跳转失败:', error);
      showErrorToast('视频跳转失败');
    } finally {
      // 重置拖动状态
      console.log('重置拖动状态');
      this.progressDrag.isDragging = false;
      this.progressDrag.dragProgress = 0;
      this.progressDrag.startX = 0;
      this.progressDrag.startY = 0;
    }
  }

  /**
   * 检查返回按钮点击
   */
  checkBackButtonClick(touchX, touchY) {
    const { x, y, width, height } = this.layout.backButton;
    
    if (touchX >= x && touchX <= x + width &&
        touchY >= y && touchY <= y + height) {
      console.log('点击返回按钮，返回首页');
      
      try {
        if (GameGlobal && GameGlobal.pageManager && typeof GameGlobal.pageManager.switchToPage === 'function') {
          GameGlobal.pageManager.switchToPage('home');
        } else {
          console.error('页面管理器不可用');
          showErrorToast('返回首页失败');
        }
      } catch (error) {
        console.error('返回首页时出错:', error);
        showErrorToast('返回首页失败');
      }
    }
  }

  /**
   * 检查卡片选择
   */
  checkCardSelection(touchX, touchY) {
    // 检查第一列卡片
    this.checkColumnCards(touchX, touchY, 'column1', this.layout.cards.column1);
    // 检查第二列卡片
    this.checkColumnCards(touchX, touchY, 'column2', this.layout.cards.column2);
  }

  /**
   * 检查列卡片选择
   */
  checkColumnCards(touchX, touchY, columnKey, layout) {
    const { x, y, width, height, gap } = layout;
    this.cards[columnKey].forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      if (touchX >= x && touchX <= x + width &&
          touchY >= cardY && touchY <= cardY + height) {
        
        // 检查视频是否播放完成
        if (!this.videoState.isCompleted) {
          console.log('视频未播放完成，卡片不能点击');
          showToast('请先观看视频再连线呦～');
          return;
        }
        
        // 检查当前卡片是否已经被选中
        if (card.selected) {
          // 如果卡片是永久选中的，则不允许取消选中
          if (card.permanentlySelected) {
            console.log(`卡片${columnKey}已永久选中，无法取消选中:`, card);
            showToast("该卡片已匹配成功，无法取消选中");
            return;
          }
          
          // 如果已经选中且不是永久选中，则取消选中
          card.selected = false;
          this.selectedCardIds[columnKey] = null;
          console.log(`取消选中${columnKey}卡片:`, card);
        } else {
          // 如果未选中，则选中当前卡片
          // 清除同列其他非永久选中卡片的选择
          this.cards[columnKey].forEach(c => {
            if (!c.permanentlySelected) {
              c.selected = false;
            }
          });
          
          // 选中当前卡片
          card.selected = true;
          this.selectedCardIds[columnKey] = card.id;
          
          console.log(`选中${columnKey}卡片:`, card);
        }
        
        // 检查是否两列都有卡片被选中
        this.checkBothColumnsSelected();
      }
    });
  }

  /**
   * 检查两列是否都有卡片被选中
   */
  checkBothColumnsSelected() {
    const { column1, column2 } = this.selectedCardIds;
    console.log(this.selectedCardIds)
    if (column1 && column2) {
      console.log(`两列都有卡片被选中！`);
      console.log(`Column1 选中卡片ID: ${column1}`);
      console.log(`Column2 选中卡片ID: ${column2}`);
      
      // 获取选中的卡片对象
      const selectedCard1 = this.cards.column1.find(c => c.id === column1);
      const selectedCard2 = this.cards.column2.find(c => c.id === column2);
      
      if (selectedCard1 && selectedCard2) {
        console.log(`Column1 卡片详情:`, selectedCard1);
        console.log(`Column1 label:`, selectedCard1.label);
        console.log(`Column2 卡片详情:`, selectedCard2);
        
        // 从缓存中获取数据，key为selectedCard1.label
        wx.getStorage({
          key: selectedCard1.label,
          success: (res) => {
            console.log("从缓存获取的数据:", res.data);
            console.log("Column2卡片ID:", selectedCard2.id);
            
            // 检查缓存中的值是否与selectedCard2.id相等
            if (res.data === selectedCard2.id) {
              console.log("恭喜您，卡片成功匹配！");
              showSuccessToast("连线成功，再接再厉！");
              
              // 设置两张卡片为永久选中状态
              selectedCard1.permanentlySelected = true;
              selectedCard2.permanentlySelected = true;
              selectedCard1.selected = false;
              selectedCard2.selected = false;
              
              this.selectedCardIds["column1"] = null;
              this.selectedCardIds["column2"] = null;
              
              console.log("卡片已设置为永久选中状态");
            } else {
              console.log("卡片匹配失败，请重试");
              showToast("连线失败，再去学习一下吧");
              
              // 匹配失败时，取消两个选中卡片
              this.cancelSelectedCards(selectedCard1, selectedCard2);
            }
          },
          fail: (error) => {
            console.log("获取缓存失败:", error);
            showErrorToast("获取缓存数据失败");
          }
        });
      }
    }
  }

  /**
   * 检查是否所有卡片都已匹配成功
   * @returns {boolean} 是否所有卡片都已匹配成功
   */
  checkAllCardsMatched() {
    // 检查第一列所有卡片是否都已永久选中
    const column1AllMatched = this.cards.column1.every(card => card.permanentlySelected);
    // 检查第二列所有卡片是否都已永久选中
    const column2AllMatched = this.cards.column2.every(card => card.permanentlySelected);
    
    return column1AllMatched && column2AllMatched;
  }

  /**
   * 取消选中的卡片
   * @param {Object} card1 - 第一列选中的卡片
   * @param {Object} card2 - 第二列选中的卡片
   */
  cancelSelectedCards(card1, card2) {
    // 取消第一列卡片的选择
    if (card1 && !card1.permanentlySelected) {
      card1.selected = false;
      console.log("取消选中第一列卡片:", card1);
    }
    
    // 取消第二列卡片的选择
    if (card2 && !card2.permanentlySelected) {
      card2.selected = false;
      console.log("取消选中第二列卡片:", card2);
    }
    
    // 清除选中状态记录
    this.selectedCardIds.column1 = null;
    this.selectedCardIds.column2 = null;
    
    console.log("已取消两个选中卡片的状态");
  }

  /**
   * 检查提交按钮点击
   */
  checkSubmitButtonClick(touchX, touchY) {
    const { x, y, width, height } = this.layout.submitButton;
    
    if (touchX >= x && touchX <= x + width &&
        touchY >= y && touchY <= y + height) {
      
      // 检查是否所有卡片都已匹配成功
      if (this.checkAllCardsMatched()) {
        // 所有卡片都已匹配成功，返回首页
        console.log("所有卡片匹配成功，返回首页");
        showSuccessToast("恭喜您完成所有连线！");
        
        // 延迟一下再返回首页，让用户看到成功提示
        setTimeout(() => {
          try {
            if (GameGlobal && GameGlobal.pageManager && typeof GameGlobal.pageManager.switchToPage === 'function') {
              GameGlobal.pageManager.switchToPage('home');
            } else {
              console.error('页面管理器不可用');
              showErrorToast('返回首页失败');
            }
          } catch (error) {
            console.error('返回首页时出错:', error);
            showErrorToast('返回首页失败');
          }
        }, 1500);
      } else {
        // 还有卡片未匹配成功，显示提示
        console.log("还有卡片未匹配成功");
        showToast("还没有连线成功，快去学习吧");
      }
    }
  }



  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 重置卡片状态
   */
  resetCardStates() {
    console.log('重置卡片状态');
    
    // 重置卡片状态
    this.cards.column1.forEach(card => {
      card.selected = false;
      card.permanentlySelected = false;
    });
    
    this.cards.column2.forEach(card => {
      card.selected = false;
      card.permanentlySelected = false;
    });
    
    // 重置选中状态记录
    this.selectedCardIds = {
      column1: null,
      column2: null
    };
    
    console.log('卡片状态已重置');
  }

  /**
   * 重置所有状态
   */
  resetAllStates() {
    console.log('重置所有状态');
    
    // 重置视频状态
    this.videoState = {
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isFullScreen: false,
      volume: 1,
      lastModuleIndex: -1,
      isCompleted: false
    };
    
    // 重置卡片状态
    this.resetCardStates();
    
    // 重置进度条拖动状态
    this.progressDrag = {
      isDragging: false,
      dragProgress: 0,
      startX: 0,
      startY: 0
    };
    
    // 销毁现有视频组件
    if (this.video) {
      try {
        if (typeof this.video.destroy === 'function') {
          this.video.destroy();
        }
      } catch (error) {
        console.warn('销毁视频时出错:', error);
      }
      this.video = null;
    }
    
    console.log('所有状态已重置');
  }

  /**
   * 显示页面
   */
  show() {
    // 重置所有状态
    this.resetAllStates();
    
    // 延迟初始化视频组件
    if (!this.video) {
      this.initVideo();
    }
    
    if (this.video) {
      try {
        // 检查视频对象是否有show方法
        if (typeof this.video.show === 'function') {
          this.video.show();
        }
      } catch (error) {
        console.warn('视频显示时出错:', error);
      }
    }
  }

  /**
   * 隐藏页面
   */
  hide() {
    console.log('隐藏页面，清理资源');
    
    if (this.video) {
      try {
        // 检查视频对象是否有hide方法
        if (typeof this.video.hide === 'function') {
          this.video.hide();
        }
        
        // 检查视频对象是否有destroy方法
        if (typeof this.video.destroy === 'function') {
          this.video.destroy();
        }
      } catch (error) {
        console.warn('视频隐藏时出错:', error);
      }
      
      this.video = null;
    }
    
    // 清理选中状态
    this.selectedCardIds = {
      column1: null,
      column2: null
    };
  }

  /**
   * 更新页面
   */
  update() {
    // 可以在这里添加动画更新逻辑
  }

  /**
   * 销毁页面
   */
  destroy() {
    if (this.video) {
      try {
        // 检查视频对象是否有destroy方法
        if (typeof this.video.destroy === 'function') {
          this.video.destroy();
        }
      } catch (error) {
        console.warn('视频销毁时出错:', error);
      }
      
      this.video = null;
    }
  }
} 