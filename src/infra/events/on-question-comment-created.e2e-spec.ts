import { DomainEvents } from "@/core/events/domain-events";
import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";
import { waitFor } from "test/utils/wait-for";

describe("E2E: On Question Comment Created", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    jwt = moduleRef.get(JwtService);

    // Permitir disparos de eventos de dominios no teste E2E
    DomainEvents.shouldRun = true;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should send notification when question comment is created", async () => {
    const user = await studentFactory.makePrismaStudent();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });
    const questionId = question.id.toString();

    await request(app.getHttpServer())
      .post(`/questions/${questionId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "Nova comentario na pergunta",
      });

    await waitFor(async () => {
      const notificationsOnDatabase = await prisma.notification.findFirst({
        where: { recipientId: user.id.toString() },
      });
      expect(notificationsOnDatabase).not.toBeNull();
    });

    const notifications = await prisma.notification.findMany();
    console.log(notifications);
  });
});
