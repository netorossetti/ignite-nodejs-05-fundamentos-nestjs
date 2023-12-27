import { Result, failure, success } from "@/core/result";
import { AnswersRepository } from "../repositories/answers-repository";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";

interface DeleteAnswerUseCaseRequest {
  authorId: string;
  answerId: string;
}

type DeleteAnswerUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  null
>;

export class DeleteAnswerUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    authorId,
    answerId,
  }: DeleteAnswerUseCaseRequest): Promise<DeleteAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId);
    if (!answer) {
      return failure(new ResourceNotFoundError());
    }

    if (answer.authorId.toString() !== authorId) {
      return failure(new NotAllowedError());
    }

    await this.answersRepository.delete(answer);

    return success(null);
  }
}
