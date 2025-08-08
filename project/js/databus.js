import Pool from './base/pool';

let instance;

/**
 * 全局状态管理器
 * 负责管理游戏的状态，包括用户数据、任务进度、游戏状态等
 */
export default class DataBus {
  // 游戏基础数据
  frame = 0; // 当前帧数
  pool = new Pool(); // 初始化对象池

  // 用户数据
  userInfo = null; // 用户信息
  isLoggedIn = false; // 登录状态

  // 任务和进度数据
  tasksInProgress = 1; // 进行中的任务数量
  tasksCompleted = 10; // 已完成的任务数量
  challengesCompleted = 4; // 已完成的挑战数量
  trophyCount = 5; // 奖杯数量

  // 游戏模块状态
  modules = {
    toolAssembly: { unlocked: true, name: '农具拼装' },
    noodleLife: { unlocked: false, name: '面条的一生' },
    emergencyChallenge: { unlocked: false, name: '突发状况挑战' },
    cornGrowth: { unlocked: false, name: '玉米生长过程' }
  };

  // 农具拼接游戏数据
  currentToolIndex = 0; // 当前农具索引
  toolSteps = {
    step1: { status: 'in_progress', name: '第一步' },
    step2: { status: 'locked', name: '第二步' },
    step3: { status: 'locked', name: '第三步' }
  };

  // 通知系统
  notifications = []; // 通知列表
  unreadCount = 1; // 未读消息数量

  // 页面状态
  currentPage = 'login'; // 当前页面，默认为登录页
  pageHistory = []; // 页面历史

  constructor() {
    // 确保单例模式
    if (instance) return instance;

    instance = this;
  }

  // 重置游戏状态
  reset() {
    this.frame = 0;
    this.currentPage = 'login'; // 重置时回到登录页
    this.pageHistory = [];
  }

  // 设置用户信息
  setUserInfo(userInfo) {
    this.userInfo = userInfo;
    this.isLoggedIn = true;
    // 保存到本地存储
    wx.setStorageSync('loginInfo', {
      isLoggedIn: true,
      userInfo: userInfo
    });
  }

  // 清除用户信息
  clearUserInfo() {
    this.userInfo = null;
    this.isLoggedIn = false;
    // 清除本地存储
    wx.removeStorageSync('loginInfo');
  }

  // 切换页面
  switchPage(pageName) {
    this.pageHistory.push(this.currentPage);
    this.currentPage = pageName;
  }

  // 返回上一页
  goBack() {
    if (this.pageHistory.length > 0) {
      this.currentPage = this.pageHistory.pop();
    }
  }

  // 更新任务进度
  updateTaskProgress(type, count) {
    switch (type) {
      case 'inProgress':
        this.tasksInProgress = count;
        break;
      case 'completed':
        this.tasksCompleted = count;
        break;
      case 'challenges':
        this.challengesCompleted = count;
        break;
      case 'trophies':
        this.trophyCount = count;
        break;
    }
  }

  // 切换农具
  switchTool(direction) {
    const toolList = Object.keys(this.modules).filter(key => this.modules[key].unlocked);
    const currentIndex = toolList.indexOf(Object.keys(this.modules)[this.currentToolIndex]);
    
    if (direction === 'next') {
      this.currentToolIndex = (currentIndex + 1) % toolList.length;
    } else if (direction === 'prev') {
      this.currentToolIndex = currentIndex === 0 ? toolList.length - 1 : currentIndex - 1;
    }
  }

  // 更新农具步骤状态
  updateToolStep(stepIndex, status) {
    const stepKeys = Object.keys(this.toolSteps);
    if (stepKeys[stepIndex]) {
      this.toolSteps[stepKeys[stepIndex]].status = status;
    }
  }

  // 添加通知
  addNotification(message) {
    this.notifications.unshift({
      id: Date.now(),
      message: message,
      timestamp: new Date().toLocaleString(),
      isRead: false
    });
    this.unreadCount++;
  }

  // 标记通知为已读
  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  // 获取当前农具信息
  getCurrentTool() {
    const toolList = Object.keys(this.modules).filter(key => this.modules[key].unlocked);
    const currentToolKey = toolList[this.currentToolIndex];
    return {
      key: currentToolKey,
      ...this.modules[currentToolKey]
    };
  }
}
