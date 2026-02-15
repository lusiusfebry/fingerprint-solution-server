import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Latecomer {
    rank: number;
    employee_id: string;
    employee_name: string;
    department: string;
    last_incident: string;
    total_late_minutes: number;
    incident_count: number;
}

interface LatecomersLeaderboardProps {
    data: Latecomer[];
    isLoading: boolean;
    period: string;
}

export const LatecomersLeaderboard: React.FC<LatecomersLeaderboardProps> = ({ data, isLoading, period }) => {
    if (isLoading) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Loading leaderboard...</div>;
    }

    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">No late incidents recorded for {period}.</div>;
    }

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        if (rank === 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
        if (rank === 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Minutes</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item) => (
                        <tr key={item.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getRankColor(item.rank)}`}>
                                    {item.rank}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                                        {item.employee_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.employee_name}</span>
                                        <span className="text-xs text-gray-500">Last: {new Date(item.last_incident).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-gray-500">{item.department}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {item.incident_count} times
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-red-600 dark:text-red-400">
                                {item.total_late_minutes}m
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
