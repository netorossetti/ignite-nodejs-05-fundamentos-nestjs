import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details";
import {
  Question as PrismaQuestion,
  Attachment as PrismaAttachment,
  User as PrismaUser,
} from "@prisma/client";
import { PrismaAttachmentMapper } from "./prisma-attachment-mapper";

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser;
  attachments: PrismaAttachment[];
};

export class PrismaQuestionDetailsMapper {
  static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityId(raw.id),
      title: raw.title,
      content: raw.content,
      authorId: new UniqueEntityId(raw.authorId),
      author: raw.author.name,
      bestAnswerId: raw.bestAnswerId
        ? new UniqueEntityId(raw.bestAnswerId)
        : null,
      slug: raw.slug,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      attachments: raw.attachments.map(PrismaAttachmentMapper.toDomain),
    });
  }
}
