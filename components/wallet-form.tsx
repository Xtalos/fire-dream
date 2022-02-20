import React from 'react';
import { Wallet } from '../types';

type Props = {
    wallet?: Wallet
    onSubmit: Function
}

const WalletForm = ({ wallet, onSubmit }: Props) => {
    let walletModified = wallet as Wallet;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(walletModified);
        event.preventDefault();
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        walletModified = { ...walletModified, [id]: value };
    }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="label" className="form-label">Label</label>
                                <input type="text" className="form-control" onChange={handleChange} id="label" defaultValue={wallet?.label} />
                            </div>

                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="label" className="form-label">Target Ratio</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="targetRatio" defaultValue={wallet?.targetRatio} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="mt-5 mb-3 text-center">
                                <button type="submit" className="btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WalletForm;
