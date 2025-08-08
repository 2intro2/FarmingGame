/**
 * 农具数据系统
 * 定义农具数据结构和步骤管理
 */
export default class ToolsData {
  // 农具数据
  static tools = [
    {
      id: 'hoe',
      name: '锄头',
      description: '用于松土和除草的重要农具，由锄头和木柄组成。',
      image: 'images/tool1.png',
      steps: [
        {
          id: 'step1',
          name: '第一步：选择锄头头',
          description: '选择合适的锄头头，注意材质和大小。',
          status: 'in_progress',
          requirements: [],
          rewards: { experience: 10, coins: 5 }
        },
        {
          id: 'step2',
          name: '第二步：选择木柄',
          description: '选择合适长度的木柄，确保握感舒适。',
          status: 'locked',
          requirements: ['step1'],
          rewards: { experience: 15, coins: 8 }
        },
        {
          id: 'step3',
          name: '第三步：组装完成',
          description: '将锄头头和木柄组装在一起，完成农具制作。',
          status: 'locked',
          requirements: ['step1', 'step2'],
          rewards: { experience: 25, coins: 15 }
        }
      ],
      category: 'basic',
      difficulty: 1
    },
    {
      id: 'shovel',
      name: '铁锹',
      description: '用于挖土和翻地的农具，适合深翻土壤。',
      image: 'images/tool2.png',
      steps: [
        {
          id: 'step1',
          name: '第一步：选择铁锹头',
          description: '选择合适的铁锹头，注意锋利度和耐用性。',
          status: 'in_progress',
          requirements: [],
          rewards: { experience: 12, coins: 6 }
        },
        {
          id: 'step2',
          name: '第二步：选择手柄',
          description: '选择合适的手柄，确保握感舒适且不易滑脱。',
          status: 'locked',
          requirements: ['step1'],
          rewards: { experience: 18, coins: 10 }
        },
        {
          id: 'step3',
          name: '第三步：组装完成',
          description: '将铁锹头与手柄组装，完成农具制作。',
          status: 'locked',
          requirements: ['step1', 'step2'],
          rewards: { experience: 30, coins: 20 }
        }
      ],
      category: 'basic',
      difficulty: 2
    },
    {
      id: 'sickle',
      name: '镰刀',
      description: '用于收割庄稼的农具，刀刃锋利，使用需小心。',
      image: 'images/tool3.png',
      steps: [
        {
          id: 'step1',
          name: '第一步：选择镰刀头',
          description: '选择合适的镰刀头，注意刀刃的锋利度。',
          status: 'in_progress',
          requirements: [],
          rewards: { experience: 15, coins: 8 }
        },
        {
          id: 'step2',
          name: '第二步：选择刀柄',
          description: '选择合适长度的刀柄，确保握感舒适。',
          status: 'locked',
          requirements: ['step1'],
          rewards: { experience: 20, coins: 12 }
        },
        {
          id: 'step3',
          name: '第三步：组装完成',
          description: '将镰刀头与刀柄组装，完成农具制作。',
          status: 'locked',
          requirements: ['step1', 'step2'],
          rewards: { experience: 35, coins: 25 }
        }
      ],
      category: 'advanced',
      difficulty: 3
    }
  ];

  /**
   * 获取所有农具
   * @returns {Array} 农具列表
   */
  static getAllTools() {
    return this.tools;
  }

  /**
   * 根据ID获取农具
   * @param {string} id - 农具ID
   * @returns {Object|null} 农具对象
   */
  static getToolById(id) {
    return this.tools.find(tool => tool.id === id);
  }

  /**
   * 获取农具步骤
   * @param {string} toolId - 农具ID
   * @returns {Array} 步骤列表
   */
  static getToolSteps(toolId) {
    const tool = this.getToolById(toolId);
    return tool ? tool.steps : [];
  }

