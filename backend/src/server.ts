// 📚 必须是第一行：在所有模块加载前就注入环境变量
// 'dotenv/config' 从当前工作目录读取 .env 文件
// 因为 dev 脚本已经 cd 进了 backend/ 目录，所以这里能正确找到 backend/.env
import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { logger } from './modules/utils/logger';

app.listen(env.PORT, () => {
  logger.info('server.started', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  });
});
