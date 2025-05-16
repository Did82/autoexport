'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DirPickerSelect({
    value,
    onChange,
    dirs,
    root,
    label,
    name,
}: {
    value: string;
    onChange: (v: string) => void;
    dirs: string[];
    root: string;
    label: string;
    name: string;
}) {
    const selected = value.startsWith(root + '/')
        ? value.replace(root + '/', '')
        : '';
    return (
        <div>
            <label className="block mb-1">{label}</label>
            <Select
                value={selected}
                onValueChange={(v) => onChange(v ? `${root}/${v}` : '')}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent>
                    {dirs.map((dir) => (
                        <SelectItem key={dir} value={dir}>
                            {dir}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <input type="hidden" name={name} value={value} />
        </div>
    );
}

export function SettingsDialogButton({
    config,
    updateConfig,
    srcDirs,
    destDirs,
}: {
    config: any;
    updateConfig: (formData: FormData) => Promise<void>;
    srcDirs: string[];
    destDirs: string[];
}) {
    const srcRoot = '/mnt/ftp';
    const destRoot = '/mnt/smb';
    const [open, setOpen] = useState(false);
    const [src, setSrc] = useState(config?.src || '');
    const [dest, setDest] = useState(config?.dest || '');
    const [limit, setLimit] = useState(config?.limit || 78);
    const [concurrency, setConcurrency] = useState(config?.concurrency || 1);
    const [cleanupDays, setCleanupDays] = useState(config?.cleanupDays || 90);

    useEffect(() => {
        setSrc(config?.src || '');
        setDest(config?.dest || '');
        setLimit(config?.limit || 78);
        setConcurrency(config?.concurrency || 1);
        setCleanupDays(config?.cleanupDays || 90);
    }, [config, open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Настройки">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Настройки экспорта</DialogTitle>
                    <DialogDescription>
                        Укажите параметры экспорта и выберите папки.
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        await updateConfig(formData);
                        setOpen(false);
                    }}
                >
                    <div className="space-y-4 mb-4">
                        <DirPickerSelect
                            value={src}
                            onChange={setSrc}
                            dirs={srcDirs}
                            root={srcRoot}
                            label="Папка-источник"
                            name="src"
                        />
                        <DirPickerSelect
                            value={dest}
                            onChange={setDest}
                            dirs={destDirs}
                            root={destRoot}
                            label="Папка-назначение"
                            name="dest"
                        />
                        <div>
                            <label className="block mb-1">
                                Лимит диска (%)
                            </label>
                            <Slider
                                min={0}
                                max={100}
                                value={[limit]}
                                onValueChange={(v) => setLimit(v[0])}
                            />
                            <span>{limit}%</span>
                            <input type="hidden" name="limit" value={limit} />
                        </div>
                        <div>
                            <label className="block mb-1">Потоков</label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                disabled
                                defaultValue={1}
                                value={concurrency}
                                onChange={(e) =>
                                    setConcurrency(Number(e.target.value))
                                }
                                name="concurrency"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">
                                Дней хранения логов
                            </label>
                            <Slider
                                min={0}
                                max={365}
                                value={[cleanupDays]}
                                onValueChange={(v) => setCleanupDays(v[0])}
                            />
                            <span>{cleanupDays} дней</span>
                            <input
                                type="hidden"
                                name="cleanupDays"
                                value={cleanupDays}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Сохранить</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
