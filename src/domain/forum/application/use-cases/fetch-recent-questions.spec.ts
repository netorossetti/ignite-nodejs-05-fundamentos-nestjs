import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { FetchRecentQuestionsUseCase } from "./fetch-recent-questions";
import { makeQuestion } from "test/factories/make-question";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: FetchRecentQuestionsUseCase;

describe("Fetch Recent Questions", () => {
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
    sut = new FetchRecentQuestionsUseCase(inMemoryQuestionsRepository);

    // habilitar uso de datas fakes no new Date()
    vi.useFakeTimers();
  });

  afterEach(() => {
    // habilitar uso de datas reais no new Date()
    vi.useRealTimers();
  });

  it("Should be able to fecht recent questions", async () => {
    vi.setSystemTime(new Date(2022, 0, 20));
    await inMemoryQuestionsRepository.create(makeQuestion());

    vi.setSystemTime(new Date(2022, 0, 18));
    await inMemoryQuestionsRepository.create(makeQuestion());

    vi.setSystemTime(new Date(2022, 0, 23));
    await inMemoryQuestionsRepository.create(makeQuestion());

    const result = await sut.execute({ page: 1 });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.questions).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ]);
  });

  it("Should be able to fecht paginated recent questions", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionsRepository.create(makeQuestion());
    }

    const result = await sut.execute({ page: 2 });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.questions).toHaveLength(2);
  });
});
