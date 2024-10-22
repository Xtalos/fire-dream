/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Asset, AssetValue } from '../types';
import { formatDate } from '../util/helpers';
import AssetValueForm from './asset-value-form';

type Props = {
    assets: Asset[]
    assetValues: AssetValue[]
    saveAssetValue: Function
    deleteAssetValue: Function
    assetSelected?: string
}

const AssetsValuesFormList = ({ assets, assetValues, saveAssetValue, deleteAssetValue, assetSelected }: Props) => {
    const assetMap = new Map<string,Asset>();
    assets.forEach(asset => assetMap.set(asset.id,asset));

    const [assetValue, setAssetValue] = useState<AssetValue | null>(null);

    const changeAssetValueHandler = (assetValue: AssetValue) => {
        setAssetValue(assetValue);
    }

    const deleteAssetValueHandler = async (assetValue: AssetValue) => {
        await deleteAssetValue(assetValue.id);
    }

    const handleSubmit = async (av: AssetValue) => {
        console.log(av);
        await saveAssetValue(av);
        setAssetValue(null);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            <li className="list-group-item bg-dark text-white" key="header">
                                <div className="row">
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Date</div>
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Asset</div>
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Invested</div>
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Quantity</div>
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Value</div>
                                    <div className="col-lg-2 p-1 p-lg-2 text-center">Action</div>
                                </div>
                            </li>
                            {assetValues.length ? assetValues.map(assetValue => {
                                let liClass = !assetSelected || assetValue.assetId == assetSelected ? 'list-group-item' : 'list-group-item d-none';
                                return (
                                    <li className={liClass} key={assetValue.id}>
                                        <div className="row">
                                            <div className="col-lg-2 p-1 p-lg-2 text-center">
                                                {formatDate(assetValue.createdOn)}
                                            </div>
                                            <div className="col-lg-2 p-2 p-lg-2 text-center d-flex flex-column">
                                                <div>{assetMap.get(assetValue.assetId || '')?.name}</div>
                                                <small>{assetMap.get(assetValue.assetId || '')?.platform}</small>
                                            </div>
                                            <div className="col-lg-2 p-1 p-lg-2 text-center">
                                                {assetValue.invested}
                                            </div>
                                            <div className="col-lg-2 p-1 p-lg-2 text-center">
                                            {assetValue.quantity}
                                            </div>
                                            <div className="col-lg-2 p-1 p-lg-2 text-center">
                                            {assetValue.value}
                                            </div>
                                            <div className="col-lg-2 p-1 p-lg-2 text-center">
                                                <div className="row">
                                                    <div className="col">
                                                    <a role="button" onClick={() => changeAssetValueHandler(assetValue)}>
                                                            <img
                                                                title="value"
                                                                alt="value"
                                                                src="/edit.svg"
                                                                width="30"
                                                                height="30"
                                                                className="m-2"
                                                            />
                                                        </a>
                                                    </div>
                                                    <div className="col">
                                                    <a role="button" onClick={() => deleteAssetValueHandler(assetValue)}>
                                                            <img
                                                                title="trash"
                                                                alt="trash"
                                                                src="/trash.svg"
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
                            ) : <></>}
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

export default AssetsValuesFormList;
