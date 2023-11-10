import { OffsetPagination } from "./offset-pagination.interface";
import { CursorPagination } from "./cursor-pagination.interface";

export type Pagination = OffsetPagination | CursorPagination;
