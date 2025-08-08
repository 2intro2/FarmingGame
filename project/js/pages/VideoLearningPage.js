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
    volume: 1,
    lastModuleIndex: -1 // 记录上次的模块索引，用于检测模块切换
  };

  // 卡片数据
  cards = {
    column1: [
      { id: 'yuan', image: 'images/qylPic1.png', selected: false, label: '犁辕' },
      { id: 'jian', image: 'images/qylpic2.png', selected: false, label: '犁箭' },
      { id: 'hua', image: 'images/qylpic3.png', selected: false, label: '犁铧' }
    ],
    column2: [
      { id: 'yuan_text', pinyin: 'lí yuán', chinese: '犁辕', selected: false, refId: 'yuan' },
      { id: 'jian_text', pinyin: 'lí jiàn', chinese: '犁箭', selected: false, refId: 'jian' },
      { id: 'hua_text', pinyin: 'lí huá', chinese: '犁铧', selected: false, refId: 'hua' }
    ]
  };

  // 确认提交按钮图片
  submitButtonImage = null;

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
    this.store();
  }

  store(){
    wx.setStorage({
      key:"犁辕",
      data:"liyuan"
    },{
      key:"犁箭",
      data:"lijian"
    },{
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
      this.videoState.currentTime = res.position;
      this.videoState.duration = res.duration;
      
      // 检测模块切换
      this.checkModuleChange();
    //   console.error('视频当前时间:', res.position);
    //   console.error('视频总时长:', res.duration);
      // 实时更新进度显示
      console.log(`视频进度: ${this.formatTime(res.position)} / ${this.formatTime(res.duration)} (${Math.round((res.position / res.duration) * 100)}%)`);
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
  }

  /**
   * 测试图片文件
   */
  testImages() {
    // 测试卡片图片
    const cardImages = this.cards.column1.map(card => card.image);
    // 测试确认提交按钮图片
    cardImages.push('images/confirmSubmission.png');
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
    const barHeight = 8;
    const progress = this.videoState.duration > 0 ? 
      this.videoState.currentTime / this.videoState.duration : 0;
    
    // 绘制进度条背景
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x, y, width, barHeight);
    
    // 绘制进度条填充
    if (progress > 0) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(x, y, width * progress, barHeight);
    }
    
    // 绘制进度条边框
    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, barHeight);
    
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
    console.log("处理触摸事件",event.touches[0])
    const touch = event.touches[0];
    const x = touch.clientX
    const y = touch.clientY
    
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
    console.log(touchX,touchY)
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
    console.log("layout数据",x,y,width,height)
    console.log("touch数据",touchX,touchX)
    this.cards[columnKey].forEach((card, index) => {
      const cardY = y + index * (height + gap);
      
      if (touchX >= x && touchX <= x + width &&
          touchY >= cardY && touchY <= cardY + height) {
            console.log("图片呗点击了")
        
        // 检查当前卡片是否已经被选中
        if (card.selected) {
          // 如果已经选中，则取消选中
          card.selected = false;
          this.selectedCardIds[columnKey] = null;
          console.log(`取消选中${columnKey}卡片:`, card);
        } else {
          // 如果未选中，则选中当前卡片
          // 清除同列其他卡片的选择
          this.cards[columnKey].forEach(c => c.selected = false);
          
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
    
    if (column1 && column2) {
      console.log(`两列都有卡片被选中！`);
      console.log(`Column1 选中卡片ID: ${column1}`);
      console.log(`Column2 选中卡片ID: ${column2}`);
      
      // 获取选中的卡片对象
      const selectedCard1 = this.cards.column1.find(c => c.id === column1);
      const selectedCard2 = this.cards.column2.find(c => c.id === column2);
      
      if (selectedCard1 && selectedCard2) {
        console.log(`Column1 卡片详情:`, selectedCard1);
        console.log(`Column2 卡片详情:`, selectedCard2);
      }
    }
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