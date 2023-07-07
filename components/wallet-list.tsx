/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React from 'react';
import { Alert } from 'react-bootstrap';
import { Wallet } from '../types';
import { formatRatio, formatRisk, formatValue, isWalletRevisionExpired } from '../util/helpers';

type Props = {
    wallets: Wallet[]
    updateQuotes: Function
}

const WalletList = ({ wallets, updateQuotes }: Props) => {
    let totalValue = 0;
    let totalInvested = 0;
    let totalRiskToNormalize = 0;
    let totalTargetRatio = 0;

    wallets.forEach(wallet => {
        totalInvested += parseFloat('' + wallet.invested);
        totalValue += parseFloat('' + wallet.lastValue);
        totalRiskToNormalize += wallet.lastValue * parseFloat('' + wallet.risk);
        totalTargetRatio += parseFloat('' + wallet.targetRatio);
    });

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    {wallets.length &&
                        <div className="col-6 d-flex flex-row">
                            <a className="mb-5 btn btn-lg btn-dark" onClick={() => updateQuotes(wallets)}>Update Quotes</a>
                        </div>
                    }
                    <div className={wallets.length ? "col-6 d-flex flex-row-reverse" : "col-12 text-center"} >
                        <a className="mb-5 btn btn-lg btn-dark" href={"/wallet/new"}>
                            Create Wallet
                        </a>
                    </div>
                </div>
                {totalTargetRatio != 1 &&
                    <Alert variant='danger'>
                        Total Target Ratio is {formatRatio(totalTargetRatio)}
                    </Alert>
                }
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            <li className="list-group-item bg-dark text-white" key="header">
                                <div className="row">
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Wallet</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Invested</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Value</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Risk</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Ratio</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Target</div>
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">Actions</div>
                                </div>
                            </li>
                            {wallets.length && wallets.map(wallet => {
                                return (
                                    <li className={isWalletRevisionExpired(wallet) ? 'bg-warning list-group-item' : 'list-group-item'} key={wallet.id}>
                                        <div className="row">
                                            <div className="col-sm-2 p-2 p-lg-2 text-center">{wallet.label}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center">{formatValue(wallet.invested)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center">{formatValue(wallet.lastValue)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center">{formatRisk(wallet.risk)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center">{formatRatio(wallet.lastValue / totalValue)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center">{formatRatio(wallet.targetRatio)}</div>
                                            <div className="col-sm-3">
                                                <div className="row">
                                                    <div className="col text-center">
                                                        <a href={"/wallet/" + wallet.id}>
                                                                <img
                                                                    alt=""
                                                                    title="edit assets"
                                                                    src="/allocation.svg"
                                                                    width="30"
                                                                    height="30"
                                                                    className="m-2"
                                                                />
                                                        </a>
                                                    </div>
                                                    <div className="col text-center">
                                                        <a href={"/wallet/" + wallet.id + "?edit=1"}>
                                                                <img
                                                                    alt=""
                                                                    title="edit wallet"
                                                                    src="/edit.svg"
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
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">{formatValue(totalInvested)}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">{formatValue(totalValue)}</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">{formatRisk(totalRiskToNormalize / totalValue)}</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center"></div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center"></div>
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">&#916; = {formatRatio((totalValue - totalInvested) / totalInvested)} %</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WalletList;
