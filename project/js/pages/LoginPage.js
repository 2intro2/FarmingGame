import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';

/**
 * 登录页面
 */
export default class LoginPage {
  backgroundImage = null;
  loginButton = {
    x: SCREEN_WIDTH * 0.5 - 100, // 按钮x轴坐标（居中显示）
    y: SCREEN_HEIGHT * 0.7, // 按钮y轴坐标（与原位置保持一致）
    width: 200, // 按钮宽度（适合图片显示）
    height: 200, // 按钮高度（适合图片显示，保持正方形）
    type: 'image' // 标记为图片按钮
  };

  constructor() {
    this.loadResources();
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载背景图片
    this.backgroundImage = wx.createImage();
    this.backgroundImage.src = 'images/bg01.jpeg';
    
    // 添加图片加载错误处理
    this.backgroundImage.onerror = () => {
      console.warn('背景图片加载失败，将使用默认背景');
      this.backgroundImage = null;
    };
    
    // 加载按钮图片
    this.buttonImage = wx.createImage();
    this.buttonImage.src = 'images/icon01.png';
    
    // 添加按钮图片加载完成处理
    this.buttonImage.onload = () => {
      console.log('按钮图片加载完成，尺寸:', this.buttonImage.naturalWidth, 'x', this.buttonImage.naturalHeight);
      this.adjustButtonSize();
    };
    
    // 添加按钮图片加载错误处理
    this.buttonImage.onerror = () => {
      console.warn('按钮图片加载失败，将使用备用按钮');
      this.buttonImage = null;
    };
  }

  /**
   * 渲染登录页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制背景
    if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth !== 0) {
      try {
        ctx.drawImage(this.backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } catch (error) {
        console.warn('背景图片绘制失败:', error);
        this.drawDefaultBackground(ctx);
      }
    } else {
      // 如果图片未加载完成或加载失败，绘制默认背景
      this.drawDefaultBackground(ctx);
    }

    // 绘制登录按钮
    this.renderLoginButton(ctx);
  }

  /**
   * 绘制默认背景
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  drawDefaultBackground(ctx) {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#90EE90');  // 浅绿色
    gradient.addColorStop(1, '#32CD32');  // 深绿色
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  /**
   * 根据图像比例调整按钮尺寸
   */
  adjustButtonSize() {
    if (this.buttonImage && this.buttonImage.complete && this.buttonImage.naturalWidth !== 0) {
      const imgWidth = this.buttonImage.naturalWidth;
      const imgHeight = this.buttonImage.naturalHeight;
      
      // 设置最大按钮尺寸
      const maxWidth = 500;
      const maxHeight = 500;
      
      // 计算缩放比例，保持原比例
      const scaleX = maxWidth / imgWidth;
      const scaleY = maxHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY); // 使用较小的缩放比例以保持原比例
      
      // 计算按钮尺寸
      const buttonWidth = imgWidth * scale;
      const buttonHeight = imgHeight * scale;
      
      // 更新按钮尺寸和位置
      this.loginButton.width = buttonWidth;
      this.loginButton.height = buttonHeight;
      this.loginButton.x = SCREEN_WIDTH * 0.5 - buttonWidth / 2; // 居中显示
      this.loginButton.y = SCREEN_HEIGHT * 0.7;
      
      console.log('按钮尺寸已调整:', buttonWidth, 'x', buttonHeight);
    }
  }

  /**
   * 渲染登录按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderLoginButton(ctx) {
    const btn = this.loginButton;
    
    // 如果有按钮图片且加载完成，绘制图片
    if (this.buttonImage && this.buttonImage.complete && this.buttonImage.naturalWidth !== 0) {
      try {
        // 绘制图片作为按钮的完整内容
        ctx.drawImage(this.buttonImage, btn.x, btn.y, btn.width, btn.height);
      } catch (error) {
        console.warn('按钮图片绘制失败:', error);
        this.renderFallbackButton(ctx, btn);
      }
    } else {
      // 没有图片或图片加载失败，使用备用按钮
      this.renderFallbackButton(ctx, btn);
    }
  }

  /**
   * 渲染备用按钮（当图片加载失败时）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} btn - 按钮对象
   */
  renderFallbackButton(ctx, btn) {
    // 绘制圆形背景
    ctx.fillStyle = '#1AAD19'; // 微信绿色
    ctx.beginPath();
    ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制微信图标文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('微', btn.x + btn.width / 2, btn.y + btn.height / 2);
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    // 检查是否点击了登录按钮
    const btn = this.loginButton;
    if (x >= btn.x && x <= btn.x + btn.width &&
        y >= btn.y && y <= btn.y + btn.height) {
      this.handleLogin();
    }
  }

  /**
   * 处理登录
   */
  handleLogin() {
    console.log('开始微信登录流程...');
    
    // 显示加载提示
    this.showToast('正在登录...');
    
    // 调用微信登录
    GameGlobal.wechatAPI.login().then(userInfo => {
      console.log('登录成功，用户信息:', userInfo);
      
      // 保存登录状态到本地存储
      try {
        wx.setStorageSync('loginInfo', {
          isLoggedIn: true,
          userInfo: userInfo,
          loginTime: Date.now()
        });
      } catch (error) {
        console.warn('保存登录状态失败:', error);
      }
      
      // 设置用户信息到数据总线
      GameGlobal.databus.setUserInfo(userInfo);
      
      // 切换到主页
      GameGlobal.pageManager.switchToPage('home');
      
      // 显示成功提示
      this.showToast('登录成功！');
      
    }).catch(error => {
      console.error('登录失败:', error);
      
      // 根据错误类型显示不同的提示
      let errorMessage = '登录失败，请重试';
      if (error.message) {
        if (error.message.includes('用户拒绝授权')) {
          errorMessage = '需要授权才能使用游戏功能，请重新登录';
        } else if (error.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message.includes('code')) {
          errorMessage = '登录凭证获取失败，请重试';
        }
      }
      
      // 显示错误提示
      this.showToast(errorMessage);
    });
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    // 使用导入的showToast函数
    const { showToast: showToastUtil } = require('../utils/toast');
    showToastUtil(message);
  }

  /**
   * 更新页面
   */
  update() {
    // 登录页面不需要特殊更新逻辑
  }
}
