/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React from 'react';
import { Wallet } from '../types';

type Props = {
    wallets: Wallet[]
}

const WalletList = ({ wallets }: Props) => {
    let totalValue = 0;
    let totalInvested = 0;

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row mt-5">
                    <div className={wallets.length ? "col-12 d-flex flex-row-reverse" : "col-12 text-center"} >
                        <Link href={"/wallet/new"}>
                            <a className="mb-5 btn btn-lg btn-dark" >Create Wallet</a>
                        </Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            <li className="list-group-item bg-dark text-white" key="header">
                                <div className="row">
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">Wallet</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Invested</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Value</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Ratio</div>
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">Actions</div>
                                </div>
                            </li>
                            {wallets.length && wallets.map(wallet => {
                                return (
                                    <li className="list-group-item" key={wallet.id}>
                                        <div className="row">
                                            <div className="col-sm-3 p-2 p-lg-2 text-center">{wallet.label}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center"></div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center"></div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center"></div>
                                            <div className="col-sm-3">
                                                <div className="row">
                                                    <div className="col text-center">
                                                        <Link href={"/wallet/" + wallet.id}>
                                                            <a>
                                                                <img
                                                                    alt=""
                                                                    src="/allocation.svg"
                                                                    width="30"
                                                                    height="30"
                                                                    className="m-2"
                                                                />
                                                            </a>
                                                        </Link>
                                                    </div>
                                                    <div className="col text-center">
                                                        <Link href={"/wallet/" + wallet.id + "?edit=1"}>
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
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }
                            )}
                            <li className="list-group-item bg-dark text-white" key="totalKey">
                                <div className="row">
                                    <div className="col-sm-3 p-1 p-lg-2 text-center">TOTAL</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">{totalInvested}</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center"></div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">&#916; = {totalValue}</div>
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
