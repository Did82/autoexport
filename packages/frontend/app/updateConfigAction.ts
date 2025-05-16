'use server';

import { revalidatePath } from 'next/cache';

export async function updateConfigAction(formData: FormData) {
    const src = formData.get('src') as string;
    const dest = formData.get('dest') as string;
    const limit = Number(formData.get('limit'));
    const concurrency = Number(formData.get('concurrency'));
    const cleanupDays = Number(formData.get('cleanupDays'));

    await fetch('http://export:3001/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src, dest, limit, concurrency, cleanupDays }),
        cache: 'no-store',
    });

    revalidatePath('/');
}
