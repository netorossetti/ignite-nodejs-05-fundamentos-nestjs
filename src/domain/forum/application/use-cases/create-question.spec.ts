import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CreateQuestionUseCase } from "./create-question";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: CreateQuestionUseCase;

describe("Create Question", () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository();
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository
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
});
