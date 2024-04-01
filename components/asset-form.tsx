import React, { FormEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { Asset, Config } from '../types';
import { formatValue } from '../util/helpers';

type Props = {
    asset: Asset
    config?: Config
    onSubmit: Function
    isNewAsset: boolean
}

const AssetForm = ({ asset, config, onSubmit, isNewAsset }: Props) => {
    let assetModified = asset;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(assetModified);
        event.preventDefault();
    }

    const getCategories = (): string[] => {
        try {
            const assetCategories = JSON.parse(config?.assetCategories ?? '');
            return Array.from(assetCategories);
        } catch (e) {
            return [];
        }
    }

    const getStockCategories = (): string[] => {
        try {
            const stockCategories = JSON.parse(config?.stockCategories ?? '');
            return Array.from(stockCategories);
        } catch (e) {
            return [];
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        console.log(event.target.id, event.target.value)
        const id = event.target.id;
        const value = event.target.value;
        console.log(event);
        assetModified = { ...assetModified, [id]: value };
    }

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.checked;
        assetModified = { ...assetModified, [id]: value };
        console.log(assetModified);
    }

    const calculatePE = (asset: Asset) => {
        return asset?.earnings ? formatValue(asset?.lastValue / asset?.earnings) : 'N/D';
    }

    const calculateDebtEquity = (asset: Asset) => {
        return asset?.equity ? formatValue(100*asset?.longTermDebt / asset?.equity) + ' %' : 'N/D';
    }

    const calculateDivYeld = (asset: Asset) => {
        return asset?.lastValue ? formatValue(100*asset?.dividend / asset?.lastValue) + ' %' : 'N/D';
    }

    console.log(asset?.stockCategory, asset?.category);
    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                { isNewAsset || asset ?
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
                                <select required className="form-control" onChange={handleChange} id="category" defaultValue={asset?.category}>
                                    <option></option>
                                    {getCategories().map(c => (<option key={c} value={c}>{c}</option>))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="symbol" className="form-label">Symbol</label>
                                <input type="text" className="form-control" onChange={handleChange} id="symbol" defaultValue={asset?.symbol} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="conversion" className="form-label">Conversion</label>
                                <input type="text" className="form-control" onChange={handleChange} id="conversion" defaultValue={asset?.conversion} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="minQuantity" className="form-label">Min Rebalance Value</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="minQuantity" defaultValue={asset?.minQuantity} />
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
                    {asset?.category == 'stocks' ? <div className="row mt-3">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <div className="">
                                    <div className="p-2">P/e = {calculatePE(asset)}</div>
                                    <div className="p-2">Debt/Equity = {calculateDebtEquity(asset)}</div>
                                    <div className="p-2">Div Yeld = {calculateDivYeld(asset)}</div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="stockCategory" className="form-label">Stock Category</label>
                                <select className="form-control" onChange={handleChange} id="stockCategory" defaultValue={asset?.stockCategory}>
                                    <option></option>
                                    {getStockCategories().map(sc => (<option key={sc} value={sc}>{sc}</option>))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="shares" className="form-label">Shares Quantity</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="shares" defaultValue={asset?.shares} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="earnings" className="form-label">EPS</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="earnings" defaultValue={asset?.earnings} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="expensesCategories" className="form-label">Story</label>
                                <textarea className="form-control" onChange={handleChange} rows={6} id="story" defaultValue={asset?.story} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="note" className="form-label">Note</label>
                                <textarea className="form-control" onChange={handleChange} rows={3} id="note" defaultValue={asset?.note} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="equity" className="form-label">Equity</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="equity" defaultValue={asset?.equity} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dividend" className="form-label">Dividend Per Share</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="dividend" defaultValue={asset?.dividend} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="longTermDebt" className="form-label">Long Term Debt</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="longTermDebt" defaultValue={asset?.longTermDebt} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="feedback" className="form-label">Feedback</label>
                                <textarea className="form-control" onChange={handleChange} rows={6} id="feedback" defaultValue={asset?.feedback} />
                            </div>
                        </div>
                    </div> : ''}
                    <div className="row">
                        <div className="col-12">
                            <div className="mt-5 mb-3 text-center">
                                <button type="submit" className="btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                    </div>
                </form> : <></>
                }
            </div>
        </div>
    );
}

export default AssetForm;
