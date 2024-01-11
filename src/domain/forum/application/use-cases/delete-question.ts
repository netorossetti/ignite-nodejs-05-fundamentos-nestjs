import { Result, failure, success } from "@/core/result";
import { QuestionsRepository } from "../repositories/questions-repository";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

interface DeleteQuestionUseCaseRequest {
  authorId: string;
  questionId: string;
}

type DeleteQuestionUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  null
>;

@Injectable()
export class DeleteQuestionUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    authorId,
    questionId,
  }: DeleteQuestionUseCaseRequest): Promise<DeleteQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId);
    if (!question) {
      return failure(new ResourceNotFoundError());
    }

    if (question.authorId.toString() !== authorId) {
      return failure(new NotAllowedError());
    }

    await this.questionsRepository.delete(question);

    return success(null);
  }
}
