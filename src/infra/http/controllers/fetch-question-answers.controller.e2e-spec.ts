import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";

describe("E2E: Fetch Question Answers Controller", () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactorry: AnswerFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactorry = moduleRef.get(AnswerFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test("[GET] /answers/:questionId", async () => {
    const user = await studentFactory.makePrismaStudent();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      title: "Question 1",
      authorId: user.id,
    });
    const questionId = question.id.toString();

    await Promise.all([
      answerFactorry.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: "Resposta 1",
      }),
      answerFactorry.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: "Resposta 2",
      }),
      answerFactorry.makePrismaAnswer({
        questionId: question.id,
        authorId: user.id,
        content: "Resposta 3",
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({ content: "Resposta 1" }),
        expect.objectContaining({ content: "Resposta 2" }),
        expect.objectContaining({ content: "Resposta 3" }),
      ]),
    });
  });
});
