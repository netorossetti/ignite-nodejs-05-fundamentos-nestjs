import { faker } from "@faker-js/faker";

import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import {
  Question,
  QuestionProps,
} from "@/domain/forum/enterprise/entities/question";

export function makeQuestion(
  override: Partial<QuestionProps> = {},
  id?: UniqueEntityId
) {
  const newQuestion = Question.create(
    {
      authorId: new UniqueEntityId(),
      title: faker.lorem.sentence({ min: 3, max: 5 }),
      content: faker.lorem.text(),
      ...override,
    },
    id
  );

  return newQuestion;
}
