GameGlobal.canvas = wx.createCanvas();

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;

// 延迟添加Canvas roundRect polyfill
function addRoundRectPolyfill() {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + width - radius, y);
      this.quadraticCurveTo(x + width, y, x + width, y + radius);
      this.lineTo(x + width, y + height - radius);
      this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      this.lineTo(x + radius, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }
}

// 在Canvas上下文创建后添加polyfill
GameGlobal.addRoundRectPolyfill = addRoundRectPolyfill;

// 延迟导入Toast组件，避免初始化问题
let Toast = null;

// 扩展Canvas渲染上下文，添加Toast渲染
if (GameGlobal.pageManager) {
  const originalPageManagerRender = GameGlobal.pageManager.render;
  GameGlobal.pageManager.render = function(ctx) {
    // 确保polyfill已添加
    if (GameGlobal.addRoundRectPolyfill) {
      GameGlobal.addRoundRectPolyfill();
      GameGlobal.addRoundRectPolyfill = null; // 只添加一次
    }
    
    // 先渲染页面内容
    originalPageManagerRender.call(this, ctx);
    
    // 延迟加载并渲染Toast
    if (!Toast) {
      try {
        Toast = require('./components/Toast').default;
        console.log('Toast组件加载成功');
      } catch (error) {
        console.error('Toast组件加载失败:', error);
      }
    }
    
    if (Toast) {
      try {
        Toast.render(ctx);
      } catch (error) {
        console.error('Toast渲染失败:', error);
      }
    }
  };
}