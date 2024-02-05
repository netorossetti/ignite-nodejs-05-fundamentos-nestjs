import { faker } from "@faker-js/faker";

import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import {
  Notification,
  NotificationProps,
} from "@/domain/notification/enterprise/entities/notification";
import { Injectable } from "@nestjs/common";
import { PrismaNotificationMapper } from "@/infra/database/prisma/mappers/prisma-notification-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

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

@Injectable()
export class NotificationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaNotification(
    data: Partial<NotificationProps> = {}
  ): Promise<Notification> {
    const notification = makeNotification(data);

    await this.prisma.notification.create({
      data: PrismaNotificationMapper.toPersistent(notification),
    });

    return notification;
  }
}
