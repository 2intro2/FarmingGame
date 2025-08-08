// 小游戏主入口
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 游戏状态管理
const gameState = {
  currentScene: 'login', // login, home, tool-assemble, video-game
  userInfo: null,
  taskCount: 1,
  finishedTaskCount: 10,
  challengeDoneCount: 4,
  trophyCount: 5,
  modules: [
    { name: '农具拼接', unlocked: true },
    { name: '模块2', unlocked: false },
    { name: '模块3', unlocked: false },
    { name: '模块4', unlocked: false }
  ]
};

// 场景管理
const scenes = {
  login: {
    init() {
      this.loadBackground();
      this.drawLoginUI();
    },
    loadBackground() {
      const bg = wx.createImage();
      bg.src = 'images/004.png';
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      };
    },
    drawLoginUI() {
      // 绘制登录按钮
      ctx.fillStyle = '#3bb46e';
      ctx.fillRect(canvas.width/2 - 160, canvas.height/2 + 100, 320, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('立即登录', canvas.width/2, canvas.height/2 + 150);
      
      // 绘制标题
      ctx.fillStyle = '#f7f7b6';
      ctx.font = '48px Arial';
      ctx.fillText('童趣农耕小天地', canvas.width/2, canvas.height/2);
      
      ctx.fillStyle = '#3a3a3a';
      ctx.font = '32px Arial';
      ctx.fillText('Welcome to\nlearn about farming knowledge', canvas.width/2, canvas.height/2 - 100);
    },
    handleTouch(e) {
      const { x, y } = e.touches[0];
      const btnX = canvas.width/2 - 160;
      const btnY = canvas.height/2 + 100;
      
      if (x >= btnX && x <= btnX + 320 && y >= btnY && y <= btnY + 80) {
        this.login();
      }
    },
    login() {
      wx.login({
        success: (res) => {
          console.log('登录成功:', res);
          gameState.currentScene = 'home';
          scenes.home.init();
        }
      });
    }
  },
  
  home: {
    init() {
      this.drawHomeUI();
    },
    drawHomeUI() {
      // 清空画布
      ctx.fillStyle = '#f6fff6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制顶部状态栏
      this.drawStatusBar();
      
      // 绘制模块卡片
      this.drawModules();
      
      // 绘制右侧圆形按钮
      this.drawCircleButton();
    },
    drawStatusBar() {
      ctx.fillStyle = '#333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      
      // 用户信息
      ctx.fillText('可心', 20, 40);
      
      // 状态信息
      const statusText = `任务：${gameState.taskCount}/${gameState.finishedTaskCount}  奖杯：${gameState.trophyCount}`;
      ctx.fillText(statusText, 20, 80);
      
      // 按钮
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(canvas.width - 140, 20, 60, 60);
      ctx.fillRect(canvas.width - 70, 20, 60, 60);
      
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('消息', canvas.width - 110, 55);
      ctx.fillText('设置', canvas.width - 40, 55);
    },
    drawModules() {
      const moduleWidth = 300;
      const moduleHeight = 180;
      const startX = (canvas.width - moduleWidth * 2) / 2;
      const startY = 120;
      
      gameState.modules.forEach((module, index) => {
        const x = startX + (index % 2) * (moduleWidth + 40);
        const y = startY + Math.floor(index / 2) * (moduleHeight + 40);
        
        // 模块背景
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, moduleWidth, moduleHeight);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, moduleWidth, moduleHeight);
        
        // 模块名称
        ctx.fillStyle = '#333';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(module.name, x + moduleWidth/2, y + moduleHeight/2);
        
        // 锁图标（未解锁模块）
        if (!module.unlocked) {
          ctx.fillStyle = '#ccc';
          ctx.fillRect(x + 10, y + 10, 48, 48);
        }
      });
    },
    drawCircleButton() {
      // 绘制右侧圆形按钮（模块2和模块4之间）
      ctx.fillStyle = '#3bb46e';
      ctx.beginPath();
      ctx.arc(canvas.width - 50, canvas.height/2, 30, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('>', canvas.width - 50, canvas.height/2 + 12);
    },
    handleTouch(e) {
      const { x, y } = e.touches[0];
      
      // 检查模块点击
      const moduleWidth = 300;
      const moduleHeight = 180;
      const startX = (canvas.width - moduleWidth * 2) / 2;
      const startY = 120;
      
      gameState.modules.forEach((module, index) => {
        const moduleX = startX + (index % 2) * (moduleWidth + 40);
        const moduleY = startY + Math.floor(index / 2) * (moduleHeight + 40);
        
        if (x >= moduleX && x <= moduleX + moduleWidth && 
            y >= moduleY && y <= moduleY + moduleHeight) {
          this.onModuleTap(index);
        }
      });
      
      // 检查圆形按钮点击
      const btnX = canvas.width - 50;
      const btnY = canvas.height/2;
      const distance = Math.sqrt((x - btnX) ** 2 + (y - btnY) ** 2);
      
      if (distance <= 30) {
        wx.showToast({ title: '活动未开启', icon: 'none' });
      }
    },
    onModuleTap(index) {
      const module = gameState.modules[index];
      if (!module.unlocked) {
        wx.showToast({ title: '活动未开启', icon: 'none' });
        return;
      }
      
      if (index === 0) {
        gameState.currentScene = 'tool-assemble';
        scenes['tool-assemble'].init();
      }
    }
  },
  
  'tool-assemble': {
    init() {
      this.drawToolAssembleUI();
    },
    drawToolAssembleUI() {
      // 清空画布
      ctx.fillStyle = '#f6fff6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 返回按钮
      ctx.fillStyle = '#333';
      ctx.fillRect(20, 20, 80, 40);
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('返回', 60, 50);
      
      // 农具信息
      ctx.fillStyle = '#333';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('曲辕犁', canvas.width/2, 120);
      
      ctx.font = '28px Arial';
      ctx.fillText('古代农具革新代表，体现天人合一哲学思想。', canvas.width/2, 160);
      
      // 切换按钮
      ctx.fillStyle = '#3bb46e';
      ctx.fillRect(canvas.width/2 - 200, 200, 100, 50);
      ctx.fillRect(canvas.width/2 + 100, 200, 100, 50);
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('上一件', canvas.width/2 - 150, 235);
      ctx.fillText('下一件', canvas.width/2 + 150, 235);
      
      // 步骤按钮
      const stepY = 300;
      ctx.fillStyle = '#3bb46e';
      ctx.fillRect(canvas.width/2 - 200, stepY, 120, 50);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(canvas.width/2 - 50, stepY, 120, 50);
      ctx.fillRect(canvas.width/2 + 100, stepY, 120, 50);
      
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText('第一步（进行中）', canvas.width/2 - 140, stepY + 30);
      ctx.fillText('第二步（未解锁）', canvas.width/2 + 10, stepY + 30);
      ctx.fillText('第三步（未解锁）', canvas.width/2 + 160, stepY + 30);
    },
    handleTouch(e) {
      const { x, y } = e.touches[0];
      
      // 返回按钮
      if (x >= 20 && x <= 100 && y >= 20 && y <= 60) {
        gameState.currentScene = 'home';
        scenes.home.init();
        return;
      }
      
      // 第一步按钮
      const stepY = 300;
      if (x >= canvas.width/2 - 200 && x <= canvas.width/2 - 80 && 
          y >= stepY && y <= stepY + 50) {
        gameState.currentScene = 'video-game';
        scenes['video-game'].init();
      }
    }
  },
  
  'video-game': {
    init() {
      this.drawVideoGameUI();
    },
    drawVideoGameUI() {
      // 清空画布
      ctx.fillStyle = '#f6fff6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 视频区域（左侧2/3）
      const videoWidth = canvas.width * 0.66;
      const videoHeight = videoWidth * 0.5625; // 16:9
      
      ctx.fillStyle = '#000';
      ctx.fillRect(32, 32, videoWidth - 64, videoHeight);
      
      // 进度条
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(32, videoHeight + 56, videoWidth - 64, 16);
      
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(32, videoHeight + 56, (videoWidth - 64) * 0.3, 16); // 30%进度
      
      // 右侧连线区域
      const rightX = videoWidth + 64;
      const rightY = 32;
      
      // 零件框
      const partNames = ['犁头', '犁架', '扶手'];
      partNames.forEach((name, index) => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(rightX, rightY + index * 80, 180, 60);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.strokeRect(rightX, rightY + index * 80, 180, 60);
        
        ctx.fillStyle = '#333';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name, rightX + 90, rightY + index * 80 + 40);
      });
      
      // 确认提交按钮
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(rightX, rightY + 300, 200, 60);
      
      ctx.fillStyle = '#333';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('确认提交', rightX + 100, rightY + 340);
    },
    handleTouch(e) {
      const { x, y } = e.touches[0];
      
      // 确认提交按钮
      const rightX = canvas.width * 0.66 + 64;
      const rightY = 32;
      
      if (x >= rightX && x <= rightX + 200 && 
          y >= rightY + 300 && y <= rightY + 360) {
        wx.showToast({ title: '提交成功', icon: 'success' });
      }
    }
  }
};

// 初始化游戏
function init() {
  // 设置画布尺寸
  const systemInfo = wx.getSystemInfoSync();
  canvas.width = systemInfo.windowWidth;
  canvas.height = systemInfo.windowHeight;
  
  // 启动登录场景
  scenes.login.init();
  
  // 监听触摸事件
  wx.onTouchStart((e) => {
    const currentScene = scenes[gameState.currentScene];
    if (currentScene && currentScene.handleTouch) {
      currentScene.handleTouch(e);
    }
  });
}

// 启动游戏
init();
