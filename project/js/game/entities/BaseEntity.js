/**
 * 基础实体类
 * 所有游戏实体的基类，提供实体的基础功能
 */
export default class BaseEntity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.visible = true;
    this.active = true;
    this.scene = null;
    this.components = new Map();
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
   * 更新实体
   */
  update(deltaTime) {
    if (!this.active) return;

    // 更新所有组件
    this.components.forEach(component => {
      if (component.update) {
        component.update(deltaTime);
      }
    });
  }

  /**
   * 渲染实体
   */
  render(ctx) {
    if (!this.visible) return;

    // 渲染所有组件
    this.components.forEach(component => {
      if (component.render) {
        component.render(ctx);
      }
    });
  }

  /**
   * 添加组件
   */
  addComponent(name, component) {
    this.components.set(name, component);
    component.entity = this;
    
    if (component.onAddToEntity) {
      component.onAddToEntity(this);
    }
  }

  /**
   * 获取组件
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * 移除组件
   */
  removeComponent(name) {
    const component = this.components.get(name);
    if (component) {
      if (component.onRemoveFromEntity) {
        component.onRemoveFromEntity(this);
      }
      this.components.delete(name);
    }
  }

  /**
   * 检查碰撞
   */
  collidesWith(entity) {
    return this.x < entity.x + entity.width &&
           this.x + this.width > entity.x &&
           this.y < entity.y + entity.height &&
           this.y + this.height > entity.y;
  }

  /**
   * 设置位置
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置尺寸
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  /**
   * 获取中心点
   */
  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  /**
   * 销毁实体
   */
  destroy() {
    this.active = false;
    this.visible = false;
    
    // 清理所有组件
    this.components.forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });
    this.components.clear();
  }
} 