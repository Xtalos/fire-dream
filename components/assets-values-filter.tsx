/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import React from 'react';

type Props = {
    filter?: { start?: string, end?: string }
    onFilter: Function
}

const AssetsValuesFilter = ({ filter, onFilter }: Props) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id as 'start' | 'end';
        const value = event.target.value || moment().format('YYYY-MM-DD');
        filter = { ...filter, [id]: value };
    }

    const handleFilterClick = () => {
        onFilter(filter);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row">
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="start" className="form-label">Start Date</label>
                            <input type="text" className="form-control" onChange={handleChange} id="start" defaultValue={filter?.start} />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="end" className="form-label">End Date</label>
                            <input type="text" className="form-control" onChange={handleChange} id="end" defaultValue={filter?.end} />
                        </div>
                    </div>
                    <div className="col-md-4 d-flex align-items-end pb-3">
                            <a className="btn btn-dark w-100" onClick={handleFilterClick}>Filter</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetsValuesFilter;
