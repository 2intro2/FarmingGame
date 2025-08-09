/**
 * 农具拼装场景
 * 演示游戏逻辑层的使用
 */
import BaseScene from './BaseScene';
import BaseEntity from '../entities/BaseEntity';
import BaseSystem from '../systems/BaseSystem';
import logger from '../../utils/logger';

/**
 * 农具实体
 */
class ToolEntity extends BaseEntity {
  constructor(x, y, toolData) {
    super(x, y);
    this.toolData = toolData;
    this.isAssembled = false;
    this.assemblyProgress = 0;
    this.parts = [];
    
    this.setSize(100, 100);
  }

  /**
   * 添加零件
   */
  addPart(part) {
    this.parts.push(part);
    this.updateAssemblyProgress();
  }

  /**
   * 更新拼装进度
   */
  updateAssemblyProgress() {
    this.assemblyProgress = (this.parts.length / this.toolData.totalParts) * 100;
    this.isAssembled = this.assemblyProgress >= 100;
    
    if (this.isAssembled) {
      logger.info(`农具 ${this.toolData.name} 拼装完成`, null, 'tool-assembly');
    }
  }

  /**
   * 渲染农具
   */
  render(ctx) {
    if (!this.visible) return;

    // 绘制农具背景
    ctx.fillStyle = this.isAssembled ? '#4CAF50' : '#E0E0E0';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制农具名称
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.toolData.name, this.x + this.width / 2, this.y + 20);

    // 绘制进度条
    ctx.fillStyle = '#FF9800';
    ctx.fillRect(this.x + 10, this.y + 30, (this.width - 20) * (this.assemblyProgress / 100), 10);

    // 绘制进度文本
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText(`${Math.round(this.assemblyProgress)}%`, this.x + this.width / 2, this.y + 45);
  }
}

/**
 * 拼装系统
 */
class AssemblySystem extends BaseSystem {
  constructor() {
    super();
    this.assemblyQueue = [];
    this.currentTool = null;
  }

  /**
   * 初始化系统
   */
  init() {
    logger.info('拼装系统初始化', null, 'assembly-system');
  }

  /**
   * 更新系统
   */
  update(deltaTime) {
    if (!this.active || !this.scene) return;

    // 处理拼装队列
    this.processAssemblyQueue();
  }

  /**
   * 添加拼装任务
   */
  addAssemblyTask(toolData) {
    this.assemblyQueue.push(toolData);
    logger.info(`添加拼装任务: ${toolData.name}`, toolData, 'assembly-system');
  }

  /**
   * 处理拼装队列
   */
  processAssemblyQueue() {
    if (this.assemblyQueue.length === 0 || this.currentTool) return;

    const toolData = this.assemblyQueue.shift();
    this.startAssembly(toolData);
  }

  /**
   * 开始拼装
   */
  startAssembly(toolData) {
    const toolEntity = new ToolEntity(50, 100, toolData);
    this.scene.addEntity(toolEntity);
    this.currentTool = toolEntity;
    
    logger.info(`开始拼装农具: ${toolData.name}`, toolData, 'assembly-system');
  }

  /**
   * 完成拼装
   */
  completeAssembly() {
    if (this.currentTool) {
      this.currentTool.isAssembled = true;
      this.currentTool.assemblyProgress = 100;
      
      logger.info(`农具拼装完成: ${this.currentTool.toolData.name}`, null, 'assembly-system');
      
      // 移除当前工具
      this.scene.removeEntity(this.currentTool);
      this.currentTool = null;
    }
  }
}

/**
 * 农具拼装场景
 */
export default class ToolAssemblyScene extends BaseScene {
  constructor() {
    super('tool-assembly');
    this.assemblySystem = new AssemblySystem();
    this.toolData = null;
  }

  /**
   * 初始化场景
   */
  init() {
    super.init();
    logger.info('农具拼装场景初始化', null, 'tool-assembly-scene');
  }

  /**
   * 设置场景系统
   */
  setupSystems() {
    this.addSystem(this.assemblySystem);
  }

  /**
   * 设置场景UI
   */
  setupUI() {
    // 添加返回按钮
    this.addUI({
      x: 20,
      y: 20,
      width: 60,
      height: 30,
      text: '返回',
      render: (ctx) => {
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + 20);
      }
    });
  }

  /**
   * 设置工具数据
   */
  setToolData(toolData) {
    this.toolData = toolData;
    this.assemblySystem.addAssemblyTask(toolData);
  }

  /**
   * 处理输入事件
   */
  handleInput(event) {
    // 处理点击事件
    if (event.type === 'touchstart' || event.type === 'click') {
      const { x, y } = event;
      
      // 检查返回按钮点击
      this.ui.forEach(uiElement => {
        if (x >= uiElement.x && x <= uiElement.x + uiElement.width &&
            y >= uiElement.y && y <= uiElement.y + uiElement.height) {
          if (uiElement.text === '返回') {
            this.goBack();
          }
        }
      });
    }
  }

  /**
   * 返回上一页
   */
  goBack() {
    logger.info('返回主页', null, 'tool-assembly-scene');
    if (GameGlobal.pageManager) {
      GameGlobal.pageManager.switchToPage('home');
    }
  }

  /**
   * 渲染场景
   */
  render(ctx) {
    super.render(ctx);

    // 渲染标题
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('农具拼装', canvas.width / 2, 50);

    // 渲染说明
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText('点击零件进行拼装', canvas.width / 2, 80);
  }
} 