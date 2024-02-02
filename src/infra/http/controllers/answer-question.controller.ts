import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user.decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipes";
import { z } from "zod";
import { AnswerQuestionUseCase } from "@/domain/forum/application/use-cases/answer-question";

const answerQuestionBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
});

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>;

const zodValidation = new ZodValidationPipe(answerQuestionBodySchema);

@Controller("/questions/:questionId/answers")
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(zodValidation)
    body: AnswerQuestionBodySchema,
    @Param("questionId")
    questionId: string,
    @CurrentUser() user: UserPayload
  ) {
    const { content, attachments } = body;
    const userId = user.sub;

    const result = await this.answerQuestion.execute({
      content,
      questionId,
      authorId: userId,
      attachmentsIds: attachments,
    });

    if (result.isFailure()) {
      throw new BadRequestException();
    }
  }
}
