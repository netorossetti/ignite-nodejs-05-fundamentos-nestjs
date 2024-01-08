import { RegisterStudentUseCase } from "./register-student";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { Student } from "../../enterprise/entities/student";
import { StudentAlreadyExistsError } from "./errors/student-already-exists-error";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { AuthenticateStudentUseCase } from "./authenticate-student";
import { makeStudent } from "test/factories/make-student";

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe("Authenticate Student", () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    fakeHasher = new FakeHasher();
    fakeEncrypter = new FakeEncrypter();
    sut = new AuthenticateStudentUseCase(
      inMemoryStudentsRepository,
      fakeHasher,
      fakeEncrypter
    );
  });

  it("should be able authenticate a student", async () => {
    const student = makeStudent({
      email: "jhondoe@example.com",
      password: await fakeHasher.hash("123456"),
    });
    inMemoryStudentsRepository.create(student);

    const result = await sut.execute({
      email: "jhondoe@example.com",
      password: "123456",
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });
});
