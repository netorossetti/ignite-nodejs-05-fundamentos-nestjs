import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CreateQuestionUseCase } from "./create-question";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: CreateQuestionUseCase;

describe("Create Question", () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository
    );
    sut = new CreateQuestionUseCase(inMemoryQuestionsRepository);
  });

  it("should be able to create a question", async () => {
    const result = await sut.execute({
      authorId: "1",
      title: "Titulo da pergunta",
      content: "Conteudo da pergunta",
      attachmentsIds: [],
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(inMemoryQuestionsRepository.items[0]).toEqual(result.value.question);
  });

  it("should be able to create a question with attachments", async () => {
    const result = await sut.execute({
      authorId: "1",
      title: "Titulo da pergunta",
      content: "Conteudo da pergunta",
      attachmentsIds: ["1", "2"],
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const question = result.value.question;

    expect(inMemoryQuestionsRepository.items[0]).toEqual(question);
    expect(question.attachments.currentItems).toHaveLength(2);
    expect(question.attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
      expect.objectContaining({ attachmentId: new UniqueEntityId("2") }),
    ]);
  });

  it("should persist attachments when creating a new question", async () => {
    const result = await sut.execute({
      authorId: "1",
      title: "Titulo da pergunta",
      content: "Conteudo da pergunta",
      attachmentsIds: ["1", "2"],
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const question = result.value.question;

    expect(inMemoryQuestionsRepository.items[0]).toEqual(question);
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryQuestionAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
        expect.objectContaining({ attachmentId: new UniqueEntityId("2") }),
      ])
    );
  });
});
