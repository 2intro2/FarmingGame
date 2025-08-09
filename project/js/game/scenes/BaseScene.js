/**
 * 基础场景类
 * 所有游戏场景的基类，提供场景管理的基础功能
 */
export default class BaseScene {
  constructor(name) {
    this.name = name;
    this.isActive = false;
    this.entities = [];
    this.systems = [];
    this.background = null;
    this.ui = [];
  }

  /**
   * 初始化场景
   */
  init() {
    this.isActive = true;
    this.loadResources();
    this.setupEntities();
    this.setupSystems();
    this.setupUI();
  }

  /**
   * 加载场景资源
   */
  loadResources() {
    // 子类重写此方法加载特定资源
  }

  /**
   * 设置场景实体
   */
  setupEntities() {
    // 子类重写此方法设置场景实体
  }

  /**
   * 设置场景系统
   */
  setupSystems() {
    // 子类重写此方法设置场景系统
  }

  /**
   * 设置场景UI
   */
  setupUI() {
    // 子类重写此方法设置场景UI
  }

  /**
   * 更新场景
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // 更新所有系统
    this.systems.forEach(system => {
      if (system.update) {
        system.update(deltaTime);
      }
    });

    // 更新所有实体
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(deltaTime);
      }
    });
  }

  /**
   * 渲染场景
   */
  render(ctx) {
    if (!this.isActive) return;

    // 渲染背景
    if (this.background && this.background.render) {
      this.background.render(ctx);
    }

    // 渲染所有实体
    this.entities.forEach(entity => {
      if (entity.render) {
        entity.render(ctx);
      }
    });

    // 渲染UI
    this.ui.forEach(uiElement => {
      if (uiElement.render) {
        uiElement.render(ctx);
      }
    });
  }

  /**
   * 添加实体到场景
   */
  addEntity(entity) {
    this.entities.push(entity);
    if (entity.onAddToScene) {
      entity.onAddToScene(this);
    }
  }

  /**
   * 从场景移除实体
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      if (entity.onRemoveFromScene) {
        entity.onRemoveFromScene(this);
      }
    }
  }

  /**
   * 添加系统到场景
   */
  addSystem(system) {
    this.systems.push(system);
    if (system.onAddToScene) {
      system.onAddToScene(this);
    }
  }

  /**
   * 添加UI元素到场景
   */
  addUI(uiElement) {
    this.ui.push(uiElement);
  }

  /**
   * 处理输入事件
   */
  handleInput(event) {
    // 子类重写此方法处理特定输入
  }

  /**
   * 暂停场景
   */
  pause() {
    this.isActive = false;
  }

  /**
   * 恢复场景
   */
  resume() {
    this.isActive = true;
  }

  /**
   * 销毁场景
   */
  destroy() {
    this.isActive = false;
    
    // 清理实体
    this.entities.forEach(entity => {
      if (entity.destroy) {
        entity.destroy();
      }
    });
    this.entities = [];

    // 清理系统
    this.systems.forEach(system => {
      if (system.destroy) {
        system.destroy();
      }
    });
    this.systems = [];

    // 清理UI
    this.ui = [];
  }
} 