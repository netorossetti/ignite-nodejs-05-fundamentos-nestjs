import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipes";
import { z } from "zod";
import { FetchAnswerCommentsUseCase } from "@/domain/forum/application/use-cases/fecth-answer-comments";
import { CommentPresenter } from "../presenters/comment-presenter";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller("/answers/:answerId/comments")
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

  @Get()
  async handle(
    @Param("answerId") answerId: string,
    @Query("page", queryValidationPipe) page: PageQueryParamSchema
  ) {
    const result = await this.fetchAnswerComments.execute({
      answerId,
      page,
    });
    if (result.isFailure()) {
      throw new BadRequestException();
    }

    const answerComments = result.value.answerComments;
    return { comments: answerComments.map(CommentPresenter.toHTTP) };
  }
}
