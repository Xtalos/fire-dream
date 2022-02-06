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
            <div className="col-10 offset-1">
                <div className="row">
                    <div className="col-12 d-flex flex-row-reverse">
                        <Link href={"/wallet/new"}>
                            <a className="mb-5 btn btn-lg btn-dark" >Create Wallet</a>
                        </Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            {wallets.length && wallets.map(wallet => {
                                return (
                                    <li className="list-group-item" key={wallet.id}>
                                        <div className="row">
                                            <div className="col-3"><h5 className="p-2">{wallet.label}</h5></div>
                                            <div className="col-2 p-2"></div>
                                            <div className="col-3 p-2"></div>
                                            <div className="col-2 p-2"></div>
                                            <div className="col-1">
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
                                            <div className="col-1">
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
                                    </li>
                                );
                            }
                            )}
                            <li className="list-group-item bg-dark text-white" key="totalKey">
                                <div className="row">
                                    <div className="col-3"><h5 className="p-2">TOTAL</h5></div>
                                    <div className="col-2 p-2">{totalInvested}</div>
                                    <div className="col-3 p-2"></div>
                                    <div className="col-2 p-2">{totalValue}</div>
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
