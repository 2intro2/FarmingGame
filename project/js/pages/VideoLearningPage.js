import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';
import ImageLoader from '../utils/imageLoader';
import ImageTest from '../utils/imageTest';

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
    volume: 1
  };

  // 卡片数据
  cards = {
    column1: [
      { id: 'yuan', image: 'images/002.png', selected: false, label: '犁辕' },
      { id: 'jian', image: 'images/003.png', selected: false, label: '犁箭' },
      { id: 'hua', image: 'images/004.png', selected: false, label: '犁铧' }
    ],
    column2: [
      { id: 'yuan_text', pinyin: 'lí yuán', chinese: '犁辕', selected: false, refId: 'yuan' },
      { id: 'jian_text', pinyin: 'lí jiàn', chinese: '犁箭', selected: false, refId: 'jian' },
      { id: 'hua_text', pinyin: 'lí huá', chinese: '犁铧', selected: false, refId: 'hua' }
    ]
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
      y: SCREEN_HEIGHT * 0.85 * (9 / 16) + SCREEN_HEIGHT * 0.12 + 20,
      width: SCREEN_WIDTH * 0.55,
      height: 30
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
      height: 50
    },
    backButton: {
      x: 20,
      y: 20,
      width: 60,
      height: 60
    }
  };

  constructor() {
    this.loadResources();
    // 延迟初始化视频，只在页面显示时才创建
    
    // 测试图片文件
    this.testImages();
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
      src: 'https://www.w3schools.com/html/mov_bbb.mp4', // 使用测试视频，实际使用时请替换为真实视频URL
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      showCenterPlayBtn: true,
      showFullscreenBtn: true,
      showPlayBtn: true,
      showProgress: true,
      objectFit: 'contain',
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
      console.log('视频播放结束');
    });

    this.video.onTimeUpdate((res) => {
      this.videoState.currentTime = res.currentTime;
      this.videoState.duration = res.duration;
    });

    this.video.onError((error) => {
      console.error('视频播放错误:', error);
      showErrorToast('视频加载失败');
    });

    this.video.onFullScreenChange((res) => {
      this.videoState.isFullScreen = res.fullScreen;
      console.log('全屏状态变化:', res.fullScreen);
    });
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 预加载卡片图片
    this.cards.column1.forEach(card => {
      this.loadImage(card);
    });
  }

  /**
   * 测试图片文件
   */
  testImages() {
    // 测试卡片图片
    const cardImages = this.cards.column1.map(card => card.image);
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
  }

  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 整体背景
    ctx.fillStyle = '#E0F2F1';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 左侧面板背景
    ctx.fillStyle = '#C8E6C9';
    ctx.fillRect(
      this.layout.video.x, 
      this.layout.progress.y - 10, 
      this.layout.video.width, 
      SCREEN_HEIGHT - (this.layout.progress.y - 10) - this.layout.video.y
    );
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
    
    // 绘制播放进度
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    const currentTime = this.formatTime(this.videoState.currentTime);
    const duration = this.formatTime(this.videoState.duration);
    ctx.fillText(`播放进度: ${currentTime} / ${duration}`, x, y + 70);
    
    // 绘制学习模块进度条
    this.renderLearningProgress(ctx, x, y + 100);
  }

  /**
   * 绘制学习模块进度条
   */
  renderLearningProgress(ctx, x, y) {
    const moduleNames = ['曲辕犁的历史', '结构组成', '使用技巧'];
    const moduleProgress = [0.7, 0, 0]; // 示例进度
    const moduleWidth = (this.layout.progress.width - 40) / 3;
    const moduleHeight = 20;
    
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
    });
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
    
    this.cards.column1.forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      // 绘制卡片背景
      ctx.fillStyle = card.selected ? '#A5D6A7' : '#FFFFFF';
      ctx.fillRect(x, cardY, width, height);
      
      // 绘制边框
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, cardY, width, height);
      
      // 绘制图片
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
    
    this.cards.column2.forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      // 绘制卡片背景
      ctx.fillStyle = card.selected ? '#A5D6A7' : '#FFFFFF';
      ctx.fillRect(x, cardY, width, height);
      
      // 绘制边框
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, cardY, width, height);
      
      // 绘制拼音
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(card.pinyin, x + width / 2, cardY + height / 2 - 10);
      
      // 绘制汉字
      ctx.font = '24px Arial';
      ctx.fillText(card.chinese, x + width / 2, cardY + height / 2 + 20);
    });
  }

  /**
   * 绘制返回按钮
   */
  renderBackButton(ctx) {
    const { x, y, width, height } = this.layout.backButton;
    
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
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, width, height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('确认提交', x + width / 2, y + height / 2 + 7);
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    const touch = event.touches[0];
    const { x, y } = touch;
    
    // 检查返回按钮点击
    this.checkBackButtonClick(x, y);
    
    // 检查卡片选择
    this.checkCardSelection(x, y);
    
    // 检查提交按钮点击
    this.checkSubmitButtonClick(x, y);
  }

  /**
   * 检查返回按钮点击
   */
  checkBackButtonClick(touchX, touchY) {
    const { x, y, width, height } = this.layout.backButton;
    
    if (touchX >= x && touchX <= x + width &&
        touchY >= y && touchY <= y + height) {
      GameGlobal.pageManager.switchToPage('home');
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
        
        // 清除同列其他卡片的选择
        this.cards[columnKey].forEach(c => c.selected = false);
        
        // 选中当前卡片
        card.selected = true;
        this.selectedCardIds[columnKey] = card.id;
        
        console.log(`选中${columnKey}卡片:`, card);
      }
    });
  }

  /**
   * 检查提交按钮点击
   */
  checkSubmitButtonClick(touchX, touchY) {
    const { x, y, width, height } = this.layout.submitButton;
    
    if (touchX >= x && touchX <= x + width &&
        touchY >= y && touchY <= y + height) {
      
      this.handleSubmit();
    }
  }

  /**
   * 处理提交
   */
  handleSubmit() {
    const { column1, column2 } = this.selectedCardIds;
    
    if (!column1 || !column2) {
      showToast('请选择所有卡片');
      return;
    }
    
    // 检查匹配
    const selectedImageCard = this.cards.column1.find(c => c.id === column1);
    const selectedTextCard = this.cards.column2.find(c => c.id === column2);
    
    if (selectedImageCard && selectedTextCard && 
        selectedImageCard.id === selectedTextCard.refId) {
      showSuccessToast('匹配正确！');
      // 这里可以添加更多逻辑，比如解锁下一个模块
    } else {
      showToast('匹配错误，请重试');
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
   * 显示页面
   */
  show() {
    // 延迟初始化视频组件
    if (!this.video) {
      this.initVideo();
    }
    
    if (this.video) {
      this.video.show();
    }
  }

  /**
   * 隐藏页面
   */
  hide() {
    if (this.video) {
      this.video.hide();
      // 隐藏时销毁视频组件以释放资源
      this.video.destroy();
      this.video = null;
    }
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
      this.video.destroy();
      this.video = null;
    }
  }
} 