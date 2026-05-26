import { Module } from '@nestjs/common';
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "../src/lib/auth.js";
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: "2mb" },
        urlencoded: { limit: "2mb", extended: true },
        rawBody: true,
      },
    }),
    ProjectsModule,
    UsersModule
  ],
  providers: [],
})


export class AppModule {}
