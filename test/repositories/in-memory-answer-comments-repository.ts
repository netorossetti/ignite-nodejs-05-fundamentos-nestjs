import { DomainEvents } from "@/core/events/domain-events";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";

import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";

export class InMemoryAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  public items: AnswerComment[] = [];

  constructor(private studentsRepository: InMemoryStudentsRepository) {}

  async create(answerComment: AnswerComment) {
    this.items.push(answerComment);
    DomainEvents.dispatchEventsForAggregate(answerComment.id);
  }

  async delete(answerComment: AnswerComment): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === answerComment.id
    );
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
    }
  }

  async findById(id: string): Promise<AnswerComment | null> {
    const answerComment = this.items.find((item) => item.id.toString() === id);
    if (!answerComment) {
      return null;
    }
    return answerComment;
  }

  async findManyByAnswerId(answerId: string, { page }: PaginationParams) {
    const questionComments = this.items
      .filter((item) => item.answerId.toString() === answerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return questionComments;
  }

  async findManyByAnswerIdWithAuthor(
    questionId: string,
    { page }: PaginationParams
  ) {
    const questionComments = this.items
      .filter((item) => item.answerId.toString() === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)
      .map((comment) => {
        const author = this.studentsRepository.items.find((student) => {
          return student.id.equals(comment.authorId);
        });
        if (!author)
          throw new Error(
            `Author with id "${comment.authorId.toString()}" does not exists.`
          );

        return CommentWithAuthor.create({
          commentId: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          authorId: comment.authorId,
          author: author.name,
        });
      });

    return questionComments;
  }
}
