import React from 'react';
import { AssetValue,Time } from '../types';
import moment from 'moment';

type Props = {
    assetValue: AssetValue
    onSubmit: Function
}

const AssetValueForm = ({ assetValue,onSubmit }: Props) => {
    let newAssetValue = assetValue;

    const handleSubmit = (event:React.FormEvent<HTMLFormElement>) => {
        onSubmit(newAssetValue);
        event.preventDefault();
    }

    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        newAssetValue = {...newAssetValue, [id]: value};
      }
    
    const formatDate = (date:Time) => date && moment.unix(date.seconds).format('YYYY-MM-DD');

    const handleChangeDate = (event:React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = moment(event.target.value).format('X');
        newAssetValue = {...newAssetValue, [id]: { seconds:value }};
      }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <form onSubmit={handleSubmit}>
                    <input type="hidden" required onChange={handleChange} id="assetId" defaultValue={assetValue?.assetId}/>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Quantity</label>
                        <input type="text" className="form-control" onChange={handleChange} id="quantity" defaultValue={assetValue?.quantity}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="category" className="form-label">Value</label>
                        <input type="text" className="form-control" onChange={handleChange} id="value" defaultValue={assetValue?.value}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="symbol" className="form-label">Date</label>
                        <input type="text" className="form-control" onChange={handleChangeDate} id="createdOn" defaultValue={formatDate(assetValue?.createdOn)}/>
                    </div>
                    <div className="mb-3 text-center">
                        <button type="submit" className="mt-4 btn btn-lg btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetValueForm;
