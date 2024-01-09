import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user.decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipes";
import { z } from "zod";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

const zodValidation = new ZodValidationPipe(createQuestionBodySchema);

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  async handle(
    @Body(zodValidation)
    body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { content, title } = body;
    const userId = user.sub;

    const result = await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
    });

    if (result.isFailure()) {
      throw new BadRequestException();
    }
  }
}
