import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';

/**
 * 主页面
 */
export default class HomePage {
  modules = [];
  buttons = {};
  infoBar = {};

  // 中间四个模块背后的背景图样式（直接修改这里的 x/y/width/height 来调整位置和大小；为 null 则自动适配模块区域）
  // bg13.png 的位置和大小设置
  modulesBackdropStyle = { 
    x: SCREEN_WIDTH * -0.88,           // 距离左边10%
    y: SCREEN_HEIGHT * 0.17,          // 距离顶部30%
    width: SCREEN_WIDTH * 2.8,       // 宽度为屏幕宽度的80%
    height: SCREEN_HEIGHT * 0.8      // 高度为屏幕高度的40%
  };

  // 3个icon按钮的位置配置（使用屏幕绝对坐标）
  // 直接修改 x 和 y 来调整各按钮位置
  iconButtonsConfig = {
    button1: {
      x: SCREEN_WIDTH * 0.32,    // 左下角按钮的X坐标
      y: SCREEN_HEIGHT * 0.7,   // 第一个按钮的Y坐标
      width: 90,
      height: 90
    },
    button2: {
      x: SCREEN_WIDTH * 0.67,   // 右下角按钮的X坐标（中间）
      y: SCREEN_HEIGHT * 0.7,   // 第二个按钮的Y坐标
      width: 90,
      height: 90
    },
    button3: {
      x: SCREEN_WIDTH * 0.67,    // 右上角按钮的X坐标
      y: SCREEN_HEIGHT * 0.38,   // 第三个按钮的Y坐标
      width: 90,
      height: 90
    }
  };

  modulesBackdropImage = null; // 中间四个模块背后背景图
  moduleImages = {}; // 各模块背景图
  homeBgImage = null; // 首页背景图
  userAvatarImage = null; // 登录用户头像

  constructor() {
    this.loadResources();
    this.initModules();
    this.initButtons();
    this.initInfoBar();
    this.initStorage();
  }

