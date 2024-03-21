/**
 * 邮箱配置
 */
export interface Email {
  /**
   * 邮箱密码/授权码
   */
  pass: string
  /**
   * 发件人邮箱
   */
  from: string
  /**
   * 端口
   */
  port?: number
  /**
   * 邮箱服务器
   */
  host: string
  /**
   * 收件人邮箱，默认发件人
   */
  to?: string
}

/**
 * 企业微信 App 配置
 */
export interface WorkWeixin {
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown' | 'textcard' | 'mpnews'
  /**
   * 接收人
   */
  touser?: string
  agentid?: number
  corpsecret?: string
  corpid?: string
  [k: string]: unknown
}

/**
 * 企业微信机器人配置
 */
export interface WorkWeixinBot {
  /**
   * 机器人 webhook
   */
  url: string
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown'
  [k: string]: unknown
}

/**
 * Bark 配置
 */
export interface Bark {
  key: string
  /**
   * 消息等级
   */
  level?: 'passive' | 'timeSensitive' | 'active'
  [k: string]: unknown
}

/**
 * 回逍配置
 */
export interface TwoIm {
  key: string
  sid: string
  query: {
    plat?: string
    group?: string
    /**
     * 推送 icon，详见其文档
     */
    icon?: string | number
  }
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown'
  [k: string]: unknown
}

/**
 * ServerChan 配置
 */
export interface ServerChan {
  token: string
  [k: string]: unknown
}

/**
 * Telegram 配置
 */
export interface TgBot {
  apiHost?: string
  token: string
  chat_id: string | number
  disable_web_page_preview?: boolean
  proxy?: string
  agent?: unknown
  [k: string]: unknown
}

/**
 * PushPlus 配置
 */
export interface Pushplus {
  token: string
  [k: string]: unknown
}
