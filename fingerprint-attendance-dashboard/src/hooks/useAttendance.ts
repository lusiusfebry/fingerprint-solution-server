import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '@/services/attendance.service';
import { AttendanceLog, AttendanceSummary, AttendanceFilters } from '@/types/attendance.types';
import { useAttendanceUpdates } from './useWebSocket';
import toast from 'react-hot-toast';

export function useAttendance() {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter States
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [department, setDepartment] = useState('all');
    const [device, setDevice] = useState('all');
    const [status, setStatus] = useState('all');

    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset page on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Build filters object
    const getFilters = useCallback((): AttendanceFilters => {
        const filters: AttendanceFilters = {
            page: currentPage,
            limit: 10,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };

        if (debouncedSearch) filters.search = debouncedSearch;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (department && department !== 'all') filters.department = department;
        if (device && device !== 'all') filters.device = device;
        if (status && status !== 'all') filters.status = status;

        return filters;
    }, [currentPage, debouncedSearch, startDate, endDate, department, device, status]);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const filters = getFilters();
            const data = await attendanceService.getAttendanceLogs(filters);
            setLogs(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.totalItems);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch attendance logs');
        } finally {
            setLoading(false);
        }
    }, [getFilters]);

    const fetchSummary = useCallback(async () => {
        try {
            const filters = getFilters();
            // Remove page/limit/sort for summary
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { page, limit, sortBy, sortOrder, ...summaryFilters } = filters;
            const data = await attendanceService.getAttendanceSummary(summaryFilters);
            setSummary(data);
        } catch (err) {
            console.error(err);
        }
    }, [getFilters]);

    // Reset page when other filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, department, device, status]);

    useEffect(() => {
        // Avoid double fetch on initial mount with strict mode, or rely on debouncedSearch
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Real-time updates
    useAttendanceUpdates((newLog: AttendanceLog) => {
        // Only update if on first page and filters match (simple text matching for now)
        if (currentPage === 1 && !debouncedSearch) {
            setLogs(prev => [newLog, ...prev.slice(0, 9)]);
            fetchSummary(); // Refresh summary on new log
        }
    });

    const resetFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setDepartment('all');
        setDevice('all');
        setStatus('all');
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            const filters = getFilters();
            const blob = await attendanceService.exportToExcel(filters);
            return blob;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        logs,
        loading,
        summary,
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            onPageChange: setCurrentPage
        },
        filters: {
            search,
            startDate,
            endDate,
            department,
            device,
            status
        },
        setSearch,
        setStartDate,
        setEndDate,
        setDepartment,
        setDevice,
        setStatus,
        resetFilters,
        fetchLogs,
        fetchSummary,
        exportToExcel: handleExport
    };
}
