import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { makeAnswerComment } from "test/factories/make-answer-comment";
import { DeleteAnswerCommentUseCase } from "./delete-answer-comment";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: DeleteAnswerCommentUseCase;

describe("Delete Answer Comment", () => {
  beforeEach(() => {
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentsRepository);
  });

  it("should be able to delete a answer comment", async () => {
    const newAnswerComment = makeAnswerComment({
      authorId: new UniqueEntityId("author-1"),
    });
    await inMemoryAnswerCommentsRepository.create(newAnswerComment);

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(1);

    await sut.execute({
      authorId: "author-1",
      answerCommentId: newAnswerComment.id.toString(),
    });

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(0);
  });

  it("not should be able to delete another author answer comment", async () => {
    const newAnswerComment = makeAnswerComment({
      authorId: new UniqueEntityId("author-1"),
    });
    await inMemoryAnswerCommentsRepository.create(newAnswerComment);

    const result = await sut.execute({
      authorId: "author-2",
      answerCommentId: newAnswerComment.id.toString(),
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
