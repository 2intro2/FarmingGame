GameGlobal.canvas = wx.createCanvas();

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;

// 延迟导入Toast组件，避免初始化问题
let Toast = null;

// 扩展Canvas渲染上下文，添加Toast渲染
if (GameGlobal.pageManager) {
  const originalPageManagerRender = GameGlobal.pageManager.render;
  GameGlobal.pageManager.render = function(ctx) {
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