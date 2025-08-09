/**
 * 图片加载工具类
 * 统一处理图片加载、错误处理和重试机制
 */
export default class ImageLoader {
  /**
   * 加载图片
   * @param {string} src - 图片路径
   * @param {Object} options - 选项
   * @returns {Promise} 返回图片对象
   */
  static loadImage(src, options = {}) {
    return new Promise((resolve, reject) => {
      const img = wx.createImage();
      
      // 设置超时
      const timeout = options.timeout || 10000;
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        reject(new Error(`图片加载超时: ${src}`));
      }, timeout);
      
      // 加载成功
      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('图片加载成功:', src);
        resolve(img);
      };
      
      // 加载失败
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        console.warn('图片加载失败:', src, error);
        reject(new Error(`图片加载失败: ${src}`));
      };
      
      // 开始加载
      img.src = src;
    });
  }

  /**
   * 批量加载图片
   * @param {Array} imageList - 图片路径列表
   * @param {Object} options - 选项
   * @returns {Promise} 返回图片对象映射
   */
  static loadImages(imageList, options = {}) {
    const promises = imageList.map(src => 
      this.loadImage(src, options).catch(error => {
        console.warn('批量加载图片失败:', src, error);
        return null; // 返回null而不是reject，这样其他图片仍能加载
      })
    );
    
    return Promise.all(promises).then(images => {
      const result = {};
      imageList.forEach((src, index) => {
        result[src] = images[index];
      });
      return result;
    });
  }

  /**
   * 安全绘制图片
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {HTMLImageElement} img - 图片对象
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {Function} fallback - 备用绘制函数
   */
  static safeDrawImage(ctx, img, x, y, width, height, fallback = null) {
    try {
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x, y, width, height);
        return true;
      } else {
        if (fallback) {
          fallback(ctx, x, y, width, height);
        }
        return false;
      }
    } catch (error) {
      console.warn('图片绘制失败:', error);
      if (fallback) {
        fallback(ctx, x, y, width, height);
      }
      return false;
    }
  }

  /**
   * 绘制占位符
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} text - 占位符文字
   */
  static drawPlaceholder(ctx, x, y, width, height, text = '图片') {
    // 绘制背景
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
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  /**
   * 检查图片是否有效
   * @param {HTMLImageElement} img - 图片对象
   * @returns {boolean} 是否有效
   */
  static isValidImage(img) {
    return img && img.complete && img.naturalWidth > 0;
  }
} 