  /**
   * 初始化存储检查
   */
  initStorage() {
    try {
      // 检查 tool_qyl 键是否存在
      wx.getStorage({
        key: 'tool_qyl',
        success: (res) => {
          // 如果存在，不做任何操作
          console.log('tool_qyl 已存在，值为:', res.data);
        },
        fail: (err) => {
          // 如果不存在，设置值为 0
          console.log('tool_qyl 不存在，设置初始值为 0');
          wx.setStorage({
            key: 'tool_qyl',
            data: 0,
            success: () => {
              console.log('tool_qyl 初始化成功');
            },
            fail: (setErr) => {
              console.warn('设置 tool_qyl 失败:', setErr);
            }
          });
        }
      });
    } catch (error) {
      console.warn('存储初始化失败:', error);
    }
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 首页背景图
    this.homeBgImage = wx.createImage();
    this.homeBgImage.src = 'images/bg12.png';
    this.homeBgImage.onerror = () => {
      console.warn('首页背景图加载失败');
      this.homeBgImage = null;
    };
    // （已移除左下角角色图片加载）

    // 加载按钮图片
    this.buttonImages = {};
    
    // 设置按钮图片
    this.buttonImages.settings = wx.createImage();
    this.buttonImages.settings.src = 'images/icon02.png';
    this.buttonImages.settings.onerror = () => {
      console.warn('设置按钮图片加载失败');
      this.buttonImages.settings = null;
    };
    
    // 消息按钮图片
    this.buttonImages.message = wx.createImage();
    this.buttonImages.message.src = 'images/icon03.png';
    this.buttonImages.message.onerror = () => {
      console.warn('消息按钮图片加载失败');
      this.buttonImages.message = null;
    };
    
    // 右侧导航按钮图片
    this.buttonImages.nextPage = wx.createImage();
    this.buttonImages.nextPage.src = 'images/icon05.png';
    this.buttonImages.nextPage.onerror = () => {
      console.warn('导航按钮图片加载失败');
      this.buttonImages.nextPage = null;
    };
    
    // 音乐控制按钮图片
    this.buttonImages.musicPlaying = wx.createImage();
    this.buttonImages.musicPlaying.src = 'images/icon11.png';
    this.buttonImages.musicPlaying.onerror = () => {
      console.warn('音乐播放按钮图片加载失败');
      this.buttonImages.musicPlaying = null;
    };

    this.buttonImages.musicPaused = wx.createImage();
    this.buttonImages.musicPaused.src = 'images/icon12.png';
    this.buttonImages.musicPaused.onerror = () => {
      console.warn('音乐暂停按钮图片加载失败');
      this.buttonImages.musicPaused = null;
    };

    // 用户信息底图（icon06.png）
    this.buttonImages.userInfo = wx.createImage();
    this.buttonImages.userInfo.src = 'images/icon06.png';
    this.buttonImages.userInfo.onerror = () => {
      console.warn('用户信息底图加载失败');
      this.buttonImages.userInfo = null;
    };

    // 中间四个模块背后的背景图 bg06.png
    this.modulesBackdropImage = wx.createImage();
    this.modulesBackdropImage.src = 'images/bg13.png';
    this.modulesBackdropImage.onerror = () => {
      console.warn('模块区域背景图加载失败');
      this.modulesBackdropImage = null;
    };

    // 各模块背景图
    this.moduleImages = {
      toolAssembly: wx.createImage(), // icon09.png
      toolAssemblyTop: wx.createImage(), // icon10.png
      iconButton1: wx.createImage(), // icon.png (第一个icon按钮)
      iconButton2: wx.createImage(), // icon.png (第二个icon按钮)
      iconButton3: wx.createImage(), // icon.png (第三个icon按钮)
      noodleLife: wx.createImage(),   // bg08.png
      emergencyChallenge: wx.createImage(), // bg09.png（名称显示为天气挑战）
      cornGrowth: wx.createImage()    // bg10.png（名称显示为害虫挑战）
    };
    this.moduleImages.toolAssembly.src = 'images/icon09.png';
    this.moduleImages.toolAssemblyTop.src = 'images/icon10.png';
    this.moduleImages.iconButton1.src = 'images/icon.png';
    this.moduleImages.iconButton2.src = 'images/icon.png';
    this.moduleImages.iconButton3.src = 'images/icon.png';
    this.moduleImages.noodleLife.src = 'images/bg08.png';
    this.moduleImages.emergencyChallenge.src = 'images/bg09.png';
    this.moduleImages.cornGrowth.src = 'images/bg10.png';
    // 错误处理
    Object.entries(this.moduleImages).forEach(([k, img]) => {
      img.onerror = () => {
        console.warn(`模块背景图加载失败: ${k}`);
        this.moduleImages[k] = null;
      };
    });
  }

  /**
   * 初始化游戏模块
   */
  initModules() {
    // 只初始化农具拼装按钮
    const buttonWidth = SCREEN_WIDTH * 0.24;  // 按钮宽度为屏幕宽度的30%
    const buttonHeight = buttonWidth * 0.33;  // 按钮高度为宽度的40%
    const buttonX = SCREEN_WIDTH * 0.25;      // 距离左边10%
    const buttonY = SCREEN_HEIGHT * 0.48;     // 距离顶部20%

    this.modules = [
      {
        key: 'toolAssembly',
        name: '',
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        unlocked: true,
        image: null
      }
    ];
  }

  /**
   * 初始化信息栏
   */
  initInfoBar() {
    // 信息栏已移除
    this.infoBar = {};
  }



