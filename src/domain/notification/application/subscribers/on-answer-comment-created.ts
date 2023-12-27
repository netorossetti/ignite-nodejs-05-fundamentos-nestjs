import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { SendNotificationUseCase } from "../use-cases/send-notification";
import { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";
import { AnswerCommentCreatedEvent } from "@/domain/forum/enterprise/events/answer-comment-created-event";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";

export class OnAnswerCommentCreated implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCommentCreatedEvent.name
    );
  }

  private async sendNewAnswerNotification({
    answerComment,
  }: AnswerCommentCreatedEvent) {
    const answer = await this.answersRepository.findById(
      answerComment.answerId.toString()
    );

    if (answer) {
      const question = await this.questionsRepository.findById(
        answer.questionId.toString()
      );

      if (question) {
        await this.sendNotification.execute({
          recipientId: answer.authorId.toString(),
          title: `Novo comentário em sua resposta a pergunta "${question.title
            .substring(0, 40)
            .concat("...")}"`,
          content: answer.excerpt,
        });
      }
    }
  }
}

/** Explicação: .bind(this)
 *
 * esta função tem por sua definição dizer para o local onde ela for
 * chamada, no caso dos eventos, a classe DomainEvents, que o "this" se referencia a
 * ela mesma, e não a classe DomainEvents.
 */
