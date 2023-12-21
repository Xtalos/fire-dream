import React, { useEffect } from 'react';

export type BasicData = {
  name: string
  value: number
}
type Props = {
  data: BasicData[],
  graphId: string,
  title: string,
  format?: Function
}

const Pie = ({ data, graphId, title, format }: Props) => {
  console.log(data,title);
  useEffect(() => {
    const columns = data.reduce((acc: any[], d) => [...acc, [d.name, d.value]], []);
    import('c3').then(c3 => {
      c3.generate({
        bindto: "#" + graphId,
        data: {
          columns,
          type: 'pie'
        },
        pie: format ? {
          label: {
            format: function (value, ratio, id) {
              return format(value);
            }
          }
        } : {}
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

export default Pie;
