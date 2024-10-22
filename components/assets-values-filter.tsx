/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import React from 'react';
import { Asset } from '../types';

type Props = {
    filter?: { start?: string, end?: string, assetSelected?:string }
    onFilter: Function
    assets: Asset[]
}

const AssetsValuesFilter = ({ filter, onFilter, assets }: Props) => {

    const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id as 'start' | 'end';
        const momentValue = moment(event.target.value);
        if (!momentValue.isValid()) return;
        const value = momentValue.format('YYYY-MM-DD');
        filter = { ...filter, [id]: value };
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const id = event.target.id;
        const value = event.target.value;
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
                        <label htmlFor="start" className="form-label">Start Date</label>
                        <input type="date" className="form-control" onChange={handleChangeDate} id="start" defaultValue={filter?.start} />
                    </div>
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="end" className="form-label">End Date</label>
                            <input type="date" className="form-control" onChange={handleChangeDate} id="end" defaultValue={filter?.end} />
                        </div>
                    </div>
                    <div className="col-md-4 d-flex align-items-end pb-3">
                        <a className="btn btn-dark w-100" onClick={handleFilterClick}>Filter</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className="mb-3">
                            <label htmlFor="assetSelected" className="form-label">Filter Asset</label>
                            <select className="form-control" onChange={handleChange} id="assetSelected" >
                                <option value={undefined} key={0}></option>
                                { assets.map(asset => <option value={asset.id} key={asset.id}>{asset.name}</option>)} 
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetsValuesFilter;
