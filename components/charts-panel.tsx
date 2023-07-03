/* eslint-disable @next/next/no-img-element */
import moment, { months } from 'moment';
import React from 'react';
import { Asset, Config, Wallet } from '../types';
import { formatRatio, formatValue, toPieData } from '../util/helpers';
import Pie from './charts/pie';
import TimeSeriesChart from './charts/time-series-chart';

type Props = {
    wallets: Wallet[]
    assets: Asset[]
    timeValues: any
    config: Config
}

const ChartsPanel = ({ wallets, assets, timeValues, config }: Props) => {

    const getMonthlyMobileAvgInvested = ({timeTotalValues}:any) => {
        const invested = timeTotalValues[2] as any[];
        return formatValue((parseFloat(''+invested[invested.length-1]) - parseFloat(''+invested[1]))/config.chartPeriodMonths);
    }
    const getMonthlyAvgInvested = ({timeTotalValues}:any) => {
        const invested = timeTotalValues[2] as any[];
        return formatValue(30*parseFloat(''+invested[invested.length-1]) / moment().diff(config.officialStartDate, 'days'));
    }

    return (
        <div className="row">
            {timeValues.timeTotalValues.length ?
                <>
                    <div className="row mt-5">
                        <div className="col-lg-10 offset-lg-1">
                            <h6 className="text-center">Monthly Mobile Average Invested: {getMonthlyMobileAvgInvested(timeValues)} €</h6>
                            <h6 className="text-center">Monthly Average Invested: {getMonthlyAvgInvested(timeValues)} €</h6>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-10 offset-lg-1">
                            <TimeSeriesChart data={timeValues.timeTotalValues} graphId='timeTotalValues' title='Total Value' />
                        </div>
                    </div>
                </> : <></>}
            <div className="row mt-5">
                <div className="col-md-6">
                    <Pie data={toPieData(assets, 'category', 'targetRatio')} graphId='categoryCompositionTarget' title='Category Composition Target' />
                </div>
                <div className="mt-5 mt-md-0 col-md-6">
                    <Pie data={toPieData(assets, 'category')} graphId='categoryComposition' title='Category Composition' />
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-md-6">
                    <Pie data={toPieData(assets, 'name', 'targetRatio')} graphId='assetCompositionTarget' title='Asset Composition Target' />
                </div>
                <div className="mt-5 mt-md-0 col-md-6">
                    <Pie data={toPieData(assets, 'name')} graphId='assetsComposition' title='Assets Composition' />
                </div>
            </div>
            {timeValues.timeCategoryValues.length ?
                <div className="row mt-5">
                    <div className="col-lg-10 offset-lg-1">
                        <TimeSeriesChart data={timeValues.timeCategoryValues} graphId='timeCategoryValues' title='Categories Values' />
                    </div>
                </div> : <></>}
            {timeValues.timeAssetValues.length ?
                <div className="row mt-5">
                    <div className="col-lg-10 offset-lg-1">
                        <TimeSeriesChart data={timeValues.timeAssetValues} graphId='timeAssetValues' title='Assets Values' />
                    </div>
                </div> : <></>}
            <div className="row mt-5">
                <div className="col-lg-10 offset-lg-1">
                    <Pie data={toPieData(assets, 'platform')} graphId='platformsRatio' title='Platforms' format={formatValue} />
                </div>
            </div>
        </div>
    );
}

export default ChartsPanel;
