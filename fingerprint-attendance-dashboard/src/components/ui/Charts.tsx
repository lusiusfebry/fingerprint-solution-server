import React from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface AttendanceTrendChartProps {
    data: Array<{ date: string; attendance: number; expected: number }>;
}

interface AbsenceBreakdownChartProps {
    data: Array<{ name: string; value: number; color: string }>;
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                    type="monotone"
                    dataKey="attendance"
                    name="Actual Attendance"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="expected"
                    name="Expected Attendance"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export const AbsenceBreakdownChart: React.FC<AbsenceBreakdownChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="relative h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-[60%] -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
            </div>
        </div>
    );
};
