import React, { useEffect } from 'react';

export type BasicData = {
  name: string
  value: number
}
type Props = {
  data: BasicData[]
}

const Pie = ({ data }: Props) => {
  useEffect(() => {
    const columns = data.reduce((acc:any[],d) => [...acc,[d.name,d.value]],[]);
    import('c3').then(c3 => {
      c3.generate({
        bindto: "#chart",
        data: {
          columns,
          type: 'pie'
        },
      });
    })
  }, [data]);


  return (
    <div className="row">
      <div className="col-12 overflow-auto">
        <div id="chart" />
      </div>
    </div>
  );
}

export default Pie;
