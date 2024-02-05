import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Result, failure, success } from "@/core/result";
import { Notification } from "../../enterprise/entities/notification";
import { NotificationsRepository } from "../repositories/notifications-repository";
import { ResourceNotFoundError } from "@/core/error/errors/resource-not-found-error";
import { NotAllowedError } from "@/core/error/errors/not-allowed-error";
import { Injectable } from "@nestjs/common";

interface ReadNotificationUseCaseRequest {
  recipientId: string;
  notificationId: string;
}

type ReadNotificationUseCaseResponse = Result<
  ResourceNotFoundError | NotAllowedError,
  {
    notification: Notification;
  }
>;

@Injectable()
export class ReadNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification = await this.notificationsRepository.findById(
      notificationId
    );
    if (!notification) {
      return failure(new ResourceNotFoundError());
    }

    if (notification.recipientId.toString() !== recipientId) {
      return failure(new NotAllowedError());
    }

    notification.read();

    await this.notificationsRepository.save(notification);

    return success({ notification });
  }
}
