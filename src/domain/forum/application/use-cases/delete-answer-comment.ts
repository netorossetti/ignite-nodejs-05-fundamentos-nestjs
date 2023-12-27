import { success, failure, Result } from "@/core/result";
import { AnswerCommentsRepository } from "../repositories/answer-comments-repository";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";

interface DeleteAnswerCommentUseCaseRequest {
  authorId: string;
  answerCommentId: string;
}

type DeleteAnswerCommentUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  null
>;

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    authorId,
    answerCommentId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment = await this.answerCommentsRepository.findById(
      answerCommentId
    );
    if (!answerComment) {
      return failure(new ResourceNotFoundError());
    }

    if (answerComment.authorId.toString() !== authorId) {
      //throw new Error("Not allowed.");
      return failure(new NotAllowedError());
    }

    await this.answerCommentsRepository.delete(answerComment);

    return success(null);
  }
}
