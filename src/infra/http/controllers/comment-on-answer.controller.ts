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
import { CommentOnAnswerUseCase } from "@/domain/forum/application/use-cases/comment-on-answer";

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
});

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>;

const zodValidation = new ZodValidationPipe(commentOnAnswerBodySchema);

@Controller("/answers/:answerId/comments")
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  async handle(
    @Body(zodValidation)
    body: CommentOnAnswerBodySchema,
    @Param("answerId")
    answerId: string,
    @CurrentUser() user: UserPayload
  ) {
    const { content } = body;
    const userId = user.sub;

    const result = await this.commentOnAnswer.execute({
      content,
      answerId,
      authorId: userId,
    });

    if (result.isFailure()) {
      throw new BadRequestException();
    }
  }
}
