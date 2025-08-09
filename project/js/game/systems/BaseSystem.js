/**
 * 基础系统类
 * 所有游戏系统的基类，提供系统的基础功能
 */
export default class BaseSystem {
  constructor() {
    this.scene = null;
    this.active = true;
    this.priority = 0; // 系统执行优先级
  }

  /**
   * 添加到场景时调用
   */
  onAddToScene(scene) {
    this.scene = scene;
  }

  /**
   * 从场景移除时调用
   */
  onRemoveFromScene(scene) {
    this.scene = null;
  }

  /**
   * 初始化系统
   */
  init() {
    // 子类重写此方法进行系统初始化
  }

  /**
   * 更新系统
   */
  update(deltaTime) {
    if (!this.active || !this.scene) return;
    
    // 子类重写此方法实现具体更新逻辑
  }

  /**
   * 获取场景中的实体
   */
  getEntities() {
    return this.scene ? this.scene.entities : [];
  }

  /**
   * 根据组件类型获取实体
   */
  getEntitiesWithComponent(componentName) {
    if (!this.scene) return [];
    
    return this.scene.entities.filter(entity => 
      entity.getComponent(componentName)
    );
  }

  /**
   * 添加实体到场景
   */
  addEntity(entity) {
    if (this.scene) {
      this.scene.addEntity(entity);
    }
  }

  /**
   * 从场景移除实体
   */
  removeEntity(entity) {
    if (this.scene) {
      this.scene.removeEntity(entity);
    }
  }

  /**
   * 暂停系统
   */
  pause() {
    this.active = false;
  }

  /**
   * 恢复系统
   */
  resume() {
    this.active = true;
  }

  /**
   * 销毁系统
   */
  destroy() {
    this.active = false;
    this.scene = null;
  }
} 