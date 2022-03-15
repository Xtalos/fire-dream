import React, { useEffect } from 'react';

export type BasicData = {
  name: string
  value: number
}
type Props = {
  data: any[],
  graphId: string,
  title: string
}

const TimeSeriesChart = ({ data, graphId, title }: Props) => {
  useEffect(() => {
    //const columns = data.reduce((acc: any[], d) => [...acc, [d.name, d.value]], []);
    import('c3').then(c3 => {
      c3.generate({
        bindto: "#" + graphId,
        data: {
          x: 'x',
          //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
          columns: data
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%Y-%m-%d'
            }
          }
        }
      });
    })
  }, [data]);


  return (
    <div className="row">
      <div className="col-12 overflow-auto">
        <div className="text-center"><h5>{title}</h5></div>
        <div id={graphId} />
      </div>
    </div>
  );
}

export default TimeSeriesChart;