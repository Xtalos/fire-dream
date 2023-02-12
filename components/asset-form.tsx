import React, { FormEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { Asset } from '../types';

type Props = {
    asset: Asset
    onSubmit: Function
}

const AssetForm = ({ asset, onSubmit }: Props) => {
    let assetModified = asset;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(assetModified);
        event.preventDefault();
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        console.log(event.target);
        assetModified = { ...assetModified, [id]: value };
    }

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.checked;
        assetModified = { ...assetModified, [id]: value };
        console.log(assetModified);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <form onSubmit={handleSubmit}>
                    <div className="row mt-5">
                        <div className="col-12">
                                <Form.Check
                                onChange={handleSwitchChange}
                                type="switch"
                                id="hidden"
                                label="Hidden"
                                defaultChecked={asset?.hidden}
                                />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text" className="form-control" onChange={handleChange} id="name" defaultValue={asset?.name} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="category" className="form-label">Category</label>
                                <input type="text" className="form-control" onChange={handleChange} id="category" defaultValue={asset?.category} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="symbol" className="form-label">Symbol</label>
                                <input type="text" className="form-control" onChange={handleChange} id="symbol" defaultValue={asset?.symbol} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="conversion" className="form-label">Conversion</label>
                                <input type="text" className="form-control" onChange={handleChange} id="conversion" defaultValue={asset?.conversion} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="platform" className="form-label">Platform</label>
                                <input type="text" className="form-control" onChange={handleChange} id="platform" defaultValue={asset?.platform} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="risk" className="form-label">Risk</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="risk" defaultValue={asset?.risk} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="currencyRisk" className="form-label">Currency Risk</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="currencyRisk" defaultValue={asset?.currencyRisk} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="platformRisk" className="form-label">Platform Risk</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="platformRisk" defaultValue={asset?.platformRisk} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="targetRatio" className="form-label">Target Ratio</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="targetRatio" defaultValue={asset?.targetRatio} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="mt-5 mb-3 text-center">
                                <button type="submit" className="btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetForm;
