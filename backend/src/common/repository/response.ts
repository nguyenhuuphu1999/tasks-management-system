export class ResponsePaging<T> {
    dataPaging: T[];
    perPage: number;
    totalData: number;
    totalPage: number;
    currentPage: number;
}
