import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { Comment, CommentProps } from "./comment";
import { AnswerCommentCreatedEvent } from "../events/answer-comment-created-event";

export interface AnswerCommentProps extends CommentProps {
  answerId: UniqueEntityId;
}

export class AnswerComment extends Comment<AnswerCommentProps> {
  get answerId() {
    return this.props.answerId;
  }

  static create(
    props: Optional<AnswerCommentProps, "createdAt">,
    id?: UniqueEntityId
  ) {
    const answerComment = new AnswerComment(
      {
        ...props,
        createdAt: new Date(),
      },
      id
    );

    // Publicando o evento de nova resposta criada
    const isNewAnswer = !id;
    if (isNewAnswer) {
      answerComment.addDomainEvent(
        new AnswerCommentCreatedEvent(answerComment)
      );
    }

    return answerComment;
  }
}
