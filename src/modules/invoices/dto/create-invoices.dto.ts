export class CreateInvoiceDto {
    invoiceNumber: string;
    path: string;
    issueDate:Date;
    dueDate:Date;
    amount:number;
    userId:number;
    invoiceStatusId:number;
}
