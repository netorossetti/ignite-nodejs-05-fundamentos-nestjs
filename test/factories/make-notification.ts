import { faker } from "@faker-js/faker";

import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import {
  Notification,
  NotificationProps,
} from "@/domain/notification/enterprise/entities/notification";

export function makeNotification(
  override: Partial<NotificationProps> = {},
  id?: UniqueEntityId
) {
  const newNotification = Notification.create(
    {
      recipientId: new UniqueEntityId(),
      title: faker.lorem.sentence({ min: 3, max: 5 }),
      content: faker.lorem.text(),
      ...override,
    },
    id
  );

  return newNotification;
}
