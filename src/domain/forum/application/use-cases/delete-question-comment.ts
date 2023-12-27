import { Result, failure, success } from "@/core/result";
import { QuestionCommentsRepository } from "../repositories/question-comments-repository";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";

interface DeleteQuestionCommentUseCaseRequest {
  authorId: string;
  questionCommentId: string;
}

type DeleteQuestionCommentUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  null
>;

export class DeleteQuestionCommentUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    authorId,
    questionCommentId,
  }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
    const questionComment = await this.questionCommentsRepository.findById(
      questionCommentId
    );
    if (!questionComment) {
      return failure(new ResourceNotFoundError());
    }

    if (questionComment.authorId.toString() !== authorId) {
      return failure(new NotAllowedError());
    }

    await this.questionCommentsRepository.delete(questionComment);

    return success(null);
  }
}
