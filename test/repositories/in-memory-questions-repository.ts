import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { Question } from "@/domain/forum/enterprise/entities/question";
import { InMemoryQuestionAttachmentsRepository } from "./in-memory-question-attachments-repository";
import { DomainEvents } from "@/core/events/domain-events";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details";

export class InMemoryQuestionsRepository implements QuestionsRepository {
  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository
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

  async findBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);
    if (!question) {
      return null;
    }
    return question;
  }

  async findDetailsBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);
    if (!question) {
      return null;
    }

    const author = this.studentsRepository.items.find((student) =>
      student.id.equals(question.authorId)
    );
    if (!author) {
      throw new Error(
        `Author with id "${question.authorId.toString()}" does not exists.`
      );
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) => questionAttachment.questionId.equals(question.id)
    );

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentsRepository.items.find((attachment) =>
        attachment.id.equals(questionAttachment.id)
      );
      if (!attachment) {
        throw new Error(
          `Attachment with id "${question.authorId.toString()}" does not exists.`
        );
      }
      return attachment;
    });

    return QuestionDetails.create({
      questionId: question.id,
      authorId: author.id,
      author: author.name,
      title: question.title,
      slug: question.slug.value,
      content: question.content,
      bestAnswerId: question.bestAnswerId,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      attachments,
    });
  }

  async findManyRecents({ page }: PaginationParams) {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return questions;
  }
}
