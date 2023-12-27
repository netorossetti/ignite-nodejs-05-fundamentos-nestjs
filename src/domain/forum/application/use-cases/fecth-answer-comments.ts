import { Result, success } from "@/core/result";
import { AnswerComment } from "../../enterprise/entities/answer-comment";
import { AnswerCommentsRepository } from "../repositories/answer-comments-repository";

interface FecthAnswerCommentsUseCaseRequest {
  answerId: string;
  page: number;
}

type FecthAnswerCommentsUseCaseResponse = Result<
  null,
  {
    answerComments: AnswerComment[];
  }
>;

export class FecthAnswerCommentsUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    answerId,
    page,
  }: FecthAnswerCommentsUseCaseRequest): Promise<FecthAnswerCommentsUseCaseResponse> {
    const answerComments =
      await this.answerCommentsRepository.findManyByAnswerId(answerId, {
        page,
      });
    return success({ answerComments });
  }
}
