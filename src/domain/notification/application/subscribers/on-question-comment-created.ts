import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { SendNotificationUseCase } from "../use-cases/send-notification";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { QuestionCommentCreatedEvent } from "@/domain/forum/enterprise/events/question-comment-created-event";

export class OnQuestionCommentCreated implements EventHandler {
  constructor(
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewQuestionNotification.bind(this),
      QuestionCommentCreatedEvent.name
    );
  }

  private async sendNewQuestionNotification({
    questionComment,
  }: QuestionCommentCreatedEvent) {
    const question = await this.questionsRepository.findById(
      questionComment.questionId.toString()
    );

    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: `Novo comentário em sua pergunta "${question.title
          .substring(0, 40)
          .concat("...")}"`,
        content: question.excerpt,
      });
    }
  }
}

/** Explicação: .bind(this)
 *
 * esta função tem por sua definição dizer para o local onde ela for
 * chamada, no caso dos eventos, a classe DomainEvents, que o "this" se referencia a
 * ela mesma, e não a classe DomainEvents.
 */
