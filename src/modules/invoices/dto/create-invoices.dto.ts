export class CreateInvoiceDto {
    invoiceNumber: string;
    path: string;
    issueDate: Date;
    dueDate: Date;
    amount: number;
    userId: number;
    invoiceStatusId: number;
    companyId?: number;  // Nuevo campo opcional para la relación con Company
}
