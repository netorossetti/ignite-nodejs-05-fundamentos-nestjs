import { Result, failure, success } from "@/core/result";
import { Question } from "../../enterprise/entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { QuestionAttachmentsRepository } from "../repositories/question-attachments-repository";
import { QuestionAttachmentList } from "../../enterprise/entities/question-attachment-list";
import { QuestionAttachment } from "../../enterprise/entities/question-attachment";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

interface EditQuestionUseCaseRequest {
  authorId: string;
  questionId: string;
  title: string;
  content: string;
  attachmentsIds: string[];
}

type EditQuestionUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  {
    question: Question;
  }
>;

@Injectable()
export class EditQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionAttachmentsRepository: QuestionAttachmentsRepository
  ) {}

  async execute({
    authorId,
    questionId,
    title,
    content,
    attachmentsIds,
  }: EditQuestionUseCaseRequest): Promise<EditQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId);
    if (!question) {
      return failure(new ResourceNotFoundError());
    }

    if (question.authorId.toString() !== authorId) {
      return failure(new NotAllowedError());
    }

    const currentQuestionAttachments =
      await this.questionAttachmentsRepository.findManyByQuestionId(
        question.id.toString()
      );

    // Instaciar lista de anexos da pergunta
    const questionAttachmentList = new QuestionAttachmentList(
      currentQuestionAttachments
    );

    // Atualizar lista de anexos da pergunta com os anexos editados
    questionAttachmentList.update(
      attachmentsIds.map((attachmentId) => {
        return QuestionAttachment.create({
          attachmentId: new UniqueEntityId(attachmentId),
          questionId: question.id,
        });
      })
    );

    // Atualizar dados da pergunta
    question.title = title;
    question.content = content;
    question.attachments = questionAttachmentList;

    // Salvar dados da pergunta
    await this.questionsRepository.save(question);

    return success({ question });
  }
}
