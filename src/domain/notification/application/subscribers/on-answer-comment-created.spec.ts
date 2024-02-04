import { makeAnswer } from "test/factories/make-answer";
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments-repository";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from "../use-cases/send-notification";
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository";
import { makeQuestion } from "test/factories/make-question";
import { SpyInstance } from "vitest";
import { waitFor } from "test/utils/wait-for";
import { makeAnswerComment } from "test/factories/make-answer-comment";
import { OnAnswerCommentCreated } from "./on-answer-comment-created";
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";

let inMemoryStudentRepository: InMemoryStudentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sendNotificationUseCase: SendNotificationUseCase;

let sendNotificationExecuteSpy: SpyInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>;

describe("On Answer Comment Created", () => {
  beforeEach(() => {
    inMemoryStudentRepository = new InMemoryStudentsRepository();
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentRepository
    );
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentRepository
    );
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository
    );
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository
    );

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, "execute");
    new OnAnswerCommentCreated(
      inMemoryAnswersRepository,
      inMemoryQuestionsRepository,
      sendNotificationUseCase
    );
  });

  it("should send a notification when an answer comment is created", async () => {
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id,
    });
    const answerComment = makeAnswerComment({
      answerId: answer.id,
    });

    await inMemoryQuestionsRepository.create(question);
    await inMemoryAnswersRepository.create(answer);

    expect(answerComment.domainEvents).toHaveLength(1);
    expect(inMemoryNotificationsRepository.items).toHaveLength(0);

    await inMemoryAnswerCommentsRepository.create(answerComment);

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled();
    });

    expect(answerComment.domainEvents).toHaveLength(0);
    expect(inMemoryNotificationsRepository.items).toHaveLength(1);
  });
});
