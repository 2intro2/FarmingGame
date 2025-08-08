GameGlobal.canvas = wx.createCanvas();

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;

// 延迟导入Toast组件，避免初始化问题
let Toast = null;

// 扩展Canvas渲染上下文，添加Toast渲染
const originalRender = GameGlobal.pageManager ? GameGlobal.pageManager.render : null;

if (GameGlobal.pageManager) {
  const originalPageManagerRender = GameGlobal.pageManager.render;
  GameGlobal.pageManager.render = function(ctx) {
    // 先渲染页面内容
    originalPageManagerRender.call(this, ctx);
    
    // 延迟加载并渲染Toast
    if (!Toast) {
      import('./components/Toast').then(module => {
        Toast = module.default;
      }).catch(error => {
        console.error('Toast组件加载失败:', error);
      });
    }
    
    if (Toast) {
      Toast.render(ctx);
    }
  };
}