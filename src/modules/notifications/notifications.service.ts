import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto } from './create-notification.dto';
import { UserEntity } from 'src/entities/user.entity';
import { Deliverable } from 'src/entities/deliverable.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { NotificationType } from 'src/entities/notificationType.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,

        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,

        @InjectRepository(Deliverable)
        private deliverableRepository: Repository<Deliverable>,

        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,

        @InjectRepository(NotificationType)
        private notificationsTypeRepository: Repository<NotificationType>
    ) {}

    async getNotifications() {
        return this.notificationsRepository.find({
            relations: ['notificationType', 
                'impactedUser', 
                'triggerUser', 
                'deliverable', 
                'invoice'],
            select:{
                notificationType: {name: true},
                impactedUser: {Names: true, LastName: true},
                triggerUser: {Names: true, LastName: true},
                deliverable: {name: true, path: true},
                invoice: {number: true},
                note: true,
                createdAt: true
            }
        });
    }

    async createNotification(createNotificationDto: CreateNotificationDto) {
        const {
            notificationTypeId,
            triggerUserId,
            impactedUserId,
            deliverableId,
            invoiceId,
            note
        } = createNotificationDto

        const notification = new Notification();
        notification.impactedUser = await this.userRepository.findOne({where: {id: impactedUserId}});

        notification.triggerUser = await this.userRepository.findOne({where: {id: triggerUserId}});

        notification.notificationType = await this.notificationsTypeRepository.findOne({where: {id: notificationTypeId}});

        if(deliverableId){
            notification.deliverable = await this.deliverableRepository.findOne({where: {id: deliverableId}});
        }

        if(invoiceId){            
            notification.invoice = await this.invoiceRepository.findOne({where: {id: invoiceId}});
        }

        notification.note = note;

        await this.notificationsRepository.save(notification);

        return {
            "message": "notification created", 
            "type": deliverableId?"deliverable":invoiceId?"invoice":"Undefined"
        }
    }
}
