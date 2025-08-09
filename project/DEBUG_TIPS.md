# 调试提示

## 问题排查

如果仍然出现黑屏或视频播放问题，请按以下步骤排查：

### 1. 检查控制台错误
在微信开发者工具中查看控制台是否有错误信息：
- 视频加载错误
- 页面渲染错误
- API调用错误

### 2. 检查视频URL
确保视频URL可以正常访问：
```javascript
// 在VideoLearningPage.js中修改视频URL
src: 'https://www.w3schools.com/html/mov_bbb.mp4'
```

### 3. 检查图片资源
确保以下图片文件存在：
- `images/002.png` (犁辕图片)
- `images/003.png` (犁箭图片) 
- `images/004.png` (犁铧图片)
- `images/confirmSubmission.png` (确认提交按钮图片)
- `images/bg01.jpeg` (背景图片)

如果图片文件不存在或损坏，系统会自动显示占位符。

### 4. 临时禁用视频
如果问题持续，可以临时注释掉视频初始化：
```javascript
// 在VideoLearningPage.js的show()方法中
show() {
  // 临时禁用视频
  // if (!this.video) {
  //   this.initVideo();
  // }
  // if (this.video) {
  //   this.video.show();
  // }
}
```

### 5. 检查页面切换
确保页面切换逻辑正确：
- 登录页面 → 主页面
- 主页面 → 视频学习页面
- 视频学习页面 → 主页面

### 6. 网络问题
- 确保网络连接正常
- 检查视频URL是否支持HTTPS
- 检查是否有跨域问题

## 常见问题解决

### 黑屏问题
1. 检查Canvas是否正确初始化
2. 检查页面渲染方法是否正常
3. 检查游戏循环是否正常运行

### 视频不显示
1. 检查视频URL是否有效
2. 检查视频格式是否支持
3. 检查网络连接

### 页面切换问题
1. 检查页面管理器是否正确初始化
2. 检查页面show/hide方法
3. 检查触摸事件处理

## 调试代码

可以在关键位置添加调试信息：
```javascript
console.log('页面切换:', pageName);
console.log('视频状态:', this.videoState);
console.log('当前页面:', this.currentPage);
```

## 图片问题解决

如果遇到图片绘制错误，可以：

1. 检查控制台中的图片测试结果
2. 确保图片文件存在且未损坏
3. 使用占位符替代损坏的图片
4. 检查图片路径是否正确

图片加载工具会自动处理错误并显示占位符，不会导致游戏崩溃。 