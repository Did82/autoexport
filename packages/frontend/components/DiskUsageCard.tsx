import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';
import { ConfigWithPath, DiskUsage } from '@/types/types';
import { FolderOpen, HardDrive } from 'lucide-react';

export function DiskUsageCard({
    title,
    usage,
    config,
}: {
    title: string;
    usage: DiskUsage;
    config: ConfigWithPath;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row justify-between space-y-0">
                <CardTitle className="flex items-center text-2xl">
                    <HardDrive className="mr-2" />
                    {title}
                </CardTitle>
                <CardDescription className="flex items-center">
                    <FolderOpen className="mr-1 h-4 w-4" /> {config.path}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <div className="text-3xl font-bold">
                            {usage?.percentage?.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {`лимит ${config.limit}%`}
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground self-end">
                        {formatBytes(usage?.used)} / {formatBytes(usage?.total)}
                    </div>
                </div>
                <Progress value={usage?.percentage} className="h-2 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm font-medium">
                            Самая старая папка
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                            <FolderOpen className="mr-1 h-4 w-4" />
                            {usage?.oldestFolder}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium">
                            Самая новая папка
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                            <FolderOpen className="mr-1 h-4 w-4" />
                            {usage?.newestFolder}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
