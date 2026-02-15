import { AttendanceLog, AttendanceSummary, AttendanceFilters } from '@/types/attendance.types';
import { format } from 'date-fns';

interface PrintableAttendanceReportProps {
    logs: AttendanceLog[];
    summary: AttendanceSummary | null;
    startDate: string;
    endDate: string;
    filters: AttendanceFilters;
}

export const PrintableAttendanceReport = forwardRef<HTMLDivElement, PrintableAttendanceReportProps>(
    ({ logs, summary, startDate, endDate, filters }, ref) => {
        return (
            <div ref={ref} className="p-8 bg-white text-black print:text-black">
                {/* Header */}
                <div className="border-b border-gray-300 pb-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {/* Placeholder Logo */}
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                LOGO
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">PT Prima Sarana Gemilang</h1>
                                <p className="text-sm text-gray-600">Attendance Report</p>
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-medium">Period:</p>
                            <p>{startDate || 'All Time'} - {endDate || 'Present'}</p>
                            <p className="text-xs text-gray-500 mt-1">Generated on: {format(new Date(), 'PPpp')}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Applied Info */}
                <div className="mb-6 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="font-semibold">Filters: </span>
                    {filters.department !== 'all' && <span className="mr-3">Dept: {filters.department}</span>}
                    {filters.device !== 'all' && <span className="mr-3">Device: {filters.device}</span>}
                    {filters.status !== 'all' && <span className="mr-3">Status: {filters.status}</span>}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="border p-3 rounded text-center">
                        <p className="text-xs text-gray-500 uppercase">Present</p>
                        <p className="text-xl font-bold text-green-600">{summary?.present_count || 0}</p>
                    </div>
                    <div className="border p-3 rounded text-center">
                        <p className="text-xs text-gray-500 uppercase">Late</p>
                        <p className="text-xl font-bold text-amber-600">{summary?.late_count || 0}</p>
                    </div>
                    <div className="border p-3 rounded text-center">
                        <p className="text-xs text-gray-500 uppercase">Absent</p>
                        <p className="text-xl font-bold text-red-600">{summary?.absent_count || 0}</p>
                    </div>
                    <div className="border p-3 rounded text-center">
                        <p className="text-xs text-gray-500 uppercase">Rate</p>
                        <p className="text-xl font-bold text-blue-600">{summary?.attendance_rate || 0}%</p>
                    </div>
                </div>

                {/* Table */}
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Time</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Employee</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Dept</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Location</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.slice(0, 100).map((log) => ( // Limit rows for print safety
                            <tr key={log.id}>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="font-medium">{log.employee_name}</div>
                                    <div className="text-xs text-gray-500">{log.employee_nik}</div>
                                </td>
                                <td className="px-3 py-2">{log.department || '-'}</td>
                                <td className="px-3 py-2 text-xs">{log.device_location}</td>
                                <td className="px-3 py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                                        ${log.status === 'present' ? 'bg-green-100 text-green-800' :
                                            log.status === 'late' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length > 100 && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                        * Report limited to first 100 records for printing efficiency. Export to Excel for full data.
                    </p>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between text-xs text-gray-500">
                    <div>
                        <p>Approved By:</p>
                        <div className="h-16 w-32 border-b border-gray-400 mt-2"></div>
                    </div>
                    <div>
                        <p>Page 1 of 1</p>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableAttendanceReport.displayName = 'PrintableAttendanceReport';
