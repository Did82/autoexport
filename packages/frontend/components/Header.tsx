import { SettingsDialogButton } from './SettingsDialog';
import { ModeToggle } from './ThemeToggle';

export function Header({
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
    return (
        <div className="flex gap-2 items-center justify-end p-4">
            <SettingsDialogButton
                config={config}
                updateConfig={updateConfig}
                srcDirs={srcDirs}
                destDirs={destDirs}
            />
            <ModeToggle />
        </div>
    );
}
