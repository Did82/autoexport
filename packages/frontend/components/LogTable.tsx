import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type LogTableProps<T> = {
    data: T[];
    columns: { key: keyof T; label: string }[];
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onSort: (field: keyof T) => void;
    sortField: keyof T;
    sortDirection: 'asc' | 'desc';
};

export function LogTable<T>({
    data,
    columns,
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onSort,
    sortField,
    sortDirection,
}: LogTableProps<T>) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key as string}
                                className="cursor-pointer"
                                onClick={() => onSort(column.key)}
                            >
                                {column.label}{' '}
                                {sortField === column.key &&
                                    (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            {columns.map((column) => (
                                <TableCell key={column.key as string}>
                                    {String(item[column.key])}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
                <div>
                    Показано {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, totalItems)} из{' '}
                    {totalItems}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onPageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {startPage > 1 && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(1)}
                            >
                                1
                            </Button>
                            {startPage > 2 && <span>...</span>}
                        </>
                    )}
                    {pageNumbers.map((number) => (
                        <Button
                            key={number}
                            variant={
                                currentPage === number ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => onPageChange(number)}
                        >
                            {number}
                        </Button>
                    ))}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span>...</span>}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(totalPages)}
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}
