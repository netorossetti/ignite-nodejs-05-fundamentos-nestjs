import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { Question } from "@/domain/forum/enterprise/entities/question";
import { InMemoryQuestionAttachmentsRepository } from "./in-memory-question-attachments-repository";
import { DomainEvents } from "@/core/events/domain-events";

export class InMemoryQuestionsRepository implements QuestionsRepository {
  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
  ) {}

  public items: Question[] = [];

  async create(question: Question) {
    this.items.push(question);
    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems()
    );

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async delete(question: Question) {
    const itemIndex = this.items.findIndex((item) => item.id === question.id);
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
      this.questionAttachmentsRepository.deleteManyByQuestionId(
        question.id.toString()
      );
    }
  }

  async save(question: Question) {
    const itemIndex = this.items.findIndex((item) => item.id === question.id);
    if (itemIndex !== -1) {
      this.items[itemIndex] = question;
      await this.questionAttachmentsRepository.createMany(
        question.attachments.getNewItems()
      );
      await this.questionAttachmentsRepository.deleteMany(
        question.attachments.getRemovedItems()
      );
      DomainEvents.dispatchEventsForAggregate(question.id);
    }
  }

  async findById(id: string): Promise<Question | null> {
    const question = this.items.find((item) => item.id.toString() === id);
    if (!question) {
      return null;
    }
    return question;
  }

  async findQuestionBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);
    if (!question) {
      return null;
    }
    return question;
  }

  async findManyRecents({ page }: PaginationParams) {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return questions;
  }
}
