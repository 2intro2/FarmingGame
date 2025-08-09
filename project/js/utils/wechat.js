/**
 * 微信API工具类
 * 封装微信小游戏相关的API调用
 */
export default class WechatAPI {
  constructor() {
    // 初始化微信API
    this.init();
  }

  /**
   * 初始化微信API
   */
  init() {
    // 监听触摸事件
      wx.onTouchStart(this.handleTouchStart.bind(this));
      wx.onTouchCancel(this.handleTouchEnd.bind(this)); // 触摸取消时也当作结束处理
    // 拖拽需要的移动与结束事件
    if (wx.onTouchMove) {
      wx.onTouchMove(this.handleTouchMove.bind(this));
    }
    if (wx.onTouchEnd) {
      wx.onTouchEnd(this.handleTouchEnd.bind(this));
    }
  }

  /**
   * 处理触摸开始事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchStart(event) {
    console.log('WechatAPI: touchstart');
    // 将触摸事件传递给当前页面
    if (GameGlobal.pageManager && GameGlobal.pageManager.currentPage) {
      // 如果页面有专门的 handleTouchStart 方法，优先使用
      if (GameGlobal.pageManager.currentPage.handleTouchStart) {
        GameGlobal.pageManager.currentPage.handleTouchStart(event);
      } else {
        // 否则使用通用的 handleTouch 方法
        GameGlobal.pageManager.currentPage.handleTouch(event);
      }
    }
  }

  /**
   * 处理触摸移动事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchMove(event) {
    console.log('WechatAPI: touchmove');
    // 将触摸事件传递给当前页面
    if (GameGlobal.pageManager && GameGlobal.pageManager.currentPage) {
      if (GameGlobal.pageManager.currentPage.handleTouchMove) {
        GameGlobal.pageManager.currentPage.handleTouchMove(event);
      }
    }
  }

  /**
   * 处理触摸结束事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchEnd(event) {
    console.log('WechatAPI: touchend');
    // 将触摸事件传递给当前页面
    if (GameGlobal.pageManager && GameGlobal.pageManager.currentPage) {
      if (GameGlobal.pageManager.currentPage.handleTouchEnd) {
        GameGlobal.pageManager.currentPage.handleTouchEnd(event);
      }
    }
  }

  /**
   * 微信登录（标准流程）
   * @returns {Promise} 返回用户信息
   */
  login() {
    return new Promise((resolve, reject) => {
      // 第一步：调用 wx.login 获取 code
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            console.log('获取到登录凭证 code:', loginRes.code);
            // 第二步：调用 wx.getUserProfile 获取用户信息（2023年后推荐）
            this.getUserProfile(loginRes.code).then(resolve).catch(reject);
          } else {
            reject(new Error('微信登录失败：未获取到code'));
          }
        },
        fail: (error) => {
          console.error('wx.login 失败:', error);
          reject(new Error('微信登录失败：' + (error.errMsg || '未知错误')));
        }
      });
    });
  }

  /**
   * 获取用户信息（使用 getUserProfile，2023年后推荐）
   * @param {string} code - 登录凭证
   * @returns {Promise} 返回用户信息
   */
  getUserProfile(code) {
    return new Promise((resolve, reject) => {
      // 使用 getUserProfile 获取用户信息
      wx.getUserProfile({
        desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
        success: (profileRes) => {
          console.log('获取用户信息成功:', profileRes);
          const userInfo = {
            nickName: profileRes.userInfo.nickName || '用户',
            avatarUrl: profileRes.userInfo.avatarUrl || '',
            gender: profileRes.userInfo.gender || 0,
            country: profileRes.userInfo.country || '',
            province: profileRes.userInfo.province || '',
            city: profileRes.userInfo.city || '',
            language: profileRes.userInfo.language || 'zh_CN',
            code: code
          };

          // 第三步：将 code 和用户信息一起发送给后端
          this.callBackendAPI('login', {
            code: code,
            userInfo: userInfo
          }).then((backendData) => {
            // 合并后端返回的数据
            const finalUserInfo = {
              ...userInfo,
              ...backendData,
              loginTime: Date.now()
            };
            console.log('登录成功，用户信息:', finalUserInfo);
            resolve(finalUserInfo);
          }).catch(reject);
        },
        fail: (error) => {
          console.error('wx.getUserProfile 失败:', error);
          reject(new Error('获取用户信息失败：' + (error.errMsg || '用户拒绝授权')));
        }
      });
    });
  }

  /**
   * 获取用户信息（兼容旧版本）
   * @param {string} code - 登录凭证
   * @returns {Promise} 返回用户信息
   */
  getUserInfo(code) {
    return new Promise((resolve, reject) => {
      // 获取用户信息（旧接口，不推荐使用）
      wx.getUserInfo({
        success: (res) => {
          console.log('获取用户信息成功（旧接口）:', res);
          const userInfo = {
            nickName: res.userInfo.nickName || '用户',
            avatarUrl: res.userInfo.avatarUrl || '',
            gender: res.userInfo.gender || 0,
            country: res.userInfo.country || '',
            province: res.userInfo.province || '',
            city: res.userInfo.city || '',
            language: res.userInfo.language || 'zh_CN',
            code: code
          };

          // 调用后端接口
          this.callBackendAPI('login', {
            code: code,
            userInfo: userInfo
          }).then((backendData) => {
            const finalUserInfo = {
              ...userInfo,
              ...backendData,
              loginTime: Date.now()
            };
            resolve(finalUserInfo);
          }).catch(reject);
        },
        fail: (error) => {
          console.error('wx.getUserInfo 失败:', error);
          reject(new Error('获取用户信息失败：' + (error.errMsg || '用户拒绝授权')));
        }
      });
    });
  }

  /**
   * 调用后端API
   * @param {string} apiName - API名称
   * @param {Object} data - 请求数据
   * @returns {Promise} 返回API响应
   */
  callBackendAPI(apiName, data) {
    return new Promise((resolve, reject) => {
      // 这里应该调用真实的后端接口
      // 目前使用模拟数据
      console.log(`调用后端API: ${apiName}`, data);
      
      // 模拟网络延迟
      setTimeout(() => {
        switch (apiName) {
          case 'login':
            resolve({
              userId: 'user_' + Date.now(),
              sessionKey: 'session_' + Math.random().toString(36).substr(2, 9),
              tasksInProgress: 1,
              tasksCompleted: 10,
              challengesCompleted: 4,
              trophyCount: 5
            });
            break;
          case 'getUserData':
            resolve({
              tasksInProgress: 1,
              tasksCompleted: 10,
              challengesCompleted: 4,
              trophyCount: 5,
              notifications: []
            });
            break;
          case 'updateProgress':
            resolve({ success: true });
            break;
          default:
            reject(new Error(`未知的API: ${apiName}`));
        }
      }, 500);
    });
  }

  /**
   * 获取用户数据
   * @returns {Promise} 返回用户数据
   */
  getUserData() {
    return this.callBackendAPI('getUserData', {});
  }

  /**
   * 更新用户进度
   * @param {Object} progressData - 进度数据
   * @returns {Promise} 返回更新结果
   */
  updateProgress(progressData) {
    return this.callBackendAPI('updateProgress', progressData);
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  showToast(message, options = {}) {
    wx.showToast({
      title: message,
      icon: options.icon || 'none',
      duration: options.duration || 2000
    });
  }

  /**
   * 显示模态对话框
   * @param {Object} options - 对话框选项
   * @returns {Promise} 返回用户选择
   */
  showModal(options) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: options.title || '提示',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        cancelText: options.cancelText || '取消',
        confirmText: options.confirmText || '确定',
        success: (res) => {
          if (res.confirm) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: reject
      });
    });
  }

  /**
   * 获取系统信息
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    return wx.getSystemInfoSync();
  }

  /**
   * 设置本地存储
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  setStorage(key, value) {
    wx.setStorageSync(key, value);
  }

  /**
   * 获取本地存储
   * @param {string} key - 键名
   * @returns {any} 存储的值
   */
  getStorage(key) {
    return wx.getStorageSync(key);
  }

  /**
   * 移除本地存储
   * @param {string} key - 键名
   */
  removeStorage(key) {
    wx.removeStorageSync(key);
  }

  /**
   * 播放音效
   * @param {string} src - 音效文件路径
   * @param {Object} options - 播放选项
   */
  playSound(src, options = {}) {
    const audio = wx.createInnerAudioContext();
    audio.src = src;
    audio.loop = options.loop || false;
    audio.volume = options.volume || 1.0;
    audio.play();
  }

  /**
   * 振动反馈
   * @param {string} type - 振动类型
   */
  vibrate(type = 'short') {
    if (type === 'short') {
      wx.vibrateShort();
    } else {
      wx.vibrateLong();
    }
  }
}
