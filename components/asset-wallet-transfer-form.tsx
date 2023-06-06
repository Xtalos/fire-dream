import React, { useState } from 'react';
import { Asset, AssetValue, Wallet } from '../types';
import moment from 'moment';
import { getWalletAssetsArray } from '../util/helpers';

type Props = {
    assets: Asset[]
    wallets: Wallet[]
    onSubmit: Function
}

const AssetWalletTransferForm = ({ assets, wallets, onSubmit }: Props) => {

    const [fromWallet, setFromWallet] = useState<Wallet>();
    const [toWallet, setToWallet] = useState<Wallet>();
    const [asset,setAsset] = useState<Asset>();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        let fromAssets = {};
        let toAssets = {};
        for( let ast in fromWallet?.assets) {
            if(fromWallet?.assets[ast]?.id === asset?.id) {
                toAssets = {...toAssets, [asset?.id as string]:fromWallet?.assets[ast]}
                continue;
            }
            fromAssets = {...fromAssets, [ast]:fromWallet?.assets[ast]};
        }

        const from = {
            ...fromWallet,
            assets: fromAssets
        };

        const to = {
            ...toWallet,
            assets: {
                ...toAssets,
                ...toWallet?.assets
            }
        }

        onSubmit(from, to);
        event.preventDefault();
    }

    const handleChangeWalletFrom = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        const wallet = wallets.find(wallet => wallet.id === value);
        setFromWallet(wallet);
        console.log(wallet);
    }

    const handleChooseAsset = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        const asset = assets.find(asset => asset.id === value);
        setAsset(asset);
        console.log(asset);
    }

    const handleChangeWalletTo = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        const wallet = wallets.find(wallet => wallet.id === value);
        setToWallet(wallet);
        console.log(wallet);
    }

    return (
        <div className="row">
            <div className="col-12">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="assetFrom" className="form-label">From Wallet</label>
                                <select className="form-select" name="assetId" onChange={handleChangeWalletFrom}>
                                    <option key='none'></option>
                                    {wallets.map(wallet => <option key={wallet.id} value={wallet.id}>{wallet.label}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="assetFrom" className="form-label">Choose Asset</label>
                                <select className="form-select" name="assetId" onChange={handleChooseAsset}>
                                    <option key='none'></option>
                                    {fromWallet && getWalletAssetsArray(fromWallet,assets).map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="assetFrom" className="form-label">To Wallet</label>
                                <select className="form-select" name="assetId" onChange={handleChangeWalletTo}>
                                    <option key='none'></option>
                                    {wallets.map(wallet => <option key={wallet.id} value={wallet.id}>{wallet.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="mb-3 text-center">
                                <button type="submit" disabled={asset?.id == undefined || fromWallet?.id == undefined || toWallet?.id == undefined || fromWallet?.id == toWallet?.id} 
                                className="mt-4 btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssetWalletTransferForm;
