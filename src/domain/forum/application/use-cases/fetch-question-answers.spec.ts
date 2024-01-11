import { makeAnswer } from "test/factories/make-answer";
import { FetchQuestionAnswersUseCase } from "./fetch-question-answers";
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments-repository";

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: FetchQuestionAnswersUseCase;

describe("Fetch Question Answers", () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository();
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository
    );
    sut = new FetchQuestionAnswersUseCase(inMemoryAnswersRepository);

    // habilitar uso de datas fakes no new Date()
    vi.useFakeTimers();
  });

  afterEach(() => {
    // habilitar uso de datas reais no new Date()
    vi.useRealTimers();
  });

  it("Should be able to fecht question answers", async () => {
    vi.setSystemTime(new Date(2022, 0, 20));
    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId("question-1") })
    );

    vi.setSystemTime(new Date(2022, 0, 18));
    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId("question-1") })
    );

    vi.setSystemTime(new Date(2022, 0, 23));
    await inMemoryAnswersRepository.create(
      makeAnswer({ questionId: new UniqueEntityId("question-1") })
    );

    const result = await sut.execute({
      questionId: "question-1",
      page: 1,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.answers).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ]);
  });

  it("should be able to fecht paginated question answers", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswersRepository.create(
        makeAnswer({ questionId: new UniqueEntityId("question-1") })
      );
    }

    const result = await sut.execute({
      questionId: "question-1",
      page: 2,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.answers).toHaveLength(2);
  });
});
