import moment from 'moment';
import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import { Wallet } from '../types';
import { formatDate } from '../util/helpers';

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

    const setRevisedOn = (event: React.MouseEvent<HTMLInputElement>) => {
        const value = parseInt(moment().format('X'));
        const input = document.getElementById('revisedOn') as HTMLInputElement;
        input.value = moment().format('YYYY-MM-DD');
        walletModified = { ...walletModified, revisedOn: value };
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        walletModified = { ...walletModified, [id]: value };
    }

    const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const momentValue = moment(event.target.value);
        if (!momentValue.isValid()) return;
        const value = parseInt(momentValue.format('X'));
        walletModified = { ...walletModified, [id]: value };
    }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <form onSubmit={handleSubmit}>
                    <div className="row mt-5">
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
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="revisionFrequency" className="form-label">Revision Frequency</label>
                                <input type="numeric" className="form-control" onChange={handleChange} id="revisionFrequency" defaultValue={wallet?.revisionFrequency} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="revisedOn" className="form-label">Last Revised On</label>
                                <InputGroup>
                                    <FormControl type="text" onChange={handleChangeDate} id="revisedOn" defaultValue={formatDate(wallet?.revisedOn)} />
                                    <InputGroup.Text role="button" onClick={setRevisedOn}>Revised</InputGroup.Text>
                                </InputGroup>
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
