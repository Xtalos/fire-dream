import { ChartConfiguration } from 'c3';
import React, { useEffect } from 'react';

export type BasicData = {
  name: string
  value: number
}
type Props = {
  data: any[],
  graphId: string,
  title: string,
  configOverride?: ChartConfiguration
}

const TimeSeriesChart = ({ data, graphId, title, configOverride }: Props) => {
  useEffect(() => {
    const container = document.getElementById(graphId) as HTMLElement;
    let mouseX: number, mouseY: number;
    const defaultConfiguration = {
      bindto: "#" + graphId,
      data: {
        x: 'x',
        //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
        columns: data
      },
      tooltip: {
        position: function (data, width, height, element) {
          var containerWidth, tooltipWidth, x, containerLeft;

          containerWidth = container.clientWidth;
          containerLeft = container.offsetLeft;
          tooltipWidth = container.querySelector('.c3-tooltip-container')?.clientWidth as number;
          x = mouseX + 50 - containerLeft;
          if (mouseX > (containerLeft + containerWidth / 2)) {
            x = mouseX - (containerLeft + width + 50);
          }

          return {
            top: 0,
            left: x
          };
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d'
          }
        }
      }
    };
    const config = {
      ...defaultConfiguration,
      ...configOverride
    } as ChartConfiguration
    container.onmousemove = event => { mouseX = event.clientX; mouseY = event.clientY; };
    //const columns = data.reduce((acc: any[], d) => [...acc, [d.name, d.value]], []);
    import('c3').then(c3 => {
      c3.generate(config);
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