  /**
   * 初始化按钮
   */
  initButtons() {
    this.buttons = {
      // 左上角用户信息（改为图片按钮区域，显示 icon06.png + 用户头像/昵称）
      userInfo: {
        x: 20,
        y: 20,
        width: 305,
        height: 100,
        nickname: ''
      },
      // 右上角消息按钮（图片）
      message: {
        x: SCREEN_WIDTH - 335,
        y: 33,
        width: 100,
        height: 100,
        text: '消息',
        icon: '🔔',
        unreadCount: 0  // 设置为0，不显示红点
      },
      // 音乐控制按钮（位于消息与设置之间，图片）
      music: {
        x: SCREEN_WIDTH - 225,
        y: 33,
        width: 100,
        height: 100,
        text: '音乐'
      },
      // 右上角设置按钮（图片）
      settings: {
        x: SCREEN_WIDTH - 120,
        y: 33,
        width: 100,
        height: 100,
        text: '设置',
        icon: '⚙️'
      },
      // 右侧圆形导航按钮
      nextPage: {
        x: SCREEN_WIDTH - 123,
        y: SCREEN_HEIGHT / 2 + 20,
        width: 110,
        height: 100,
        icon: '>'
      }
    };
  }

  /**
   * 渲染主页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制首页背景图（失败则使用渐变）
    if (this.homeBgImage && this.homeBgImage.complete && this.homeBgImage.naturalWidth !== 0) {
      try {
        ctx.drawImage(this.homeBgImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } catch (e) {
        console.warn('首页背景图绘制失败，使用渐变');
        const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
      gradient.addColorStop(0, '#90EE90');
      gradient.addColorStop(1, '#98FB98');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    // 绘制游戏模块（内部会先绘制模块区域背景图，再绘制各模块）
    this.renderModules(ctx);

    // 绘制按钮
    this.renderButtons(ctx);

    // （已移除左下角角色与对话气泡）
  }





  /**
   * 渲染游戏模块
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderModules(ctx) {
    // 先绘制背景图（bg13.png）
    if (this.modulesBackdropImage && this.modulesBackdropImage.complete && this.modulesBackdropImage.naturalWidth !== 0) {
      try {
        // 使用设置的位置和大小
        const { x, y, width, height } = this.modulesBackdropStyle;
        
        // 保持图片原比例
        const imgRatio = this.modulesBackdropImage.naturalWidth / this.modulesBackdropImage.naturalHeight;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (width / height > imgRatio) {
          // 区域比图片更宽，以高度为准
          drawHeight = height;
          drawWidth = drawHeight * imgRatio;
          drawX = x + (width - drawWidth) / 2;
          drawY = y;
        } else {
          // 区域比图片更高，以宽度为准
          drawWidth = width;
          drawHeight = drawWidth / imgRatio;
          drawX = x;
          drawY = y + (height - drawHeight) / 2;
        }

        ctx.drawImage(this.modulesBackdropImage, drawX, drawY, drawWidth, drawHeight);
      } catch (e) {
        console.warn('模块区域背景图绘制失败:', e);
      }
    }

    // 绘制农具拼装按钮
    const toolAssembly = this.modules[0]; // 现在只有一个模块
    if (toolAssembly) {
      // 绘制农具拼装按钮背景（icon09.png）
      const bgImg = this.moduleImages && this.moduleImages.toolAssembly;
      if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        try {
          // 保持图片原比例
          const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
          const drawHeight = toolAssembly.height;
          const drawWidth = drawHeight * imgRatio;
          const drawX = toolAssembly.x + (toolAssembly.width - drawWidth) / 2;
          ctx.drawImage(bgImg, drawX, toolAssembly.y, drawWidth, drawHeight);
        } catch (e) {
          console.warn('农具拼装按钮背景绘制失败:', e);
        }
      }
    }

    // 在农具拼装按钮上方绘制 icon10.png
    if (toolAssembly) {
      const topImg = this.moduleImages && this.moduleImages.toolAssemblyTop;
      if (topImg && topImg.complete && topImg.naturalWidth !== 0) {
        try {
          // 保持图片原比例
          const imgRatio = topImg.naturalWidth / topImg.naturalHeight;
          const drawHeight = toolAssembly.height * 1.5; // 设置为模块高度的40%
          const drawWidth = drawHeight * imgRatio;
          const drawX = toolAssembly.x + (toolAssembly.width - drawWidth) / 2;
          const drawY = toolAssembly.y - drawHeight - 5; // 在模块上方10像素
          ctx.drawImage(topImg, drawX, drawY, drawWidth, drawHeight);
        } catch (e) {
          console.warn('农具拼装上方图片绘制失败:', e);
        }
      }
    }

    // 在所有图层绘制完成后，最后绘制农具拼装文字（白色），确保显示在最上层
    if (toolAssembly && toolAssembly.name) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 添加文字阴影效果，增强可读性
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(toolAssembly.name, toolAssembly.x + toolAssembly.width / 2, toolAssembly.y + toolAssembly.height / 2);
      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // 绘制3个icon按钮（使用屏幕绝对坐标）
    Object.entries(this.iconButtonsConfig).forEach(([buttonKey, config]) => {
      const imageKey = buttonKey.replace('button', 'iconButton'); // button1 -> iconButton1
      const img = this.moduleImages[imageKey];
      
      if (img && img.complete && img.naturalWidth !== 0) {
        try {
          // 直接使用配置中的绝对坐标
          ctx.drawImage(img, config.x, config.y, config.width, config.height);
        } catch (e) {
          console.warn(`绘制${buttonKey}失败:`, e);
        }
      }
    });
  }

  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderButtons(ctx) {
    Object.entries(this.buttons).forEach(([key, button]) => {
      if (key === 'userInfo') {
        // 渲染用户信息
        this.renderUserInfo(ctx, button);
      } else if (key === 'nextPage') {
        // 渲染下一页按钮
        this.renderNextPageButton(ctx, button);
      } else {
        // 渲染普通按钮
        this.renderNormalButton(ctx, button);
      }
    });
  }

  /**
   * 渲染用户信息
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} userInfo - 用户信息对象
   */
  renderUserInfo(ctx, userInfo) {
    // 背景底图：icon06.png
    if (this.buttonImages.userInfo && this.buttonImages.userInfo.complete && this.buttonImages.userInfo.naturalWidth !== 0) {
      try {
        ctx.drawImage(this.buttonImages.userInfo, userInfo.x, userInfo.y, userInfo.width, userInfo.height);
      } catch (e) {
        console.warn('用户信息底图绘制失败');
      }
    }

    // 确保头像资源加载
    this.ensureUserAvatarLoaded();

    // 绘制用户头像（圆形裁剪）
    const avatarSize = 80;
    const avatarX = userInfo.x + 11;
    const avatarY = userInfo.y + (userInfo.height - avatarSize) / 2;
    if (this.userAvatarImage && this.userAvatarImage.complete && this.userAvatarImage.naturalWidth !== 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      try {
        ctx.drawImage(this.userAvatarImage, avatarX, avatarY, avatarSize, avatarSize);
      } catch (e) {
        console.warn('用户头像绘制失败');
      }
      ctx.restore();
    }

    // 绘制昵称（登录获取），白色显示在icon06.png上方
    const nickname = (GameGlobal.databus.userInfo && GameGlobal.databus.userInfo.nickName) ? GameGlobal.databus.userInfo.nickName : '';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    // 添加文字阴影效果，增强可读性
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(nickname, avatarX + avatarSize + 25, userInfo.y + userInfo.height / 2);
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // 确保已加载用户头像图片
  ensureUserAvatarLoaded() {
    const avatarUrl = GameGlobal.databus && GameGlobal.databus.userInfo && GameGlobal.databus.userInfo.avatarUrl;
    if (!avatarUrl) return;
    if (this.userAvatarImage && this.userAvatarImage.src === avatarUrl) return;
    this.userAvatarImage = wx.createImage();
    this.userAvatarImage.src = avatarUrl;
    this.userAvatarImage.onerror = () => {
      console.warn('用户头像加载失败');
      this.userAvatarImage = null;
    };
  }

  /**
   * 渲染下一页按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderNextPageButton(ctx, button) {
    // 如果有导航按钮图片，使用图片；否则使用默认样式
    if (this.buttonImages && this.buttonImages.nextPage && 
        this.buttonImages.nextPage.complete && this.buttonImages.nextPage.naturalWidth !== 0) {
      try {
        // 绘制导航按钮图片
        ctx.drawImage(this.buttonImages.nextPage, button.x, button.y, button.width, button.height);
      } catch (error) {
        console.warn('导航按钮图片绘制失败，使用默认样式:', error);
        this.renderDefaultNextPageButton(ctx, button);
      }
    } else {
      // 使用默认样式
      this.renderDefaultNextPageButton(ctx, button);
    }
  }

  /**
   * 渲染默认下一页按钮样式（绿色圆形）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderDefaultNextPageButton(ctx, button) {
    // 绘制绿色圆形按钮
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制白色箭头
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);
  }

  /**
   * 渲染普通按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderNormalButton(ctx, button) {
    // 根据按钮类型获取对应的图片
    const buttonKey = this.getButtonKey(button);
    let buttonImage;
    
    // 如果是音乐按钮，根据播放状态选择图片
    if (buttonKey === 'music') {
      buttonImage = GameGlobal.databus.isMusicPlaying 
        ? this.buttonImages.musicPlaying 
        : this.buttonImages.musicPaused;
    } else {
      buttonImage = this.buttonImages && this.buttonImages[buttonKey];
    }
    
    if (buttonImage && buttonImage.complete && buttonImage.naturalWidth !== 0) {
      try {
        // 绘制按钮图片
        ctx.drawImage(buttonImage, button.x, button.y, button.width, button.height);
        
        // 如果是消息按钮且有未读消息，绘制红点
        if (buttonKey === 'message' && button.unreadCount && button.unreadCount > 0) {
          ctx.fillStyle = '#FF0000';
          ctx.beginPath();
          ctx.arc(button.x + button.width - 5, button.y + 5, 8, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(button.unreadCount.toString(), button.x + button.width - 5, button.y + 5);
        }
      } catch (error) {
        console.warn(`${buttonKey}按钮图片绘制失败，使用默认样式:`, error);
        this.renderDefaultButton(ctx, button);
      }
    } else {
      // 图片未加载或加载失败，使用默认样式
      this.renderDefaultButton(ctx, button);
    }
  }

  /**
   * 获取按钮对应的键名
   * @param {Object} button - 按钮对象
   * @returns {string} 按钮键名
   */
  getButtonKey(button) {
    // 根据按钮属性判断类型
    if (button.text === '消息') return 'message';
    if (button.text === '设置') return 'settings';
    if (button.text === '音乐') return 'music';
    if (button.icon === '>') return 'nextPage';
    return 'unknown';
  }

  /**
   * 渲染默认按钮样式（当图片加载失败时）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderDefaultButton(ctx, button) {
    if (button.text) {
      // 绘制白色圆形按钮
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制图标
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);

      // 绘制文字
      ctx.fillStyle = '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height + 5);

      // 如果有未读消息，绘制红点
      if (button.unreadCount && button.unreadCount > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(button.x + button.width / 2 + 10, button.y + button.height / 2 - 10, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText(button.unreadCount.toString(), button.x + button.width / 2 + 10, button.y + button.height / 2 - 10);
      }
    } else {
      // 绘制圆形按钮（如nextPage）
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制图标
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);
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

    console.log('触摸位置:', x, y);

    // 优先检查农具拼装按钮点击（顶层优先）
    const toolAssembly = this.modules[0]; // 现在只有一个模块
    if (toolAssembly) {
      const isInModule = x >= toolAssembly.x && x <= toolAssembly.x + toolAssembly.width &&
                        y >= toolAssembly.y && y <= toolAssembly.y + toolAssembly.height;
      
      if (isInModule) {
        console.log('点击农具拼装按钮');
        GameGlobal.pageManager.switchToPage('toolAssembly');
        this.showToast('进入农具拼装');
        return;
      }
    }

    // 检查其他按钮点击
    Object.entries(this.buttons).forEach(([key, button]) => {
      const isInButton = x >= button.x && x <= button.x + button.width &&
                        y >= button.y && y <= button.y + button.height;
      
      if (isInButton) {
        console.log('点击按钮:', key);
        this.handleButtonClick(key);
        return;
      }
    });

    // 最后检查是否点击了背景图区域
    const { x: bgX, y: bgY, width: bgWidth, height: bgHeight } = this.modulesBackdropStyle;
    if (x >= bgX && x <= bgX + bgWidth && y >= bgY && y <= bgY + bgHeight) {
      console.log('点击背景图区域');
      this.showToast('活动未开启～');
      return;
    }
  }



  /**
   * 处理按钮点击
   * @param {string} buttonKey - 按钮键名
   */
  handleButtonClick(buttonKey) {
    switch (buttonKey) {
      case 'userInfo':
        this.showUserInfoDialog();
        break;
      case 'message':
        this.showMessageDialog();
        break;
      case 'music':
        const isPlaying = GameGlobal.databus.toggleMusic();
        this.showToast(isPlaying ? '音乐已播放' : '音乐已暂停');
        break;
      case 'settings':
        this.showSettingsDialog();
        break;
      case 'nextPage':
        this.showNextPageDialog();
        break;
    }
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    console.log('尝试显示Toast:', message);
    
    // 使用导入的showToast函数
    const { showToast: showToastUtil } = require('../utils/toast');
    showToastUtil(message);
    
    // 同时使用微信原生Toast作为备用
    if (GameGlobal.wechatAPI) {
      GameGlobal.wechatAPI.showToast(message);
    }
  }

  /**
   * 显示消息对话框
   */
  showMessageDialog() {
    console.log('显示消息对话框');
    this.showToast('奖杯系统开发中...');
  }

  /**
   * 显示用户信息对话框
   */
  showUserInfoDialog() {
    console.log('显示用户信息对话框');
    this.showToast('用户信息功能开发中...');
  }

  /**
   * 显示设置对话框
   */
  showSettingsDialog() {
    console.log('显示设置对话框');
    
    // 使用微信原生模态框显示退出登录确认
    GameGlobal.wechatAPI.showModal({
      title: '设置',
      content: '是否退出登录？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确认'
    }).then((confirmed) => {
      if (confirmed) {
        console.log('用户确认退出登录');
        this.logout();
      } else {
        console.log('用户取消退出登录');
      }
    }).catch((error) => {
      console.error('显示设置对话框失败:', error);
      this.showToast('操作失败，请重试');
    });
  }

  /**
   * 显示下一页对话框
   */
  showNextPageDialog() {
    console.log('显示下一页对话框');
    this.showToast('敬请期待');
  }

  /**
   * 退出登录
   */
  logout() {
    try {
      console.log('开始退出登录流程...');
      
      // 显示退出中提示
      this.showToast('正在退出登录...');
      
      // 清除数据总线中的用户信息
      GameGlobal.databus.clearUserInfo();
      
      // 清除本地存储的登录信息
      wx.removeStorageSync('loginInfo');
      
      // 跳转到登录页面
      GameGlobal.pageManager.switchToPage('login');
      
      // 显示退出成功提示
      setTimeout(() => {
        this.showToast('已退出登录');
      }, 500);
      
      console.log('退出登录成功');
    } catch (error) {
      console.error('退出登录失败:', error);
      this.showToast('退出登录失败，请重试');
    }
  }



  /**
   * 更新页面
   */
  update() {
    // 不再显示未读消息数量
    this.buttons.message.unreadCount = 0;
    
    // 更新用户信息
    if (GameGlobal.databus.userInfo) {
      this.buttons.userInfo.nickname = GameGlobal.databus.userInfo.nickName || '可心';
    }
  }


}
