import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.tu-servidor.com',
        port: 587,
        secure: false,
        auth: {
          user: '191244@ids.upchiapas.edu.mx',
          pass: 'ulises209',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@tu-dominio.com>',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
