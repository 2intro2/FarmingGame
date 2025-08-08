/**
 * 游戏常量定义
 * 集中管理项目中的常量
 */

// 游戏基础配置
export const GAME_CONFIG = {
  // 画布尺寸
  CANVAS_WIDTH: 375,
  CANVAS_HEIGHT: 667,
  
  // 游戏状态
  GAME_STATES: {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
  },
  
  // 页面类型
  PAGE_TYPES: {
    LOGIN: 'login',
    HOME: 'home',
    TOOL_ASSEMBLY: 'tool_assembly',
    NOODLE_LIFE: 'noodle_life',
    EMERGENCY_CHALLENGE: 'emergency_challenge',
    CORN_GROWTH: 'corn_growth'
  },
  
  // 任务状态
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },
  
  // 模块状态
  MODULE_STATUS: {
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
  }
};

// 颜色定义
export const COLORS = {
  // 主色调
  PRIMARY: '#4CAF50',
  PRIMARY_DARK: '#388E3C',
  PRIMARY_LIGHT: '#81C784',
  
  // 辅助色
  SECONDARY: '#FF9800',
  SECONDARY_DARK: '#F57C00',
  SECONDARY_LIGHT: '#FFB74D',
  
  // 状态色
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // 中性色
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#FAFAFA',
  GRAY_100: '#F5F5F5',
  GRAY_200: '#EEEEEE',
  GRAY_300: '#E0E0E0',
  GRAY_400: '#BDBDBD',
  GRAY_500: '#9E9E9E',
  GRAY_600: '#757575',
  GRAY_700: '#616161',
  GRAY_800: '#424242',
  GRAY_900: '#212121',
  
  // 背景色
  BACKGROUND: '#F5F5F5',
  SURFACE: '#FFFFFF',
  OVERLAY: 'rgba(0, 0, 0, 0.5)'
};

// 字体配置
export const FONTS = {
  // 字体大小
  SIZES: {
    XS: 10,
    SM: 12,
    BASE: 14,
    LG: 16,
    XL: 18,
    XXL: 20,
    XXXL: 24,
    TITLE: 28,
    HEADING: 32
  },
  
  // 字体粗细
  WEIGHTS: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700
  },
  
  // 字体族
  FAMILIES: {
    PRIMARY: 'PingFang SC, Helvetica Neue, Arial, sans-serif',
    MONOSPACE: 'Monaco, Menlo, Consolas, monospace'
  }
};

// 动画配置
export const ANIMATION = {
  // 动画时长
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 800
  },
  
  // 缓动函数
  EASING: {
    LINEAR: 'linear',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  },
  
  // 动画类型
  TYPES: {
    FADE: 'fade',
    SLIDE: 'slide',
    SCALE: 'scale',
    ROTATE: 'rotate',
    BOUNCE: 'bounce'
  }
};

// 音效配置
export const AUDIO = {
  // 音效类型
  TYPES: {
    BGM: 'bgm',
    SFX: 'sfx',
    VOICE: 'voice'
  },
  
  // 音量设置
  VOLUME: {
    MUTE: 0,
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 1.0
  },
  
  // 音效文件
  FILES: {
    BGM: 'audio/bgm.mp3',
    BOOM: 'audio/boom.mp3',
    BULLET: 'audio/bullet.mp3'
  }
};

// 图片资源配置
export const IMAGES = {
  // 背景图片
  BACKGROUNDS: {
    MAIN: 'images/bg.jpg'
  },
  
  // 工具图片
  TOOLS: {
    TOOL1: 'images/tool1.png'
  },
  
  // 游戏图片
  GAME: {
    IMG_002: 'images/002.png',
    IMG_004: 'images/004.png'
  }
};

// 本地存储键名
export const STORAGE_KEYS = {
  // 用户相关
  USER_INFO: 'userInfo',
  LOGIN_INFO: 'loginInfo',
  
  // 游戏数据
  GAME_DATA: 'gameData',
  TASK_PROGRESS: 'taskProgress',
  MODULE_STATUS: 'moduleStatus',
  
  // 设置
  SETTINGS: 'settings',
  AUDIO_SETTINGS: 'audioSettings',
  
  // 日志
  GAME_LOGS: 'game_logs',
  ERROR_LOGS: 'error_logs'
};

// 事件名称
export const EVENTS = {
  // 游戏事件
  GAME_START: 'game_start',
  GAME_PAUSE: 'game_pause',
  GAME_RESUME: 'game_resume',
  GAME_OVER: 'game_over',
  
  // 页面事件
  PAGE_CHANGE: 'page_change',
  PAGE_BACK: 'page_back',
  
  // 用户事件
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_INFO_UPDATE: 'user_info_update',
  
  // 任务事件
  TASK_START: 'task_start',
  TASK_COMPLETE: 'task_complete',
  TASK_FAIL: 'task_fail',
  
  // 模块事件
  MODULE_UNLOCK: 'module_unlock',
  MODULE_COMPLETE: 'module_complete',
  
  // 通知事件
  NOTIFICATION_ADD: 'notification_add',
  NOTIFICATION_READ: 'notification_read'
};

// 错误代码
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 用户错误
  USER_NOT_LOGIN: 'USER_NOT_LOGIN',
  USER_INFO_INVALID: 'USER_INFO_INVALID',
  
  // 游戏错误
  GAME_INIT_FAILED: 'GAME_INIT_FAILED',
  RESOURCE_LOAD_FAILED: 'RESOURCE_LOAD_FAILED',
  
  // 数据错误
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
  DATA_SAVE_FAILED: 'DATA_SAVE_FAILED'
};

// 微信API配置
export const WECHAT_CONFIG = {
  // 登录相关
  LOGIN_TIMEOUT: 10000,
  USER_INFO_SCOPE: 'scope.userInfo',
  
  // 分享相关
  SHARE_TITLE: '农场教育小游戏',
  SHARE_DESC: '通过互动游戏学习农业知识',
  SHARE_IMAGE: 'images/share.jpg',
  
  // 支付相关
  PAYMENT_TIMEOUT: 30000
};

// 开发配置
export const DEV_CONFIG = {
  // 调试模式
  DEBUG: true,
  
  // 日志级别
  LOG_LEVEL: 'debug',
  
  // 错误上报
  ERROR_REPORT: true,
  
  // 性能监控
  PERFORMANCE_MONITOR: true
};

// 导出所有常量
export default {
  GAME_CONFIG,
  COLORS,
  FONTS,
  ANIMATION,
  AUDIO,
  IMAGES,
  STORAGE_KEYS,
  EVENTS,
  ERROR_CODES,
  WECHAT_CONFIG,
  DEV_CONFIG
}; 