export class CreateNotificationDto {
    notificationTypeId: number;
    triggerUserId: number;
    impactedUserId: number;
    deliverableId?: number;
    invoiceId?: number;
    note?: string;
}