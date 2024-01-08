import { Result, failure, success } from "@/core/result";
import { Injectable } from "@nestjs/common";
import { Student } from "../../enterprise/entities/student";
import { StudentsRepository } from "../repositories/students-repository";
import { HashGenerator } from "../criptography/hash-generator";
import { StudentAlreadyExistsError } from "./errors/student-already-exists-error";

interface RegisterStudentUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterStudentUseCaseResponse = Result<
  StudentAlreadyExistsError,
  {
    student: Student;
  }
>;

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    private studentRepository: StudentsRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterStudentUseCaseRequest): Promise<RegisterStudentUseCaseResponse> {
    const studentWithSameEmail = await this.studentRepository.findByEmail(
      email
    );
    if (studentWithSameEmail) {
      return failure(new StudentAlreadyExistsError(email));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const student = Student.create({
      email,
      name,
      password: hashedPassword,
    });

    await this.studentRepository.create(student);

    return success({ student });
  }
}
