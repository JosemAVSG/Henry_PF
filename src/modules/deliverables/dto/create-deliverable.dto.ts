export class CreateDeliverableDto {

    name: string;
    path: string;
    deliverableTypeId: number;
    deliverableCategoryId: number;
    isFolder: boolean;
    parentId: number;
}
