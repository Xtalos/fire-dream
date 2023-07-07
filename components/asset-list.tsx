/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import Link from 'next/link';
import React, { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import { Asset, AssetValue } from '../types';
import AssetValueForm from './asset-value-form';
import { formatRatio, formatRisk, formatValue, toPieData } from '../util/helpers';
import Pie from './charts/pie';

type Props = {
    assets: Asset[]
    onSubmit: Function
    walletId: string
    updateQuotes: Function
    assetsValues: any
}

const AssetList = ({ assets, onSubmit, walletId, updateQuotes, assetsValues }: Props) => {
    const [assetValue, setAssetValue] = useState<AssetValue | null>(null);
    const [assetTarget, setAssetTarget] = useState<Asset | null>(null);
    const [assetTicker, setAssetTicker] = useState<Asset | null>(null);
    const [showHiddenAssets, setShowHiddenAssets] = useState<boolean>(false);

    const changeAssetValueHandler = (asset: Asset) => {
        setAssetValue({
            assetId: asset.id,
            quantity: asset.lastQuantity,
            value: asset.lastValue,
            invested: asset.lastInvested,
            createdOn: parseInt(moment().format('X'))
        })
    }

    const handleSubmit = (av: AssetValue) => {
        onSubmit(av);
        setAssetValue(null);
    }

    assets = assets.filter(a => showHiddenAssets || a.hidden !== true);
    console.log(JSON.stringify(assets));
    return (
        assetsValues && <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row">
                    {assets.length &&
                        <div className="col-6 d-flex flex-row">
                            <a className="mb-5 btn btn-lg btn-dark" onClick={() => updateQuotes(assets)}>Update Quotes</a>
                        </div>
                    }
                    <div className={assets.length ? "col-6 d-flex flex-row-reverse" : "col-12 mt-5 text-center"} >
                        <a className="mb-5 btn btn-lg btn-dark" href={"/asset/new?wallet=" + walletId}>
                            Create Asset
                        </a>
                    </div>
                </div>
                {parseInt(assetsValues.get('total').targetRatio + '') != 1 &&
                    <Alert variant='danger'>
                        Total Target Ratio is {formatRatio(assetsValues.get('total').targetRatio)}
                    </Alert>
                }
                <div className="row mt-5">
                    <div className="col-12 d-flex flex-row-reverse">
                        <Form.Check
                            onChange={() => setShowHiddenAssets(!showHiddenAssets)}
                            type="switch"
                            label="Show hidden assets"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group mb-5">
                            <li className="list-group-item bg-dark text-white" key="header">
                                <div className="row d-none d-sm-flex">
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Asset</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Risk</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Invested</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Value</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Ratio</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Target</div>
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">Actions</div>
                                </div>
                            </li>
                            {assets.sort((a, b) => assetsValues.get(b.id).value - assetsValues.get(a.id).value).map(asset => {
                                return (
                                    <li className={ asset.category !== 'liquidity' && 
                                    Math.abs(parseFloat(formatValue(assetsValues.get(asset.id).value - assetsValues.get('total').value * asset.targetRatio))) > (asset.minQuantity ?? asset.lastValue*1.1) 
                                    ? (parseFloat(formatValue(assetsValues.get(asset.id).value - assetsValues.get('total').value * asset.targetRatio)) > 0
                                    ? "list-group-item list-group-item-rebalance-down" : "list-group-item list-group-item-rebalance-up") 
                                    : "list-group-item" } key={asset.id}>
                                        <div className="row">
                                            <div onClick={() => setAssetTicker(asset)} role="button" className="col-sm-2 p-2 p-lg-2 text-center d-flex flex-column"><div>{asset.name}</div><small>{asset.platform}</small></div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Risk</div> {formatRisk(assetsValues.get(asset.id).globalRisk)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Invested</div> {formatValue(asset.lastInvested)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Value</div> {formatValue(assetsValues.get(asset.id).value)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Ratio</div> {formatRatio(assetsValues.get(asset.id).ratio)}</div>
                                            <div onClick={() => setAssetTarget(asset)} role="button" className="col-sm-1 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Target</div> {formatRatio(asset.targetRatio)}</div>
                                            <div className="col-sm-3 align-self-center">
                                                <div className="row">
                                                    <div className="col text-center">
                                                        <a href={"/asset/" + asset.id + "?wallet=" + walletId}>
                                                                <img
                                                                    title="edit"
                                                                    alt="edit"
                                                                    src="/edit.svg"
                                                                    width="30"
                                                                    height="30"
                                                                    className="m-2"
                                                                />
                                                        </a>
                                                    </div>
                                                    <div className="col text-center">
                                                        <a role="button" onClick={() => changeAssetValueHandler(asset)}>
                                                            <img
                                                                title="value"
                                                                alt="value"
                                                                src="/edit-value.svg"
                                                                width="30"
                                                                height="30"
                                                                className="m-2"
                                                            />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }
                            )}
                            <li className="list-group-item bg-dark text-white" key="totalKey">
                                <div className="row">
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">TOTAL</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center"><div className="d-sm-none">Risk</div> {formatRisk(assetsValues.get('total').globalRisk)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center"><div className="d-sm-none">Invested</div> {formatValue(assetsValues.get('total').invested)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center"><div className="d-sm-none">Value</div> {formatValue(assetsValues.get('total').value)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">&#916; = {formatRatio(assetsValues.get('total').value / assetsValues.get('total').invested - 1)} %</div>
                                </div>
                            </li>
                        </ul>
                        {assetValue &&
                            <Modal show={true} onHide={() => setAssetValue(null)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Asset Value</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <AssetValueForm assetValue={assetValue} onSubmit={handleSubmit} />
                                </Modal.Body>
                            </Modal>}
                        {assetTarget &&
                            <Modal show={true} onHide={() => setAssetTarget(null)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Asset Target</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="mt-2 text-center">
                                        <h6>{assetTarget.name}</h6>
                                    </div>
                                    <div className="mt-2 text-center">
                                        &#916; value  =  {formatValue(assetsValues.get(assetTarget.id).value - assetsValues.get('total').value * assetTarget.targetRatio)}
                                    </div>
                                    <div className="mt-2 text-center">
                                        &#916; quotes  =  {assetTarget.lastQuantity - assetTarget.lastQuantity * assetTarget.targetRatio / assetsValues.get(assetTarget.id).ratio}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button className="btn btn-lg btn-dark" onClick={() => setAssetTarget(null)}>OK</button>
                                    </div>
                                </Modal.Body>
                            </Modal>}
                        {assetTicker &&
                            <Modal show={true} onHide={() => setAssetTarget(null)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Asset Target</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="mt-2 text-center">
                                        <h6>{assetTicker.name}</h6>
                                    </div>
                                    <div className="mt-2 text-center">
                                        Symbol  =  <a href={"https://finance.yahoo.com/quote/"+assetTicker.symbol+"?p="+assetTicker.symbol+"&.tsrc=fin-srch"}
                                            target="_blank"
                                            rel="noopener noreferrer">{assetTicker.symbol}</a>
                                    </div>
                                    <div className="mt-2 text-center">
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button className="btn btn-lg btn-dark" onClick={() => setAssetTicker(null)}>OK</button>
                                    </div>
                                </Modal.Body>
                            </Modal>}
                    </div>
                </div>
                <div className="row mb-5">
                    <div className="col-md-6">
                        <Pie data={toPieData(assets, 'name', 'targetRatio')} graphId='targetComposition' title='Target Composition' />
                    </div>
                    <div className="mt-5 mt-md-0 col-md-6">
                        <Pie data={toPieData(assets, 'name')} graphId='assetsComposition' title='Assets Composition' />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetList;
