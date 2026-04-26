import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 开发阶段允许跨域，后面 Docker 部署时通过 Nginx 代理就不需要了
  app.enableCors();

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();