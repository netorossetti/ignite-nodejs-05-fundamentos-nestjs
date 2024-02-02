import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";
import { Answer } from "@/domain/forum/enterprise/entities/answer";
import { InMemoryAnswerAttachmentsRepository } from "./in-memory-answer-attachments-repository";
import { DomainEvents } from "@/core/events/domain-events";

export class InMemoryAnswersRepository implements AnswersRepository {
  constructor(
    private answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
  ) {}

  public items: Answer[] = [];

  async create(answer: Answer) {
    this.items.push(answer);
    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getItems()
    );
    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async delete(answer: Answer) {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id);
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
      this.answerAttachmentsRepository.deleteManyByAnswerId(
        answer.id.toString()
      );
    }
  }

  async save(answer: Answer) {
    const itemIndex = this.items.findIndex((item) => item.id === answer.id);
    if (itemIndex !== -1) {
      this.items[itemIndex] = answer;
      await this.answerAttachmentsRepository.createMany(
        answer.attachments.getNewItems()
      );
      await this.answerAttachmentsRepository.deleteMany(
        answer.attachments.getRemovedItems()
      );
      DomainEvents.dispatchEventsForAggregate(answer.id);
    }
  }

  async findById(answerId: string) {
    const answer = this.items.find((item) => item.id.toString() === answerId);
    if (!answer) {
      return null;
    }
    return answer;
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return answers;
  }
}
