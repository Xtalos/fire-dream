/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Asset, Wallet } from '../types';
import { getAssetsValues } from '../util/helpers';
import PieWrap, { BasicData } from './charts/pie-wrap';

type Props = {
    wallets: Wallet[]
    assets: Asset[]
}

const ChartsPanel = ({ wallets, assets }: Props) => {
    const assetsValues = getAssetsValues(assets);

    const toPieData = (assets: Asset[], field: 'category' | 'name'): BasicData[] => {
        return assets.reduce((acc: BasicData[], asset: Asset) => {
            const existingDataIdx = acc.findIndex(data => data.name === asset[field]);
            const existingData = existingDataIdx >= 0 ? acc.splice(existingDataIdx,1)[0] : null;
            return [...acc, {
                name: asset[field],
                value: assetsValues.get(asset.id).value + (existingData? existingData.value : 0)
            }]
        },[]).filter(data => data.value > 0).sort((a,b) => b.value - a.value);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className="col-12">
                        <PieWrap data={toPieData(assets, 'name')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChartsPanel;
