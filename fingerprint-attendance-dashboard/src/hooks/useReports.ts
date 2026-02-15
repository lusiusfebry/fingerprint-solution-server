import { useState, useEffect, useCallback } from 'react';
import { reportsService } from '@/services/reports.service';
import { AttendanceTrendData, AbsenceBreakdownData, Latecomer, MonthlyStats } from '@/types/reports.types';
import toast from 'react-hot-toast';

export function useReports() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const [trends, setTrends] = useState<AttendanceTrendData[]>([]);
    const [breakdown, setBreakdown] = useState<AbsenceBreakdownData[]>([]);
    const [leaderboard, setLeaderboard] = useState<Latecomer[]>([]);
    const [stats, setStats] = useState<MonthlyStats | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const m = month.toString();
            const y = year.toString();

            const [trendsData, breakdownData, leaderboardData, statsData] = await Promise.all([
                reportsService.getAttendanceTrends(m, y),
                reportsService.getAbsenceBreakdown(m, y),
                reportsService.getLatecomersLeaderboard(m, y),
                reportsService.getMonthlyStats(m, y)
            ]);

            setTrends(trendsData);
            setBreakdown(breakdownData);
            setLeaderboard(leaderboardData);
            setStats(statsData);
        } catch (err) {
            console.error(err);
            // toast.error('Failed to fetch reports data'); // Optional: suppress if API not ready
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const exportReport = async () => {
        try {
            const blob = await reportsService.exportMonthlyReport(month.toString(), year.toString());
            return blob;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        month,
        setMonth,
        year,
        setYear,
        loading,
        trends,
        breakdown,
        leaderboard,
        stats,
        exportReport,
        refresh: fetchData
    };
}
