/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Asset, AssetValue, Wallet } from '../types';
import AssetValueForm from './asset-value-form';
import { formatValue } from '../util/helpers';

type Props = {
    assets: Asset[]
    onSubmit: Function
    walletId: string
}

const AssetList = ({ assets, onSubmit, walletId }: Props) => {
    let totalValue = 0;
    let totalInvested = 0;
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
        <div className="row">
            <div className="col-10 offset-1">
                <div className="row">
                    <div className={ assets.length ? "col-12 d-flex flex-row-reverse" : "col-12 mt-5 text-center"} >
                        <Link href={"/asset/new?wallet="+walletId}>
                            <a className="mb-5 btn btn-lg btn-dark" >Create Asset</a>
                        </Link>
                    </div>
                </div>
                {assets.length ?
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            {assets.map(asset => {
                                const conversionAsset = asset.conversion == '1' ? false : assets.find(searched => searched.symbol == asset.conversion);
                                const conversion = conversionAsset ? conversionAsset.lastValue : 1;
                                totalValue += asset.lastValue * conversion;
                                totalInvested += asset.invested*1; //hack to avoid string conversion
                                return (
                                    <li className="list-group-item" key={asset.id}>
                                        <div className="row">
                                            <div className="col-3"><h5 className="p-2">{asset.name}</h5></div>
                                            <div className="col-2 p-2">{asset.invested}</div>
                                            <div className="col-3 p-2">{asset.lastQuantity}</div>
                                            <div className="col-2 p-2">{formatValue(asset.lastValue * conversion)}</div>
                                            <div className="col-1">
                                                <Link href={"/asset/" + asset.id + "?wallet=" + walletId}>
                                                    <a>
                                                        <img
                                                            alt=""
                                                            src="/edit.svg"
                                                            width="30"
                                                            height="30"
                                                            className="m-2"
                                                        />
                                                    </a>
                                                </Link>
                                            </div>
                                            <div className="col-1">
                                                <a role="button" onClick={() => changeAssetValueHandler(asset)}>
                                                    <img
                                                        alt=""
                                                        src="/edit-value.svg"
                                                        width="30"
                                                        height="30"
                                                        className="m-2"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }
                            )}
                            <li className="list-group-item bg-dark text-white" key="totalKey">
                                <div className="row">
                                    <div className="col-3"><h5 className="p-2">TOTAL</h5></div>
                                    <div className="col-2 p-2">{totalInvested}</div>
                                    <div className="col-3 p-2"></div>
                                    <div className="col-2 p-2">{formatValue(totalValue)}</div>
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
                : <></>
                }
            </div>
        </div>
    );
}

export default AssetList;
