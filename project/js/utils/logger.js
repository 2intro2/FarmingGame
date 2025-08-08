/**
 * 日志系统
 * 提供不同级别的日志记录功能
 */
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 最大日志数量
    this.level = 'info'; // 默认日志级别
    this.enabled = true; // 是否启用日志
    
    // 日志级别定义
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * 设置日志级别
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.level = level;
    }
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 记录日志
   */
  log(level, message, data = null, context = '') {
    if (!this.enabled || this.levels[level] < this.levels[this.level]) {
      return;
    }

    const logEntry = {
      timestamp: Date.now(),
      level: level,
      message: message,
      data: data,
      context: context
    };

    this.logs.push(logEntry);

    // 控制台输出
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warn' ? 'warn' : 
                         level === 'debug' ? 'debug' : 'log';
    
    console[consoleMethod](`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`, data || '');

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * 调试日志
   */
  debug(message, data = null, context = '') {
    this.log('debug', message, data, context);
  }

  /**
   * 信息日志
   */
  info(message, data = null, context = '') {
    this.log('info', message, data, context);
  }

  /**
   * 警告日志
   */
  warn(message, data = null, context = '') {
    this.log('warn', message, data, context);
  }

  /**
   * 错误日志
   */
  error(message, data = null, context = '') {
    this.log('error', message, data, context);
  }

  /**
   * 记录性能日志
   */
  performance(name, startTime) {
    const duration = Date.now() - startTime;
    this.info(`性能: ${name} 耗时 ${duration}ms`, { name, duration }, 'performance');
  }

  /**
   * 记录用户行为日志
   */
  userAction(action, data = null) {
    this.info(`用户行为: ${action}`, data, 'user-action');
  }

  /**
   * 记录游戏事件日志
   */
  gameEvent(event, data = null) {
    this.info(`游戏事件: ${event}`, data, 'game-event');
  }

  /**
   * 记录API调用日志
   */
  apiCall(method, url, data = null, response = null) {
    this.info(`API调用: ${method} ${url}`, { 
      method, 
      url, 
      requestData: data, 
      responseData: response 
    }, 'api');
  }

  /**
   * 获取日志
   */
  getLogs(level = null, context = null, limit = null) {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context === context);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  /**
   * 获取日志统计
   */
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byContext: {},
      recent: this.logs.filter(log => 
        Date.now() - log.timestamp < 60000 // 最近1分钟
      ).length
    };

    this.logs.forEach(log => {
      // 按级别统计
      if (!stats.byLevel[log.level]) {
        stats.byLevel[log.level] = 0;
      }
      stats.byLevel[log.level]++;

      // 按上下文统计
      if (log.context) {
        if (!stats.byContext[log.context]) {
          stats.byContext[log.context] = 0;
        }
        stats.byContext[log.context]++;
      }
    });

    return stats;
  }

  /**
   * 导出日志
   */
  exportLogs() {
    return {
      logs: this.logs,
      stats: this.getLogStats(),
      exportTime: Date.now()
    };
  }

  /**
   * 清除日志
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * 保存日志到本地存储
   */
  saveToStorage() {
    try {
      const logData = this.exportLogs();
      wx.setStorageSync('game_logs', logData);
      this.info('日志已保存到本地存储', null, 'logger');
    } catch (error) {
      this.error('保存日志失败', error, 'logger');
    }
  }

  /**
   * 从本地存储加载日志
   */
  loadFromStorage() {
    try {
      const logData = wx.getStorageSync('game_logs');
      if (logData && logData.logs) {
        this.logs = logData.logs;
        this.info('日志已从本地存储加载', null, 'logger');
      }
    } catch (error) {
      this.error('加载日志失败', error, 'logger');
    }
  }
}

// 创建全局日志实例
const logger = new Logger();

// 在开发环境下启用调试日志
if (process.env.NODE_ENV === 'development') {
  logger.setLevel('debug');
}

export default logger; 