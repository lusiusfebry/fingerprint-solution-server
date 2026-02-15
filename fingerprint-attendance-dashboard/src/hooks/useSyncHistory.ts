import { useState, useEffect, useCallback } from 'react';
import { syncHistoryService, SyncHistory } from '@/services/sync-history.service';

export function useSyncHistory() {
    const [history, setHistory] = useState<SyncHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await syncHistoryService.getRecentSyncs();
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, fetchHistory };
}
