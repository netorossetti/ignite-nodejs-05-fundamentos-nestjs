import { Result, success } from "@/core/result";
import { Question } from "../../enterprise/entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";

interface FecthRecentQuestionsUseCaseRequest {
  page: number;
}

type FecthRecentQuestionsUseCaseResponse = Result<
  null,
  {
    questions: Question[];
  }
>;

export class FecthRecentQuestionsUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    page,
  }: FecthRecentQuestionsUseCaseRequest): Promise<FecthRecentQuestionsUseCaseResponse> {
    const questions = await this.questionsRepository.findManyRecents({ page });
    return success({ questions });
  }
}
