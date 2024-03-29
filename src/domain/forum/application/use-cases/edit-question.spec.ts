import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { makeQuestion } from "test/factories/make-question";
import { EditQuestionUseCase } from "./edit-question";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { makeQuestionAttachment } from "test/factories/make-question-attachment";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let sut: EditQuestionUseCase;

describe("Edit Question", () => {
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
    sut = new EditQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionAttachmentsRepository
    );
  });

  it("should be able to edit a question", async () => {
    const newQuestion = makeQuestion({
      authorId: new UniqueEntityId("author-1"),
    });
    await inMemoryQuestionsRepository.create(newQuestion);
    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId("1"),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId("2"),
      })
    );

    await sut.execute({
      authorId: "author-1",
      questionId: newQuestion.id.toString(),
      title: "Novo Titulo",
      content: "Novo Conteudo",
      attachmentsIds: ["1", "3"],
    });

    expect(inMemoryQuestionsRepository.items).toHaveLength(1);
    expect(inMemoryQuestionsRepository.items[0]).toMatchObject({
      title: "Novo Titulo",
      content: "Novo Conteudo",
    });
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems
    ).toHaveLength(2);
    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems
    ).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
      expect.objectContaining({ attachmentId: new UniqueEntityId("3") }),
    ]);
  });

  it("not should be able to edit a question from another author", async () => {
    const newQuestion = makeQuestion({
      authorId: new UniqueEntityId("author-1"),
    });
    await inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      authorId: "author-2",
      questionId: newQuestion.id.toString(),
      title: "Novo Titulo",
      content: "Novo Conteudo",
      attachmentsIds: [],
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should sync new and removed attachments when editing a question", async () => {
    const newQuestion = makeQuestion({
      authorId: new UniqueEntityId("author-1"),
    });
    await inMemoryQuestionsRepository.create(newQuestion);
    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId("1"),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId("2"),
      })
    );

    const result = await sut.execute({
      authorId: "author-1",
      questionId: newQuestion.id.toString(),
      title: "Novo Titulo",
      content: "Novo Conteudo",
      attachmentsIds: ["1", "3"],
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryQuestionAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityId("1") }),
        expect.objectContaining({ attachmentId: new UniqueEntityId("3") }),
      ])
    );
  });
});
