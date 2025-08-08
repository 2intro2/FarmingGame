/**
 * 图片测试工具
 * 用于验证图片文件是否可用
 */
import ImageLoader from './imageLoader';

export default class ImageTest {
  /**
   * 测试图片文件
   * @param {Array} imageList - 图片路径列表
   */
  static async testImages(imageList) {
    console.log('开始测试图片文件...');
    
    const results = [];
    
    for (const src of imageList) {
      try {
        const img = await ImageLoader.loadImage(src, { timeout: 3000 });
        results.push({
          src,
          status: 'success',
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        console.log(`✅ ${src} - 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
      } catch (error) {
        results.push({
          src,
          status: 'failed',
          error: error.message
        });
        console.log(`❌ ${src} - 加载失败: ${error.message}`);
      }
    }
    
    console.log('图片测试完成:', results);
    return results;
  }

  /**
   * 测试项目中的图片
   */
  static async testProjectImages() {
    const imageList = [
      'images/bg01.jpeg',
      'images/bg01.png',
      'images/bg05.png',
      'images/icon.png',
      'images/icon01.png',
      'images/002.png',
      'images/003.png',
      'images/004.png'
    ];
    
    return this.testImages(imageList);
  }
} 