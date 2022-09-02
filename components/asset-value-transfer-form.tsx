import React, { useState } from 'react';
import { Asset, AssetValue } from '../types';
import moment from 'moment';

type Props = {
    assets: Asset[]
    onSubmit: Function
}

const AssetValueTransferForm = ({ assets, onSubmit }: Props) => {
    const empty = {
        assetId:'none',
        quantity:0,
        value:0,
        invested:0,
        createdOn:moment().unix()
    }

    const [fromAssetValue, setFromAssetValue] = useState<AssetValue>(empty);
    const [toAssetValue, setToAssetValue] = useState<AssetValue>(empty);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(fromAssetValue, toAssetValue);
        event.preventDefault();
    }

    const handleChangeFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.name;
        const value = event.target.value;
        const newAssetValue = { ...fromAssetValue, [id]: value };
        if(id === 'fromQuantity') {
            const asset = assets.find(a => a.id == newAssetValue.assetId) as Asset;
            const diffQuantity = parseFloat(value) || 0;
            newAssetValue.quantity = parseFloat(asset.lastQuantity+'') - diffQuantity;
            newAssetValue.invested = parseFloat(asset.lastInvested+'') - (diffQuantity * newAssetValue.value);
            setFromAssetValue(newAssetValue);
        } else {
            setFromAssetValue(newAssetValue);
        }
    }

    const handleChangeAssetFrom = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        if(value == 'none') {
            setFromAssetValue(empty);
            return;
        }
        const asset = assets.find(a => a.id == value) as Asset;
        setFromAssetValue({
            ...fromAssetValue,
            assetId: value,
            invested: asset.lastInvested,
            quantity: asset.lastQuantity,
            value: asset.lastValue
        });
    }

    const handleChangeTo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.name;
        const value = event.target.value;
        const newAssetValue = { ...toAssetValue, [id]: value };
        if(id === 'toQuantity') {
            const asset = assets.find(a => a.id == newAssetValue.assetId) as Asset;
            const diffQuantity = parseFloat(value) || 0;
            newAssetValue.quantity = parseFloat(asset.lastQuantity+'') + diffQuantity;
            newAssetValue.invested = parseFloat(asset.lastInvested+'') + (diffQuantity * newAssetValue.value);
            setToAssetValue(newAssetValue);
        } else {
            setToAssetValue(newAssetValue);
        }
    }

    const handleChangeAssetTo = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        if(value == 'none') {
            setToAssetValue(empty);
            return;
        }
        const asset = assets.find(a => a.id == value) as Asset;
        setToAssetValue({
            ...toAssetValue,
            assetId: value,
            invested: asset.lastInvested,
            quantity: asset.lastQuantity,
            value: asset.lastValue
        });
    }

    const formatDate = (date: number) => date && moment.unix(date).format('YYYY-MM-DD');

    const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = parseInt(moment().format('X'));
        setFromAssetValue({ ...fromAssetValue, [id]: value });
        setToAssetValue({ ...toAssetValue, [id]: value });
    }

    return (
        <div className="row">
            <div className="col-12">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="assetFrom" className="form-label">From Asset</label>
                                <select className="form-select" name="assetId" onChange={handleChangeAssetFrom}>
                                    <option key='none' value='none'></option>
                                    {assets && assets.filter(a => a.id != toAssetValue?.assetId).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-5">
                                <label htmlFor="fromQuantity" className="form-label">Quantity Sold</label>
                                <input type="text" className="form-control" onChange={handleChangeFrom} name="fromQuantity"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="invested" className="form-label">Invested</label>
                                <input type="text" className="form-control" onChange={handleChangeFrom} name="invested" value={fromAssetValue?.invested} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="quantity" className="form-label">Quantity</label>
                                <input type="text" className="form-control" onChange={handleChangeFrom} name="quantity" value={fromAssetValue?.quantity} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="value" className="form-label">Value</label>
                                <input type="text" className="form-control" onChange={handleChangeFrom} name="value" value={fromAssetValue?.value} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="assetFrom" className="form-label">To Asset</label>
                                <select className="form-select" name="assetId" onChange={handleChangeAssetTo}>
                                    <option key='none' value='none'></option>
                                    {assets && assets.filter(a => a.id != fromAssetValue?.assetId).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-5">
                                <label htmlFor="toQuantity" className="form-label">Quantity Bought</label>
                                <input type="text" className="form-control" onChange={handleChangeTo} name="toQuantity"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="invested" className="form-label">Invested</label>
                                <input type="text" className="form-control" onChange={handleChangeTo} name="invested" value={toAssetValue?.invested} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="quantity" className="form-label">Quantity</label>
                                <input type="text" className="form-control" onChange={handleChangeTo} name="quantity" value={toAssetValue?.quantity} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="value" className="form-label">Value</label>
                                <input type="text" className="form-control" onChange={handleChangeTo} name="value" value={toAssetValue?.value} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="mb-3">
                                <label htmlFor="date" className="form-label">Date</label>
                                <input type="text" className="form-control" onChange={handleChangeDate} id="createdOn" defaultValue={formatDate(moment().unix())} />
                            </div>
                            <div className="mb-3 text-center">
                                <button type="submit" disabled={fromAssetValue.assetId == 'none' || toAssetValue.assetId == 'none'} className="mt-4 btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetValueTransferForm;
