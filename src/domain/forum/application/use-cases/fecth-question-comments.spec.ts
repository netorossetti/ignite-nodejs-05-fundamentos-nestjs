import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { InMemoryQuestionCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { makeQuestionComment } from "test/factories/make-question-comment";
import { FetchQuestionCommentsUseCase } from "./fecth-question-comments";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { makeStudent } from "test/factories/make-student";

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe("Fetch Question Comments", () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository
    );
    sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository);

    // habilitar uso de datas fakes no new Date()
    vi.useFakeTimers();
  });

  afterEach(() => {
    // habilitar uso de datas reais no new Date()
    vi.useRealTimers();
  });

  it("Should be able to fecht question comments", async () => {
    const student = makeStudent({ name: "John Doe" });
    inMemoryStudentsRepository.items.push(student);

    vi.setSystemTime(new Date(2022, 0, 20));
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId("question-1"),
        authorId: student.id,
      })
    );

    vi.setSystemTime(new Date(2022, 0, 18));
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId("question-1"),
        authorId: student.id,
      })
    );

    vi.setSystemTime(new Date(2022, 0, 23));
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId("question-1"),
        authorId: student.id,
      })
    );

    const result = await sut.execute({
      questionId: "question-1",
      page: 1,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.comments).toHaveLength(3);
    expect(result.value.comments).toEqual(
      expect.arrayContaining([
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
      ])
    );
  });

  it("should be able to fecht paginated question comments", async () => {
    const student = makeStudent();
    inMemoryStudentsRepository.items.push(student);

    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId("question-1"),
          authorId: student.id,
        })
      );
    }

    const result = await sut.execute({
      questionId: "question-1",
      page: 2,
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isFailure()) return;

    expect(result.value.comments).toHaveLength(2);
  });
});
