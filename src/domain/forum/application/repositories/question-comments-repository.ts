import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionComment } from "../../enterprise/entities/question-comment";

export abstract class QuestionCommentsRepository {
  abstract create(questionComment: QuestionComment): Promise<void>;
  abstract elete(questionComment: QuestionComment): Promise<void>;

  abstract indById(id: string): Promise<QuestionComment | null>;
  abstract indManyByQuestionId(
    questionId: string,
    params: PaginationParams
  ): Promise<QuestionComment[]>;
}
