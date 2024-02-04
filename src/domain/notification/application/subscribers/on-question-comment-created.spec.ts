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
import { makeQuestionComment } from "test/factories/make-question-comment";
import { InMemoryQuestionCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { OnQuestionCommentCreated } from "./on-question-comment-created";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sendNotificationUseCase: SendNotificationUseCase;

let sendNotificationExecuteSpy: SpyInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>;

describe("On Answer Comment Created", () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryStudentRepository = new InMemoryStudentsRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentRepository
    );
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository
    );
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentRepository
    );

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, "execute");
    new OnQuestionCommentCreated(
      inMemoryQuestionsRepository,
      sendNotificationUseCase
    );
  });

  it("should send a notification when an answer comment is created", async () => {
    const question = makeQuestion();
    await inMemoryQuestionsRepository.create(question);

    const questionComment = makeQuestionComment({
      questionId: question.id,
    });
    expect(questionComment.domainEvents).toHaveLength(1);
    expect(inMemoryNotificationsRepository.items).toHaveLength(0);

    await inMemoryQuestionCommentsRepository.create(questionComment);

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled();
    });

    expect(questionComment.domainEvents).toHaveLength(0);
    expect(inMemoryNotificationsRepository.items).toHaveLength(1);
  });
});
