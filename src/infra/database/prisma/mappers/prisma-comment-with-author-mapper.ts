import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";
import { Comment as PrismaComment, User as PrismaUser } from "@prisma/client";

type PrismaCommentWithAuthor = PrismaComment & {
  author: PrismaUser;
};

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaCommentWithAuthor): CommentWithAuthor {
    if (!raw.questionId) {
      throw new Error("Invalid comment type.");
    }

    return CommentWithAuthor.create({
      commentId: new UniqueEntityId(raw.questionId),
      content: raw.content,
      authorId: new UniqueEntityId(raw.authorId),
      author: raw.author.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