  /**
   * 获取农具步骤
   * @param {string} toolId - 农具ID
   * @param {string} stepId - 步骤ID
   * @returns {Object|null} 步骤对象
   */
  static getToolStep(toolId, stepId) {
    const steps = this.getToolSteps(toolId);
    return steps.find(step => step.id === stepId);
  }

  /**
   * 检查步骤是否可以解锁
   * @param {string} toolId - 农具ID
   * @param {string} stepId - 步骤ID
   * @param {Array} completedSteps - 已完成的步骤ID列表
   * @returns {boolean} 是否可以解锁
   */
  static canUnlockStep(toolId, stepId, completedSteps) {
    const step = this.getToolStep(toolId, stepId);
    if (!step) return false;

    // 检查前置要求
    return step.requirements.every(req => completedSteps.includes(req));
  }

  /**
   * 完成步骤
   * @param {string} toolId - 农具ID
   * @param {string} stepId - 步骤ID
   * @returns {Object} 奖励信息
   */
  static completeStep(toolId, stepId) {
    const step = this.getToolStep(toolId, stepId);
    if (!step) return null;

    // 更新步骤状态
    step.status = 'completed';

    // 解锁下一个步骤
    this.unlockNextStep(toolId, stepId);

    return step.rewards;
  }

  /**
   * 解锁下一个步骤
   * @param {string} toolId - 农具ID
   * @param {string} completedStepId - 刚完成的步骤ID
   */
  static unlockNextStep(toolId, completedStepId) {
    const steps = this.getToolSteps(toolId);
    const completedSteps = steps
      .filter(step => step.status === 'completed')
      .map(step => step.id);

    // 检查哪些步骤可以解锁
    steps.forEach(step => {
      if (step.status === 'locked' && this.canUnlockStep(toolId, step.id, completedSteps)) {
        step.status = 'in_progress';
      }
    });
  }

  /**
   * 获取农具进度
   * @param {string} toolId - 农具ID
   * @returns {Object} 进度信息
   */
  static getToolProgress(toolId) {
    const steps = this.getToolSteps(toolId);
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const inProgressSteps = steps.filter(step => step.status === 'in_progress').length;

    return {
      total: totalSteps,
      completed: completedSteps,
      inProgress: inProgressSteps,
      locked: totalSteps - completedSteps - inProgressSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100)
    };
  }

  /**
   * 获取所有农具进度
   * @returns {Array} 所有农具的进度信息
   */
  static getAllToolsProgress() {
    return this.tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      progress: this.getToolProgress(tool.id)
    }));
  }

  /**
   * 重置农具进度
   * @param {string} toolId - 农具ID
   */
  static resetToolProgress(toolId) {
    const steps = this.getToolSteps(toolId);
    steps.forEach((step, index) => {
      if (index === 0) {
        step.status = 'in_progress';
      } else {
        step.status = 'locked';
      }
    });
  }

  /**
   * 获取农具分类
   * @returns {Array} 分类列表
   */
  static getCategories() {
    const categories = [...new Set(this.tools.map(tool => tool.category))];
    return categories.map(category => ({
      id: category,
      name: this.getCategoryName(category),
      tools: this.tools.filter(tool => tool.category === category)
    }));
  }

  /**
   * 获取分类名称
   * @param {string} category - 分类ID
   * @returns {string} 分类名称
   */
  static getCategoryName(category) {
    const categoryNames = {
      basic: '基础农具',
      advanced: '高级农具',
      special: '特殊农具'
    };
    return categoryNames[category] || category;
  }

  /**
   * 根据难度获取农具
   * @param {number} difficulty - 难度等级
   * @returns {Array} 农具列表
   */
  static getToolsByDifficulty(difficulty) {
    return this.tools.filter(tool => tool.difficulty === difficulty);
  }

  /**
   * 获取推荐农具
   * @param {number} userLevel - 用户等级
   * @returns {Array} 推荐农具列表
   */
  static getRecommendedTools(userLevel) {
    return this.tools.filter(tool => tool.difficulty <= userLevel);
  }
}
