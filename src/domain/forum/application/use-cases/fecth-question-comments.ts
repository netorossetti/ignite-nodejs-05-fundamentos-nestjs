import { Result, success } from "@/core/result";
import { QuestionComment } from "../../enterprise/entities/question-comment";
import { QuestionCommentsRepository } from "../repositories/question-comments-repository";

interface FecthQuestionCommentsUseCaseRequest {
  questionId: string;
  page: number;
}

type FecthQuestionCommentsUseCaseResponse = Result<
  null,
  {
    questionComments: QuestionComment[];
  }
>;

export class FecthQuestionCommentsUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    questionId,
    page,
  }: FecthQuestionCommentsUseCaseRequest): Promise<FecthQuestionCommentsUseCaseResponse> {
    const questionComments =
      await this.questionCommentsRepository.findManyByQuestionId(questionId, {
        page,
      });
    return success({ questionComments });
  }
}
