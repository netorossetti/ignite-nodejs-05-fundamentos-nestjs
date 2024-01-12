import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";

describe("E2E: Fetch Answer Comments Controller", () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let answerCommentFactory: AnswerCommentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    answerCommentFactory = moduleRef.get(AnswerCommentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test("[GET] /questions/:questionId/comments", async () => {
    const user = await studentFactory.makePrismaStudent();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      title: "Question 1",
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    });

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        answerId: answer.id,
        authorId: user.id,
        content: "Comentário 1",
      }),
      answerCommentFactory.makePrismaAnswerComment({
        answerId: answer.id,
        authorId: user.id,
        content: "Comentário 2",
      }),
      answerCommentFactory.makePrismaAnswerComment({
        answerId: answer.id,
        authorId: user.id,
        content: "Comentário 3",
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id.toString()}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({ content: "Comentário 1" }),
        expect.objectContaining({ content: "Comentário 2" }),
        expect.objectContaining({ content: "Comentário 3" }),
      ]),
    });
  });
});
