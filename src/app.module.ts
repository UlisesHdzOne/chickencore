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
        host: 'smtp.mailersend.net',
        port: 2525,
        secure: false,
        auth: {
          user: 'MS_1z165M@test-zxk54v861opljy6v.mlsender.net',
          pass: 'mssp.ikB4kJD.neqvygmyj2zg0p7w.EAtoO1O',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@test-zxk54v861opljy6v.mlsender.net>',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
