/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Asset, Wallet } from '../types';
import { getAssetsValues } from '../util/helpers';
import Pie, { BasicData } from './charts/pie';
import TimeSeriesChart from './charts/time-series-chart';

type Props = {
    wallets: Wallet[]
    assets: Asset[]
    timeValues: any
}

const ChartsPanel = ({ wallets, assets, timeValues }: Props) => {
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
            {timeValues.timeTotalValues.length ? <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className="col-12">
                        <TimeSeriesChart data={timeValues.timeTotalValues} graphId='timeTotalValues' title='Total Value'/>
                    </div>
                </div>
            </div> : <></>}
            <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className="col-12">
                        <Pie data={toPieData(assets, 'name')} graphId='assetsComposition' title='Assets Composition'/>
                    </div>
                </div>
            </div>
            {timeValues.timeCategoryValues.length ? <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className="col-12">
                        <TimeSeriesChart data={timeValues.timeCategoryValues} graphId='timeCategoryValues' title='Categories Values'/>
                    </div>
                </div>
            </div> : <></>}
            {timeValues.timeAssetValues.length ? <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className="col-12">
                        <TimeSeriesChart data={timeValues.timeAssetValues} graphId='timeAssetValues' title='Assets Values'/>
                    </div>
                </div>
            </div> : <></>}
        </div>
    );
}

export default ChartsPanel;
