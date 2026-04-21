// 📚 统一响应格式工具
// RealWorld 规范要求错误响应格式为：{ errors: { body: ["错误信息"] } }
// 这样前端可以用同一套逻辑解析所有错误

/**
 * 构造标准错误响应体
 * @example errorBody('邮箱已被注册') → { errors: { body: ['邮箱已被注册'] } }
 */
export function errorBody(message: string | string[]) {
  return {
    errors: {
      body: Array.isArray(message) ? message : [message],
    },
  };
}
