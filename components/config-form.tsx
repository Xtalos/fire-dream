import React from 'react';
import { Config } from '../types';

type Props = {
    config?: Config
    onSubmit: Function
    updateQuotesUrl?: string
}

const ConfigForm = ({ config, onSubmit, updateQuotesUrl }: Props) => {
    let configModified = config as Config;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        onSubmit(configModified);
        event.preventDefault();
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        configModified = { ...configModified, [id]: value };
    }

    const copyUrl = () => {
        console.log('copied');
        if(updateQuotesUrl) {
            navigator.clipboard.writeText(updateQuotesUrl);
        }
    }

    return (
        <div className="row">
            <div className="col-10 offset-1">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="chartPeriodMonths" className="form-label">Investments Chart Period Months</label>
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
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="updateQuotesUrl" className="form-label">Update Quotes Url</label>
                                <input type="text" className="form-control" role="button" onClick={copyUrl} readOnly id="updateQuotesUrl" defaultValue={updateQuotesUrl}/>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="expensesMonthlyBudget" className="form-label">Expenses Monthly Budget</label>
                                <input type="number" className="form-control" onChange={handleChange} id="expensesMonthlyBudget" defaultValue={config?.expensesMonthlyBudget} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                            <div className="col-md-12">
                                <div className="mb-3">
                                    <label htmlFor="expensesCategories" className="form-label">Expense Categories JSON</label>
                                    <textarea className="form-control" onChange={handleChange} rows={6} id="expensesCategories" defaultValue={config?.expensesCategories} />
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
