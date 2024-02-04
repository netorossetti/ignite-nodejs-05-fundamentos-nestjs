import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details";
import { AttachmentPresenter } from "./attachmentPresenter";

export class QuestionDetailsPresenter {
  static toHTTP(questionDetails: QuestionDetails) {
    return {
      questionId: questionDetails.questionId.toString(),
      authorId: questionDetails.authorId.toString(),
      author: questionDetails.author,
      title: questionDetails.title,
      slug: questionDetails.slug,
      content: questionDetails.content,
      bestAnswerId: questionDetails.bestAnswerId?.toString(),
      createdAt: questionDetails.createdAt,
      updatedAt: questionDetails.updatedAt,
      attachments: questionDetails.attachments.map(AttachmentPresenter.toHTTP),
    };
  }
}
