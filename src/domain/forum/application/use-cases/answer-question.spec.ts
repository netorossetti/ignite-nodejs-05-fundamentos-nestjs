import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { AnswerQuestionUseCase } from "./answer-question";
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments-repository";

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: AnswerQuestionUseCase;

describe("Create Answer", () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository
    );
    sut = new AnswerQuestionUseCase(inMemoryAnswersRepository);
  });

  it("should be able create an answer", async () => {
    const result = await sut.execute({
      authorId: "1",
      questionId: "1",
      content: "Nova resposta",
      attachmentsIds: ["1", "2"],
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const answer = result.value.answer;

    expect(inMemoryAnswersRepository.items[0]).toEqual(answer);
    expect(answer.attachments.currentItems).toHaveLength(2);
    expect(answer.attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
      expect.objectContaining({ attachmentId: new UniqueEntityId("2") }),
    ]);
  });

  it("should persist attachments when creating a new answer", async () => {
    const result = await sut.execute({
      questionId: "1",
      authorId: "1",
      content: "Conteudo da resposta",
      attachmentsIds: ["1", "2"],
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const answer = result.value.answer;

    expect(inMemoryAnswersRepository.items[0]).toEqual(answer);
    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryAnswerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
        expect.objectContaining({ attachmentId: new UniqueEntityId("2") }),
      ])
    );
  });
});
