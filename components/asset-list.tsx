/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import Link from 'next/link';
import React, { useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import { Asset, AssetValue } from '../types';
import AssetValueForm from './asset-value-form';
import { formatRatio, formatRisk, formatValue } from '../util/helpers';

type Props = {
    assets: Asset[]
    onSubmit: Function
    walletId: string
    updateQuotes: Function
    assetsValues: any
}

const AssetList = ({ assets, onSubmit, walletId, updateQuotes, assetsValues }: Props) => {
    const [assetValue, setAssetValue] = useState<AssetValue | null>(null);

    const changeAssetValueHandler = (asset: Asset) => {
        setAssetValue({
            assetId: asset.id,
            quantity: 0,
            value: 0,
            createdOn: { seconds: parseInt(moment().format('X')) }
        })
    }

    const handleSubmit = (av: AssetValue) => {
        onSubmit(av);
        setAssetValue(null);
    }

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
                        <Link href={"/asset/new?wallet=" + walletId}>
                            <a className="mb-5 btn btn-lg btn-dark" >Create Asset</a>
                        </Link>
                    </div>
                </div>
                {assetsValues.get('total').totalTargetRatio != 1 &&
                    <Alert variant='danger'>
                        Total Target Ratio is {formatRatio(assetsValues.get('total').totalTargetRatio)}
                    </Alert>
                }
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group mb-5">
                            <li className="list-group-item bg-dark text-white" key="header">
                                <div className="row">
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Asset</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Risk</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Invested</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Value</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Ratio</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Target</div>
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">Actions</div>
                                </div>
                            </li>
                            {assets.map(asset => {
                                return (
                                    <li className="list-group-item" key={asset.id}>
                                        <div className="row">
                                            <div className="col-sm-2 p-2 p-lg-2 text-center d-flex flex-column"><div>{asset.name}</div><small>{asset.platform}</small></div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center">{formatRisk(assetsValues.get(asset.id).globalRisk)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center">{formatValue(asset.invested)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center">{formatValue(assetsValues.get(asset.id).value)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center">{formatRatio(assetsValues.get(asset.id).ratio)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center">{formatRatio(asset.targetRatio)}</div>
                                            <div className="col-sm-3 align-self-center">
                                                <div className="row">
                                                    <div className="col text-center">
                                                        <Link href={"/asset/" + asset.id + "?wallet=" + walletId}>
                                                            <a>
                                                                <img
                                                                    title="edit"
                                                                    alt="edit"
                                                                    src="/edit.svg"
                                                                    width="30"
                                                                    height="30"
                                                                    className="m-2"
                                                                />
                                                            </a>
                                                        </Link>
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
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">{formatRisk(assetsValues.get('total').globalRisk)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">{formatValue(assetsValues.get('total').invested)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">{formatValue(assetsValues.get('total').value)}</div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssetList;
