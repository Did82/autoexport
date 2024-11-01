'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { CopyLog } from '@/types/types';
import { formatBytes, formatDate, humanizeTime } from '@/lib/utils';
import { LogTable } from './LogTable';
import { ru } from 'date-fns/locale';

export function CopyLogsTab({ logs }: { logs: CopyLog[] }) {
    const [dirFilter, setDirFilter] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{
        field: keyof CopyLog;
        direction: 'asc' | 'desc';
    }>({ field: 'createdAt', direction: 'desc' });
    const itemsPerPage = 25;

    const filteredLogs = logs
        .filter(
            (log) =>
                log.copiedDir.toLowerCase().includes(dirFilter.toLowerCase()) &&
                (!dateFilter ||
                    new Date(log.createdAt).toDateString() ===
                        dateFilter.toDateString())
        )
        .sort((a, b) => {
            if (sort.direction === 'asc') {
                return a[sort.field] > b[sort.field] ? 1 : -1;
            } else {
                return a[sort.field] < b[sort.field] ? 1 : -1;
            }
        });

    const formatedLogs = filteredLogs.map((log) => ({
        ...log,
        createdAt: formatDate(log.createdAt),
        bytesCopied: formatBytes(log.bytesCopied),
        totalTime: humanizeTime(log.totalTime),
    }));

    const paginatedLogs = formatedLogs.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleSort = (field: keyof CopyLog) => {
        setSort((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
    };

    const columns: {
        key: keyof CopyLog;
        label: string;
    }[] = [
        { key: 'createdAt', label: 'Дата и время' },
        { key: 'copiedDir', label: 'Скопированная директория' },
        { key: 'filesCopied', label: 'Скопировано файлов' },
        { key: 'bytesCopied', label: 'Размер' },
        { key: 'totalTime', label: 'Общее время' },
    ];

    return (
        <>
            <div className="mb-4 flex space-x-2">
                <Input
                    placeholder="Фильтр по директории..."
                    value={dirFilter}
                    onChange={(e) => setDirFilter(e.target.value)}
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={`w-[280px] justify-start text-left font-normal ${
                                !dateFilter && 'text-muted-foreground'
                            }`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? (
                                format(dateFilter, 'PPP', { locale: ru })
                            ) : (
                                <span>Выберите дату</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            locale={ru}
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {dateFilter && (
                    <Button
                        variant="ghost"
                        onClick={() => setDateFilter(undefined)}
                        className="px-3"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Очистить дату</span>
                    </Button>
                )}
            </div>
            <LogTable
                data={paginatedLogs}
                columns={columns}
                currentPage={page}
                itemsPerPage={itemsPerPage}
                totalItems={filteredLogs.length}
                onPageChange={setPage}
                onSort={handleSort}
                sortField={sort.field}
                sortDirection={sort.direction}
            />
        </>
    );
}
