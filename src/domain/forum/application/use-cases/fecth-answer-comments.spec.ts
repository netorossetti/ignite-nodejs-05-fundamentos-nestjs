import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { makeAnswerComment } from "test/factories/make-answer-comment";
import { FetchAnswerCommentsUseCase } from "./fecth-answer-comments";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { makeStudent } from "test/factories/make-student";

let inMemoryStudentRepository: InMemoryStudentsRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe("Fetch Answer Comments", () => {
  beforeEach(() => {
    inMemoryStudentRepository = new InMemoryStudentsRepository();
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentRepository
    );
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);

    // habilitar uso de datas fakes no new Date()
    vi.useFakeTimers();
  });

  afterEach(() => {
    // habilitar uso de datas reais no new Date()
    vi.useRealTimers();
  });

  it("Should be able to fecht answer comments", async () => {
    const student = makeStudent({ name: "John Doe" });
    inMemoryStudentRepository.items.push(student);

    vi.setSystemTime(new Date(2022, 0, 20));
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId("answer-1"),
        authorId: student.id,
      })
    );

    vi.setSystemTime(new Date(2022, 0, 18));
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId("answer-1"),
        authorId: student.id,
      })
    );

    vi.setSystemTime(new Date(2022, 0, 23));
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId("answer-1"),
        authorId: student.id,
      })
    );

    const result = await sut.execute({
      answerId: "answer-1",
      page: 1,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.comments).toHaveLength(3);
    expect(result.value.comments).toEqual([
      expect.objectContaining({
        createdAt: new Date(2022, 0, 23),
        author: "John Doe",
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 20),
        author: "John Doe",
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 18),
        author: "John Doe",
      }),
    ]);
  });

  it("should be able to fecht paginated answer comments", async () => {
    const student = makeStudent({ name: "John Doe" });
    inMemoryStudentRepository.items.push(student);

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId("answer-1"),
          authorId: student.id,
        })
      );
    }

    const result = await sut.execute({
      answerId: "answer-1",
      page: 2,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.comments).toHaveLength(2);
  });
});
