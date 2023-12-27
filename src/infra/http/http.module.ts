import { Module } from "@nestjs/common";
import { CreateAccountController } from "./controllers/create-account.controller";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { CreateQuestionController } from "./controllers/create-question.controller";
import { FecthRecentQuestionsController } from "./controllers/fecth-recent-questions.controller";
import { DatabaseModule } from "../database/database.module";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";
import { FecthRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateQuestionController,
    FecthRecentQuestionsController,
  ],
  providers: [CreateQuestionUseCase, FecthRecentQuestionsUseCase],
})
export class HttpModule {}
