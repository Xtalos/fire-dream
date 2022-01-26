import moment from 'moment';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Asset, AssetValue } from '../types';
import AssetValueForm from './asset-value-form';

type Props = {
    assets: Asset[]
    onSubmit: Function
}

const AssetList = ({ assets, onSubmit }: Props) => {
    const [assetValue,setAssetValue] = useState<AssetValue | null>(null);

    const changeAssetValueHandler = (asset: Asset) => {
        setAssetValue({
            assetId: asset.id,
            quantity: 0,
            value: 0,
            createdOn: { seconds: parseInt(moment().format('X')) }
        })
    }

    const handleSubmit = (av:AssetValue) => {
        onSubmit(av);
        setAssetValue(null);
    }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <ul className="list-group">
                    {assets.length && assets.map(asset =>
                        <li className="list-group-item" key={asset.id}>
                            <div className="row">
                                <div className="col-7">{asset.name}</div>
                                <div className="col-5">
                                    <a className="btn btn-primary" data-toggle="modal" onClick={() => changeAssetValueHandler(asset)} data-target="#assetValueModal">Update Value</a>
                                </div>
                            </div>
                        </li>
                    )}
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
    );
}

export default AssetList;
