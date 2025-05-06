import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import styles from './Table.module.css';

interface SparklineChartProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

const SparklineChart = ({
    data,
    width = 180,
    height = 60,
    color = '#8884d8'
                        }: SparklineChartProps) => {
    if (!data || data.length === 0) return null;

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;

    const enhancedData = range > 0
        ? data.map(value => ((value - minValue) / range) * 100)
        : new Array(data.length).fill(50);

    const chartData = enhancedData.map((value, index) => ({
        value,
        index,
        originalValue: data[index].toFixed(4)
    }));

    const renderTooltipContent: TooltipProps<number, string>['content'] = (data) => {
        if (!data?.payload?.[0]) return null;
        const item = data.payload[0].payload;
        return (
            <div className={styles.tooltip}>
                {`$${item.originalValue}`}
            </div>
        );
    };

    return (
        <ResponsiveContainer width={width} height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Tooltip content={renderTooltipContent} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SparklineChart;