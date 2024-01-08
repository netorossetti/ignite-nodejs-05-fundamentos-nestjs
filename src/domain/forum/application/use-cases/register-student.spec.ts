import { RegisterStudentUseCase } from "./register-student";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { Student } from "../../enterprise/entities/student";
import { StudentAlreadyExistsError } from "./errors/student-already-exists-error";
import { makeStudent } from "test/factories/make-student";

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let sut: RegisterStudentUseCase;

describe("Register Student", () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    fakeHasher = new FakeHasher();
    sut = new RegisterStudentUseCase(inMemoryStudentsRepository, fakeHasher);
  });

  it("should be able register a new student", async () => {
    const result = await sut.execute({
      name: "John Doe",
      email: "jhondoe@example.com",
      password: "123456",
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value).toEqual({
      student: inMemoryStudentsRepository.items[0],
    });
  });

  it("not should be able register student with same email", async () => {
    const student = makeStudent({
      email: "jhondoe@example.com",
      password: await fakeHasher.hash("123456"),
    });
    inMemoryStudentsRepository.create(student);

    const result = await sut.execute({
      name: "John Doe",
      email: "jhondoe@example.com",
      password: "123456",
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(StudentAlreadyExistsError);
  });

  it("should hash student password upon registration", async () => {
    const result = await sut.execute({
      name: "John Doe",
      email: "jhondoe@example.com",
      password: "123456",
    });

    const hashedPassword = await fakeHasher.hash("123456");

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(inMemoryStudentsRepository.items[0].password).toEqual(
      hashedPassword
    );
  });
});
