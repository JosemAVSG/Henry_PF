import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationType } from "../../entities/notificationType.entity";

@Injectable()
export class NotificationTypeSeeder {
    constructor(
        @InjectRepository(NotificationType)
        private readonly notificationTypeRepository: Repository<NotificationType>,
    ) {}

    async seedNotificationType() {
        try
        {
            if(await this.notificationTypeRepository.count() > 0) {
                return;
            }

            const notificationTypeData = [
                {name: "otorgar permisos de lectura a la factura"},
                {name: "otorgar permisos edición a la factura"},
                {name: "otorgar permisos de lectura al entregable"},
                {name: "otorgar permisos edición al entregable"},
                {name: "descargar la factura"},
                {name: "descargar el entregable"},
                {name: "cargar la factura"},
                {name: "cargar el entregable"},
                {name: "editar la factura"},
                {name: "editar el entregable"},
                {name: "se ha cargado un voucher de pago"},
                {name: "la factura ya fue revisada y aprobada"},

            ]

            await this.notificationTypeRepository.save(notificationTypeData);
            console.info('Seeded notification type Data');
        }catch(error) {
            console.error(error);
        }
    }
}