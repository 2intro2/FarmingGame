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
    isCompleted: false // 视频是否播放完成
  };

  // 卡片数据
  cards = {
    column1: [
      { id: 'yuan', image: 'images/lishaoPic.png', selected: false, permanentlySelected: false, label: '犁辕' },
      { id: 'jian', image: 'images/lichanPic.png', selected: false, permanentlySelected: false, label: '犁箭' },
      { id: 'hua', image: 'images/liyuanPic.png', selected: false, permanentlySelected: false, label: '犁铧' }
    ],
    column2: [
      { id: 'liyuan', image: 'images/lichanWord.png', selected: false, permanentlySelected: false, label: 'yuan' },
      { id: 'lijian', image: 'images/liyuanWord.png', selected: false, permanentlySelected: false, label: 'jian' },
      { id: 'lihua', image: 'images/lishaoWord.png', selected: false, permanentlySelected: false, label: 'hua' }
    ]
  };

  // 确认提交按钮图片
  submitButtonImage = null;
  submitButtonGrayImage = null;
  
  // 返回按钮图片
  backButtonImage = null;
  
  // 背景图片
  backgroundImage = null;
  
  // 次背景图片
  secondaryBackgroundImage = null;
  
  // 进度相关图片
  progressImage = null;
  startImage = null;
  
  // 选中状态图片
  checkedImage = null;
  
  // 连线图片
  lineImage = null;
  
  // 存储匹配的卡片连线信息
  matchedConnections = [];



  selectedCardIds = {
    column1: null,
    column2: null
  };

  // UI布局参数
  layout = {
    video: {
      x: SCREEN_WIDTH * 0.065,
      y: SCREEN_HEIGHT * 0.20,
      width: SCREEN_WIDTH * 0.53,
      height: SCREEN_WIDTH * 0.50 * (3 / 4) // 16:9比例
    },

    cards: {
      column1: {
        x: SCREEN_WIDTH * 0.615,
        y: SCREEN_HEIGHT * 0.22,
        width: SCREEN_WIDTH * 0.14,
        height: SCREEN_WIDTH * 0.1,
        gap: 15
      },
      column2: {
        x: SCREEN_WIDTH * 0.615 + SCREEN_WIDTH * 0.15 + 20,
        y: SCREEN_HEIGHT * 0.22,
        width: SCREEN_WIDTH * 0.14,
        height: SCREEN_WIDTH * 0.1,
        gap: 15
      }
    },
    submitButton: {
      x: SCREEN_WIDTH * 0.66,
      y: SCREEN_HEIGHT - 200,
      width: SCREEN_WIDTH * 0.25,
      height: 100
    },
    backButton: {
      x: 20,
      y: 20,
      width: 60,
      height: 60
    },
    progressImages: {
      progressImage: {
        x: SCREEN_WIDTH * 0.065,
        y: SCREEN_HEIGHT * 0.28 + SCREEN_WIDTH * 0.40 * (3 / 4) + 20, // 视频下方20px
        width: SCREEN_WIDTH * 0.53,
        height: SCREEN_WIDTH * 0.53 * 0.3 // 保持合适的高度比例
      },
      startImage: {
        x: SCREEN_WIDTH * 0.065 + SCREEN_WIDTH * 0.53 * 0.42, // 在progress图片中央偏左
        y: SCREEN_HEIGHT * 0.33 + SCREEN_WIDTH * 0.40 * (3 / 4) + 15, // 比progress图片高15px
        width: SCREEN_WIDTH * 0.53 * 0.12, // 更小的尺寸（从20%减小到12%）
        height: SCREEN_WIDTH * 0.53 * 0.12 * 0.8 // 保持合适的高度比例
      }
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
      src: 'https://vdept3.bdstatic.com/mda-rh8cg4epe3fse7r9/cae_h264/1754732696078638116/mda-rh8cg4epe3fse7r9.mp4?v_from_s=hkapp-haokan-hbe&auth_key=1754758663-0-0-09d88080b67d166a43065a2d7a8a1f11&bcevod_channel=searchbox_feed&cr=0&cd=0&pd=1&pt=3&logid=3463781893&vid=4260617882103308770&klogid=3463781893&abtest=', // 使用测试视频，实际使用时请替换为真实视频URL
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      showCenterPlayBtn: true,
      showProgress: false,
      objectFit: 'fill',
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
      
      // 更新小星星在progress图片上的位置
      this.updateStarPosition();
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
    // 预加载第一列卡片图片
    this.cards.column1.forEach(card => {
      this.loadImage(card);
    });
    
    // 预加载第二列卡片图片
    this.cards.column2.forEach(card => {
      this.loadImage(card);
    });
    
    // 加载确认提交按钮图片
    this.loadSubmitButtonImage();
    this.loadSubmitButtonGrayImage();
    
    // 加载返回按钮图片
    this.loadBackButtonImage();
    
    // 加载背景图片
    this.loadBackgroundImage();
    
    // 加载次背景图片
    this.loadSecondaryBackgroundImage();
    
    // 加载进度相关图片
    this.loadProgressImage();
    this.loadStartImage();
    
    // 加载选中状态图片
    this.loadCheckedImage();
    
    // 加载连线图片
    this.loadLineImage();
  }

  /**
   * 测试图片文件
   */
  testImages() {
    // 测试第一列卡片图片
    const cardImages = this.cards.column1.map(card => card.image);
    // 测试第二列卡片图片
    cardImages.push(...this.cards.column2.map(card => card.image));
    // 测试确认提交按钮图片
    cardImages.push('images/confirm.png');
    cardImages.push('images/confit_gray.png');
    // 测试返回按钮图片
    cardImages.push('images/left.png');
    // 测试背景图片
    cardImages.push('images/main.png');
    // 测试次背景图片
    cardImages.push('images/background.png');
    // 测试进度相关图片
    cardImages.push('images/progress.png');
    cardImages.push('images/start.png');
    // 测试选中状态图片
    cardImages.push('pages/checked.png');
    // 测试连线图片
    cardImages.push('images/line.png');
    ImageTest.testImages(cardImages);
  }

  /**
   * 加载图片
   */
  loadImage(card) {
    console.log("加载图片")
    console.log(card.image)
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
    ImageLoader.loadImage('images/confirm.png', { timeout: 5000 })
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
   * 加载确认提交按钮灰色图片
   */
  loadSubmitButtonGrayImage() {
    ImageLoader.loadImage('images/confit_gray.png', { timeout: 5000 })
      .then(img => {
        this.submitButtonGrayImage = img;
        console.log('确认提交按钮灰色图片加载成功');
      })
      .catch(error => {
        console.warn('确认提交按钮灰色图片加载失败:', error);
        this.submitButtonGrayImage = null;
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
   * 加载背景图片
   */
  loadBackgroundImage() {
    ImageLoader.loadImage('images/main.png', { timeout: 5000 })
      .then(img => {
        this.backgroundImage = img;
        console.log('背景图片加载成功');
      })
      .catch(error => {
        console.warn('背景图片加载失败:', error);
        this.backgroundImage = null;
      });
  }

  /**
   * 加载次背景图片
   */
  loadSecondaryBackgroundImage() {
    ImageLoader.loadImage('images/background.png', { timeout: 5000 })
      .then(img => {
        this.secondaryBackgroundImage = img;
        console.log('次背景图片加载成功');
      })
      .catch(error => {
        console.warn('次背景图片加载失败:', error);
        this.secondaryBackgroundImage = null;
      });
  }

  /**
   * 加载进度图片
   */
  loadProgressImage() {
    ImageLoader.loadImage('images/progress.png', { timeout: 5000 })
      .then(img => {
        this.progressImage = img;
        console.log('进度图片加载成功');
      })
      .catch(error => {
        console.warn('进度图片加载失败:', error);
        this.progressImage = null;
      });
  }

  /**
   * 加载开始图片
   */
  loadStartImage() {
    ImageLoader.loadImage('images/start.png', { timeout: 5000 })
      .then(img => {
        this.startImage = img;
        console.log('开始图片加载成功');
      })
      .catch(error => {
        console.warn('开始图片加载失败:', error);
        this.startImage = null;
      });
  }

  /**
   * 加载选中状态图片
   */
  loadCheckedImage() {
    ImageLoader.loadImage('images/checked.png', { timeout: 5000 })
      .then(img => {
        this.checkedImage = img;
        console.log('选中状态图片加载成功');
      })
      .catch(error => {
        console.warn('选中状态图片加载失败:', error);
        this.checkedImage = null;
      });
  }

  /**
   * 加载连线图片
   */
  loadLineImage() {
    ImageLoader.loadImage('images/line.png', { timeout: 5000 })
      .then(img => {
        this.lineImage = img;
        console.log('连线图片加载成功');
      })
      .catch(error => {
        console.warn('连线图片加载失败:', error);
        this.lineImage = null;
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
    
    // 绘制进度相关图片
    this.renderProgressImages(ctx);
    
    // 绘制卡片
    this.renderCards(ctx);
    
    // 绘制连线
    this.renderConnections(ctx);
    
    // 绘制提交按钮
    this.renderSubmitButton(ctx);
    
    // 渲染Toast提示
    Toast.render(ctx);
  }

  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 第一层：主背景图片 (main.png) - 最底层
    if (this.backgroundImage && ImageLoader.isValidImage(this.backgroundImage)) {
      try {
        ctx.drawImage(this.backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } catch (error) {
        console.warn('背景图片绘制失败:', error);
        this.renderBackgroundFallback(ctx);
      }
    } else {
      // 没有图片或图片加载失败，使用备用背景
      this.renderBackgroundFallback(ctx);
    }
    
    // 第二层：次背景图片 (background.png) - 次低层
    if (this.secondaryBackgroundImage && ImageLoader.isValidImage(this.secondaryBackgroundImage)) {
      try {
        ctx.drawImage(this.secondaryBackgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } catch (error) {
        console.warn('次背景图片绘制失败:', error);
      }
    }
    

  }

  /**
   * 绘制备用背景（当图片加载失败时）
   */
  renderBackgroundFallback(ctx) {
    // 整体背景
    ctx.fillStyle = '#E0F2F1';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
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
   * 绘制进度相关图片
   */
  renderProgressImages(ctx) {
    // 绘制 progress 图片（底层）
    this.renderProgressImage(ctx);
    
    // 绘制 start 图片（上层，较小）
    this.renderStartImage(ctx);
  }

  /**
   * 绘制进度图片
   */
  renderProgressImage(ctx) {
    const { x, y, width, height } = this.layout.progressImages.progressImage;
    
    if (this.progressImage && ImageLoader.isValidImage(this.progressImage)) {
      try {
        ctx.drawImage(this.progressImage, x, y, width, height);
      } catch (error) {
        console.warn('进度图片绘制失败:', error);
        this.renderProgressImageFallback(ctx, x, y, width, height);
      }
    } else {
      // 没有图片或图片加载失败，使用备用图片
      this.renderProgressImageFallback(ctx, x, y, width, height);
    }
  }

  /**
   * 绘制开始图片
   */
  renderStartImage(ctx) {
    const { x, y, width, height } = this.layout.progressImages.startImage;
    
    if (this.startImage && ImageLoader.isValidImage(this.startImage)) {
      try {
        ctx.drawImage(this.startImage, x, y, width, height);
      } catch (error) {
        console.warn('开始图片绘制失败:', error);
        this.renderStartImageFallback(ctx, x, y, width, height);
      }
    } else {
      // 没有图片或图片加载失败，使用备用图片
      this.renderStartImageFallback(ctx, x, y, width, height);
    }
  }

  /**
   * 绘制备用进度图片（当图片加载失败时）
   */
  renderProgressImageFallback(ctx, x, y, width, height) {
    // 绘制一个简单的进度条样式背景
    ctx.fillStyle = '#E8F5E8';
    ctx.fillRect(x, y, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // 绘制文字
    ctx.fillStyle = '#4CAF50';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('学习进度', x + width / 2, y + height / 2);
  }

  /**
   * 绘制备用开始图片（当图片加载失败时）
   */
  renderStartImageFallback(ctx, x, y, width, height) {
    // 绘制一个圆形按钮样式
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    
    // 绘制圆形背景
    ctx.fillStyle = '#2196F3';
      ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制播放三角形
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.3, centerY - radius * 0.4);
    ctx.lineTo(centerX - radius * 0.3, centerY + radius * 0.4);
    ctx.lineTo(centerX + radius * 0.4, centerY);
    ctx.closePath();
    ctx.fill();
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
      
      // 不绘制卡片背景，保持透明
      
      // 不绘制边框
      
      // 如果选中（包括普通选中和永久选中），绘制选中指示器
      if (card.selected || card.permanentlySelected) {
        this.renderCheckedIcon(ctx, x + width - 20, cardY, 20, 20);
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
    // 不绘制背景和边框，保持透明
    
    // 绘制文字
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label || '图片', x + width / 2, y + height / 2);
  }

  /**
   * 绘制选中状态图标
   */
  renderCheckedIcon(ctx, x, y, width, height) {
    if (this.checkedImage && ImageLoader.isValidImage(this.checkedImage)) {
      try {
        ctx.drawImage(this.checkedImage, x, y, width, height);
      } catch (error) {
        console.warn('选中状态图片绘制失败:', error);
        this.renderCheckedIconFallback(ctx, x, y, width, height);
      }
    } else {
      // 没有图片或图片加载失败，使用备用图标
      this.renderCheckedIconFallback(ctx, x, y, width, height);
    }
  }

  /**
   * 绘制备用选中状态图标（当图片加载失败时）
   */
  renderCheckedIconFallback(ctx, x, y, width, height) {
    // 绘制圆形背景
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制白色对号
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${width * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', x + width / 2, y + height / 2);
  }

  /**
   * 绘制连线
   */
  renderConnections(ctx) {
    this.matchedConnections.forEach(connection => {
      this.renderSingleConnection(ctx, connection);
    });
  }

  /**
   * 绘制单条连线
   */
  renderSingleConnection(ctx, connection) {
    const { startX, startY, endX, endY } = connection;
    
    // 计算连线的长度和角度
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // 保存当前变换状态
    ctx.save();
    
    // 移动到起始点并旋转
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    
    if (this.lineImage && ImageLoader.isValidImage(this.lineImage)) {
      try {
        // 绘制连线图片，拉伸到计算出的长度
        ctx.drawImage(this.lineImage, 0, -10, length, 20);
      } catch (error) {
        console.warn('连线图片绘制失败:', error);
        this.renderConnectionFallback(ctx, 0, 0, length);
      }
    } else {
      // 没有图片或图片加载失败，使用备用连线
      this.renderConnectionFallback(ctx, 0, 0, length);
    }
    
    // 恢复变换状态
    ctx.restore();
  }

  /**
   * 绘制备用连线（当图片加载失败时）
   */
  renderConnectionFallback(ctx, x, y, length) {
    // 绘制简单的线条
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  /**
   * 更新小星星在progress图片上的位置
   */
  updateStarPosition() {
    if (this.videoState.duration > 0) {
      // 计算播放进度百分比 (0-1)
      const progress = this.videoState.currentTime / this.videoState.duration;
      
      // 获取progress图片的布局信息
      const progressLayout = this.layout.progressImages.progressImage;
      
      // 计算进度条的有效区域（假设进度条占图片宽度的80%，左右各留10%边距）
      const progressBarMargin = progressLayout.width * 0.19;
      const progressBarMarginEnd = progressLayout.width * 0.15;  // 左右边距各10%
      const progressBarStartX = progressLayout.x + progressBarMargin; // 蓝色部分的左边（起始位置）
      const progressBarEndX = progressLayout.x + progressLayout.width - progressBarMarginEnd; // 橙色部分的右边（结束位置）
      const progressBarWidth = progressBarEndX - progressBarStartX;
      
      // 根据播放进度计算小星星在进度条上的位置
      const starX = progressBarStartX + progressBarWidth * progress;
      
      // 更新start图片的X坐标，让星星居中对齐到计算出的位置
      this.layout.progressImages.startImage.x = starX - this.layout.progressImages.startImage.width / 2;
      
      // 确保小星星不会超出进度条的有效区域
      const minX = progressBarStartX - this.layout.progressImages.startImage.width / 2;
      const maxX = progressBarEndX - this.layout.progressImages.startImage.width / 2;
      this.layout.progressImages.startImage.x = Math.max(minX, Math.min(maxX, this.layout.progressImages.startImage.x));
      
      console.log(`视频进度: ${(progress * 100).toFixed(1)}%, 小星星位置: ${this.layout.progressImages.startImage.x}, 进度条范围: ${progressBarStartX} - ${progressBarEndX}`);
    }
  }

  /**
   * 重置小星星位置到progress图片的起始位置
   */
  resetStarPosition() {
    const progressLayout = this.layout.progressImages.progressImage;
    
    // 计算进度条的有效区域（与updateStarPosition中的计算保持一致）
    const progressBarMargin = progressLayout.width * 0.19; // 左右边距各10%
    const progressBarStartX = progressLayout.x + progressBarMargin; // 蓝色部分的左边（起始位置）
    
    // 将小星星放置在蓝色部分的左边（起始位置），星星居中对齐
    this.layout.progressImages.startImage.x = progressBarStartX - this.layout.progressImages.startImage.width / 2;
    
    console.log(`小星星位置已重置到起始位置: ${this.layout.progressImages.startImage.x}, 进度条起始点: ${progressBarStartX}`);
  }

  /**
   * 添加连线信息
   */
  addConnection(card1, card2) {
    // 计算第一列卡片的中心点
    const card1Index = this.cards.column1.findIndex(c => c.id === card1.id);
    const card1Layout = this.layout.cards.column1;
    const card1CenterX = card1Layout.x + card1Layout.width;
    const card1CenterY = card1Layout.y + card1Index * (card1Layout.height + card1Layout.gap) + card1Layout.height / 2;
    
    // 计算第二列卡片的中心点
    const card2Index = this.cards.column2.findIndex(c => c.id === card2.id);
    const card2Layout = this.layout.cards.column2;
    const card2CenterX = card2Layout.x;
    const card2CenterY = card2Layout.y + card2Index * (card2Layout.height + card2Layout.gap) + card2Layout.height / 2;
    
    // 创建连线信息
    const connection = {
      startX: card1CenterX,
      startY: card1CenterY,
      endX: card2CenterX,
      endY: card2CenterY,
      card1Id: card1.id,
      card2Id: card2.id
    };
    
    this.matchedConnections.push(connection);
    console.log('添加连线:', connection);
  }

  /**
   * 绘制第二列图片卡片
   */
  renderTextCards(ctx) {
    const { x, y, width, height, gap } = this.layout.cards.column2;
    const isVideoCompleted = this.videoState.isCompleted;
    
    this.cards.column2.forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      // 判断卡片是否可用（视频完成或已永久选中）
      const isCardEnabled = isVideoCompleted || card.permanentlySelected;
      
      // 不绘制卡片背景，保持透明
      
      // 不绘制边框
      
      // 如果选中（包括普通选中和永久选中），绘制选中指示器
      if (card.selected || card.permanentlySelected) {
        this.renderCheckedIcon(ctx, x + width - 20, cardY, 20, 20);
      }
      
      // 绘制图片内容
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
    
    // 检查是否所有卡片都已匹配成功
    const allMatched = this.checkAllCardsMatched();
    
    // 根据匹配状态选择图片
    const buttonImage = allMatched ? this.submitButtonImage : this.submitButtonGrayImage;
    
    // 如果有对应的按钮图片且加载完成，绘制图片
    if (buttonImage && ImageLoader.isValidImage(buttonImage)) {
      try {
        ctx.drawImage(buttonImage, x, y, width, height);
      } catch (error) {
        console.warn('确认提交按钮图片绘制失败:', error);
        this.renderSubmitButtonFallback(ctx, x, y, width, height, allMatched);
      }
    } else {
      // 没有图片或图片加载失败，使用备用按钮
      this.renderSubmitButtonFallback(ctx, x, y, width, height, allMatched);
    }
  }

  /**
   * 绘制备用提交按钮（当图片加载失败时）
   */
  renderSubmitButtonFallback(ctx, x, y, width, height, allMatched = false) {
    // 根据匹配状态绘制按钮背景
    ctx.fillStyle = allMatched ? '#4CAF50' : '#CCCCCC';
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
    
    // 仅在触摸结束时处理点击事件
    if (eventType === 'touchend') {
      console.log('处理点击事件');
    
    // 检查返回按钮点击
    this.checkBackButtonClick(x, y);
    
    // 检查卡片选择
    this.checkCardSelection(x, y);
    
    // 检查提交按钮点击
    this.checkSubmitButtonClick(x, y);
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
              
              // 添加连线信息
              this.addConnection(selectedCard1, selectedCard2);
              
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
    
    // 清空连线信息
    this.matchedConnections = [];
    
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
      isCompleted: true // 临时设置为true，方便测试卡片匹配功能
    };
    
    // 重置卡片状态
    this.resetCardStates();
    
    // 重置小星星位置
    this.resetStarPosition();
    
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
    console.log('VideoLearningPage.show() 被调用');
    
    // 重置所有状态
    this.resetAllStates();
    
    // 初始化小星星位置到progress图片的起始位置
    this.resetStarPosition();
    
    // 延迟初始化视频组件
    if (!this.video) {
      console.log('视频组件不存在，开始初始化');
      this.initVideo();
    }
    
    if (this.video) {
      console.log('视频组件已创建，尝试显示视频');
      try {
        // 检查视频对象是否有show方法
        if (typeof this.video.show === 'function') {
      this.video.show();
          console.log('视频显示成功');
        } else {
          console.log('视频对象没有show方法');
        }
      } catch (error) {
        console.warn('视频显示时出错:', error);
      }
    } else {
      console.error('视频组件创建失败');
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