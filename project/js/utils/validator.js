/**
 * 数据验证工具
 * 提供各种数据类型的验证功能
 */
import logger from './logger';

class Validator {
  constructor() {
    // 常用正则表达式
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^1[3-9]\d{9}$/,
      url: /^https?:\/\/.+/,
      number: /^\d+$/,
      decimal: /^\d+(\.\d+)?$/
    };
  }

  /**
   * 验证字符串
   */
  validateString(value, options = {}) {
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      message = '字符串验证失败'
    } = options;

    // 必填检查
    if (required && (!value || value.trim() === '')) {
      throw new Error('必填字段不能为空');
    }

    // 类型检查
    if (value !== null && value !== undefined && typeof value !== 'string') {
      throw new Error('字段类型必须是字符串');
    }

    // 长度检查
    if (value && value.length < minLength) {
      throw new Error(`字符串长度不能少于 ${minLength} 个字符`);
    }

    if (value && value.length > maxLength) {
      throw new Error(`字符串长度不能超过 ${maxLength} 个字符`);
    }

    // 正则表达式检查
    if (pattern && value && !pattern.test(value)) {
      throw new Error(message);
    }

    return true;
  }

  /**
   * 验证数字
   */
  validateNumber(value, options = {}) {
    const {
      required = false,
      min = -Infinity,
      max = Infinity,
      integer = false,
      message = '数字验证失败'
    } = options;

    // 必填检查
    if (required && (value === null || value === undefined || value === '')) {
      throw new Error('必填字段不能为空');
    }

    // 类型检查
    if (value !== null && value !== undefined && typeof value !== 'number') {
      throw new Error('字段类型必须是数字');
    }

    // 范围检查
    if (value !== null && value !== undefined) {
      if (value < min) {
        throw new Error(`数值不能小于 ${min}`);
      }

      if (value > max) {
        throw new Error(`数值不能大于 ${max}`);
      }

      // 整数检查
      if (integer && !Number.isInteger(value)) {
        throw new Error('数值必须是整数');
      }
    }

    return true;
  }

  /**
   * 验证数组
   */
  validateArray(value, options = {}) {
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      itemValidator = null,
      message = '数组验证失败'
    } = options;

    // 必填检查
    if (required && (!Array.isArray(value) || value.length === 0)) {
      throw new Error('必填字段不能为空');
    }

    // 类型检查
    if (value !== null && value !== undefined && !Array.isArray(value)) {
      throw new Error('字段类型必须是数组');
    }

    // 长度检查
    if (Array.isArray(value)) {
      if (value.length < minLength) {
        throw new Error(`数组长度不能少于 ${minLength} 个元素`);
      }

      if (value.length > maxLength) {
        throw new Error(`数组长度不能超过 ${maxLength} 个元素`);
      }

      // 元素验证
      if (itemValidator) {
        value.forEach((item, index) => {
          try {
            itemValidator(item);
          } catch (error) {
            throw new Error(`数组第 ${index + 1} 个元素验证失败: ${error.message}`);
          }
        });
      }
    }

    return true;
  }

  /**
   * 验证对象
   */
  validateObject(value, schema = {}, options = {}) {
    const {
      required = false,
      allowUnknown = false,
      message = '对象验证失败'
    } = options;

    // 必填检查
    if (required && (!value || typeof value !== 'object')) {
      throw new Error('必填字段不能为空');
    }

    // 类型检查
    if (value !== null && value !== undefined && typeof value !== 'object') {
      throw new Error('字段类型必须是对象');
    }

    if (value && typeof value === 'object') {
      // 检查未知属性
      if (!allowUnknown) {
        const unknownKeys = Object.keys(value).filter(key => !schema.hasOwnProperty(key));
        if (unknownKeys.length > 0) {
          throw new Error(`对象包含未知属性: ${unknownKeys.join(', ')}`);
        }
      }

      // 验证每个属性
      Object.keys(schema).forEach(key => {
        const fieldSchema = schema[key];
        const fieldValue = value[key];

        try {
          this.validateField(fieldValue, fieldSchema, key);
        } catch (error) {
          throw new Error(`${key}: ${error.message}`);
        }
      });
    }

    return true;
  }

  /**
   * 验证字段
   */
  validateField(value, schema, fieldName = '') {
    const {
      type,
      required = false,
      validator = null,
      ...options
    } = schema;

    // 必填检查
    if (required && (value === null || value === undefined || value === '')) {
      throw new Error(`${fieldName} 是必填字段`);
    }

    // 如果值为空且非必填，跳过验证
    if (!required && (value === null || value === undefined || value === '')) {
      return true;
    }

    // 类型验证
    switch (type) {
      case 'string':
        return this.validateString(value, options);
      case 'number':
        return this.validateNumber(value, options);
      case 'array':
        return this.validateArray(value, options);
      case 'object':
        return this.validateObject(value, options.schema || {}, options);
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`${fieldName} 必须是布尔值`);
        }
        break;
      case 'email':
        return this.validateString(value, { ...options, pattern: this.patterns.email, message: '邮箱格式不正确' });
      case 'phone':
        return this.validateString(value, { ...options, pattern: this.patterns.phone, message: '手机号格式不正确' });
      case 'url':
        return this.validateString(value, { ...options, pattern: this.patterns.url, message: 'URL格式不正确' });
      default:
        break;
    }

    // 自定义验证器
    if (validator && typeof validator === 'function') {
      try {
        validator(value);
      } catch (error) {
        throw new Error(`${fieldName}: ${error.message}`);
      }
    }

    return true;
  }

  /**
   * 验证用户信息
   */
  validateUserInfo(userInfo) {
    const schema = {
      nickName: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      avatarUrl: { type: 'string', required: false },
      gender: { type: 'number', required: false, min: 0, max: 2 },
      country: { type: 'string', required: false },
      province: { type: 'string', required: false },
      city: { type: 'string', required: false },
      language: { type: 'string', required: false }
    };

    return this.validateObject(userInfo, schema, { required: true });
  }

  /**
   * 验证游戏配置
   */
  validateGameConfig(config) {
    const schema = {
      deviceOrientation: { type: 'string', required: true, validator: (value) => {
        if (!['portrait', 'landscape'].includes(value)) {
          throw new Error('设备方向必须是 portrait 或 landscape');
        }
      }},
      modules: { type: 'object', required: false },
      settings: { type: 'object', required: false }
    };

    return this.validateObject(config, schema, { required: true });
  }

  /**
   * 验证任务数据
   */
  validateTaskData(taskData) {
    const schema = {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      description: { type: 'string', required: false, maxLength: 500 },
      status: { type: 'string', required: true, validator: (value) => {
        if (!['pending', 'in_progress', 'completed', 'failed'].includes(value)) {
          throw new Error('任务状态无效');
        }
      }},
      progress: { type: 'number', required: false, min: 0, max: 100 },
      createdAt: { type: 'number', required: true },
      updatedAt: { type: 'number', required: true }
    };

    return this.validateObject(taskData, schema, { required: true });
  }

  /**
   * 批量验证
   */
  validateBatch(data, schemas) {
    const errors = [];

    Object.keys(schemas).forEach(key => {
      try {
        this.validateField(data[key], schemas[key], key);
      } catch (error) {
        errors.push(error.message);
      }
    });

    if (errors.length > 0) {
      throw new Error(`验证失败:\n${errors.join('\n')}`);
    }

    return true;
  }

  /**
   * 安全验证（不抛出异常）
   */
  safeValidate(value, schema, fieldName = '') {
    try {
      return this.validateField(value, schema, fieldName);
    } catch (error) {
      logger.warn(`数据验证失败: ${error.message}`, { value, schema, fieldName }, 'validator');
      return false;
    }
  }
}

// 创建全局验证器实例
const validator = new Validator();

export default validator; 