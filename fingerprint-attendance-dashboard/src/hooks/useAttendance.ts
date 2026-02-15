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

    // Sorting State
    const [sortBy, setSortBy] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
            sortBy,
            sortOrder
        };

        if (debouncedSearch) filters.search = debouncedSearch;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (department && department !== 'all') filters.department = department;
        if (device && device !== 'all') filters.device = device;
        if (status && status !== 'all') filters.status = status;

        return filters;
    }, [currentPage, debouncedSearch, startDate, endDate, department, device, status, sortBy, sortOrder]);

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
        // Only update if on first page
        if (currentPage !== 1) return;

        // Check if log matches current filters
        if (debouncedSearch && !newLog.employee_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) return;
        if (department !== 'all' && newLog.department !== department) return;
        if (device !== 'all' && newLog.device_name !== device) return; // Assuming device filter matches name or needs ID check. Using simple equality for now.
        if (status !== 'all' && newLog.status !== status) return;

        // Date check (if start/end date are set)
        const logDate = new Date(newLog.timestamp);
        if (startDate && logDate < new Date(startDate)) return;
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (logDate > end) return;
        }

        setLogs(prev => [newLog, ...prev.slice(0, 9)]);
        fetchSummary(); // Refresh summary on new log
    });

    const resetFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        setDepartment('all');
        setDevice('all');
        setStatus('all');
        setSortBy('timestamp');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            const filters = getFilters();
            // Remove pagination for export to get all data
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { page, limit, ...exportFilters } = filters;
            const blob = await attendanceService.exportToExcel(exportFilters);
            return blob;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleSort = (column: string, direction: 'asc' | 'desc') => {
        setSortBy(column);
        setSortOrder(direction);
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
            status,
            sortBy,
            sortOrder
        },
        setSearch,
        setStartDate,
        setEndDate,
        setDepartment,
        setDevice,
        setStatus,
        setSortBy,
        setSortOrder,
        handleSort,
        resetFilters,
        fetchLogs,
        fetchSummary,
        exportToExcel: handleExport
    };
}
