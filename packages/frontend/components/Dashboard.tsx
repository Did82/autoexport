import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Config, CopyLog, DeleteLog, ErrorLog, SpaceData } from '@/types/types';
import { CopyLogsTab } from './CopyLogsTab';
import { DeleteLogsTab } from './DeleteLogsTab';
import { DiskUsageCard } from './DiskUsageCard';
import { ErrorLogsTab } from './ErrorLogsTab';
import { ModeToggle } from './ThemeToggle';

// const server = 'http://localhost:3001';
const server = 'http://export:3001';
// const server = 'http://backend:3001';
// const server = 'http://0.0.0.0:3001';

async function getSpaceData(): Promise<SpaceData | null> {
    try {
        const response = await fetch(`${server}/space`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Ошибка при получении данных о пространстве:', error);
        return null;
    }
}

async function getCopyLogs(): Promise<CopyLog[]> {
    try {
        const response = await fetch(`${server}/copy`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Ошибка при получении логов копирования:', error);
        return [];
    }
}

async function getDeleteLogs(): Promise<DeleteLog[]> {
    try {
        const response = await fetch(`${server}/delete`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Ошибка при получении логов удаления:', error);
        return [];
    }
}

async function getErrorLogs(): Promise<ErrorLog[]> {
    try {
        const response = await fetch(`${server}/errors`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Ошибка при получении логов ошибок:', error);
        return [];
    }
}

async function getConfig(): Promise<Config | null> {
    try {
        const response = await fetch(`${server}/config`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Ошибка при получении конфигурации:', error);
        return null;
    }
}

export async function Dashboard() {
    const space = getSpaceData();
    const copy = getCopyLogs();
    const del = getDeleteLogs();
    const conf = getConfig();
    const error = getErrorLogs();

    const [spaceData, config, copyLogs, deleteLogs, errorLogs] =
        await Promise.all([space, conf, copy, del, error]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Статус экспорта</h1>
                <ModeToggle />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {spaceData && config ? (
                    <>
                        <DiskUsageCard
                            title="Сервер"
                            usage={spaceData.srcDiskUsage}
                            config={{ path: config.src, limit: config.limit }}
                        />
                        <DiskUsageCard
                            title="Хранилище"
                            usage={spaceData.targetDiskUsage}
                            config={{ path: config.dest, limit: config.limit }}
                        />
                    </>
                ) : (
                    <div className="col-span-2 text-center p-4">
                        Ошибка при загрузке данных о дисковом пространстве
                    </div>
                )}
            </div>

            <Tabs defaultValue="copy" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="copy" className="hover:text-foreground">
                        Копирование
                    </TabsTrigger>
                    <TabsTrigger
                        value="delete"
                        className="hover:text-foreground"
                    >
                        Удаление
                    </TabsTrigger>
                    <TabsTrigger
                        value="errors"
                        className="hover:text-foreground"
                    >
                        Ошибки
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="copy">
                    <Card>
                        <CardHeader>
                            <CardTitle>Просмотр логов копирования</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {copyLogs.length > 0 ? (
                                <CopyLogsTab logs={copyLogs} />
                            ) : (
                                <div className="text-center">
                                    Нет логов копирования
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="delete">
                    <Card>
                        <CardHeader>
                            <CardTitle>Просмотр логов удаления</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deleteLogs.length > 0 ? (
                                <DeleteLogsTab logs={deleteLogs} />
                            ) : (
                                <div className="text-center">
                                    Нет логов удаления
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="errors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Просмотр логов ошибок</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {errorLogs.length > 0 ? (
                                <ErrorLogsTab logs={errorLogs} />
                            ) : (
                                <div className="text-center">
                                    Нет логов ошибок
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
