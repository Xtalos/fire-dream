import React from 'react';
import { Config } from '../types';

type Props = {
    config?: Config
    onSubmit: Function
}

const ConfigForm = ({ config, onSubmit }: Props) => {
    let configModified = config as Config;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(configModified);
        event.preventDefault();
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        configModified = { ...configModified, [id]: value };
    }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="chartPeriodMonths" className="form-label">Chart Period Months</label>
                                <input type="text" className="form-control" onChange={handleChange} id="chartPeriodMonths" defaultValue={config?.chartPeriodMonths} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="revaluationTax" className="form-label">Benchmark Tax</label>
                                <input type="number" className="form-control" onChange={handleChange} id="revaluationTax" defaultValue={config?.revaluationTax} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="officialStartDate" className="form-label">Investiments Start Date</label>
                                <input type="text" className="form-control" onChange={handleChange} id="officialStartDate" defaultValue={config?.officialStartDate} />
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

export default ConfigForm;
