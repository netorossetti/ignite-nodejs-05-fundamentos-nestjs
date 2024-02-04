import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";
import { Attachment } from "../attachment";

export interface QuestionDetailsProps {
  questionId: UniqueEntityId;
  title: string;
  slug: string;
  content: string;
  authorId: UniqueEntityId;
  author: string;
  attachments: Attachment[];
  bestAnswerId?: UniqueEntityId | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
  get questionId() {
    return this.questionId;
  }

  get title() {
    return this.title;
  }

  get slug() {
    return this.slug;
  }

  get content() {
    return this.content;
  }

  get authorId() {
    return this.authorId;
  }

  get author() {
    return this.author;
  }

  get attachments() {
    return this.attachments;
  }

  get bestAnswerId() {
    return this.bestAnswerId;
  }

  get createdAt() {
    return this.createdAt;
  }

  get updatedAt() {
    return this.updatedAt;
  }

  static create(props: QuestionDetailsProps) {
    return new QuestionDetails(props);
  }
}
