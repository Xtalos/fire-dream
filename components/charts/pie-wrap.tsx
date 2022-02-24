/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

export type BasicData = {
  name: string
  value: number
}
type Props = {
  data: BasicData[]
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
  const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 1.05;
  const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
  const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" fontSize="10" textAnchor={x > props.cx ? 'start' : 'end'} dominantBaseline="central">
      {`${props.name} ${(props.percent * 100).toFixed(1)}%`}
    </text>
  );
};

const PieWrap = ({ data }: Props) => {

  return (
    <div className="row">
      <div className="col-12 overflow-auto">
        <PieChart width={500} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={'#' + Math.floor((3 + index) / (3 + data.length) * 16777215).toString(16)} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
}

export default PieWrap;
