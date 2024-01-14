import moment from 'moment';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Config, Expense } from '../types';
import { formatDate } from '../util/helpers';

type Props = {
    expense: Expense
    onSubmit: Function
    onBulkCreate: Function
    owner: string
    config: Config
}

const ExpenseForm = ({ expense, onSubmit, onBulkCreate, owner, config }: Props) => {
    let expenseModified = expense;
    const [bulkExpenses, setBulkExpenses] = useState<Expense[]>([]);
    const [bulkMode, setBulkMode] = useState<boolean>(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (bulkMode) {
            if (bulkExpenses.length > 500) {
                Swal.fire(
                    'Error!',
                    'You can upload max 500 items',
                    'error'
                );
                return;
            }
            onBulkCreate(bulkExpenses);
        } else {
            onSubmit(expenseModified);
        }
        event.preventDefault();
    }

    const copyAndCreate = () => {
        const newExpense = { ...expenseModified }
        delete newExpense.id;
        onSubmit(newExpense);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const id = event.target.id;
        const value = event.target.value;
        expenseModified = { ...expenseModified, [id]: value };
        if (id=='category') {
            setSubcategories(getSubCategories(config));
        }
    }

    const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id;
        const momentValue = moment(event.target.value);
        if (!momentValue.isValid()) return;
        const value = parseInt(momentValue.format('X'));
        expenseModified = { ...expenseModified, [id]: value };
    }

    const getCategories = (config: Config): string[] => {
        try {
            const expensesCategories = JSON.parse(config.expensesCategories);
            return Object.keys(expensesCategories);
        } catch (e) {
            return [];
        }
    }

    const getSubCategories = (config: Config): string[] => {
        try {
            const expensesCategories = JSON.parse(config.expensesCategories);
            return expensesCategories[expenseModified.category];
        } catch (e) {
            return [];
        }
    }
    const [subcategories,setSubcategories] = useState<string[]>(getSubCategories(config));

    // Callback from a <input type="file" onchange="onChange(event)">
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        var file = event?.target?.files?.[0];
        if (!file) {
            setBulkMode(false);
            return;
        }
        setBulkMode(true);
        var reader = new FileReader();
        reader.onload = function (event) {
            const csvData = event?.target?.result as string;
            if (!csvData) {
                Swal.fire(
                    'Error!',
                    'No text detected',
                    'error'
                );
                return;
            }
            const csvDataRows = csvData.split('\n');
            const bulkData = csvDataRows
                .slice(1)
                .map(row => row.split(','))
                //.map(cols => {console.log(cols);return cols;})
                .filter(cols => (parseFloat('' + cols[5]) < 0) && cols[8].includes('COMPLETED'))
                .map(cols => {
                    return {
                        label: cols[4].split(/\s+/).slice(0, 3).join(" "),
                        description: cols[4],
                        value: -parseFloat('' + cols[5]),
                        createdOn: parseInt(moment(cols[2]).format('X')),
                        category: cols[10] ?? 'Miscellaneous',
                        subcategory: cols[11] ?? 'Miscellaneous',
                        account: cols[12] ?? 'Unknown',
                        owner: owner
                    } as Expense
                });

            setBulkExpenses(bulkData);
        };

        reader.readAsText(file);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <form onSubmit={handleSubmit}>
                    {bulkMode ? '' : <>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="label" className="form-label">Label</label>
                                    <input type="text" className="form-control" onChange={handleChange} id="label" defaultValue={expense?.label} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="account" className="form-label">Account</label>
                                    <input type="numeric" className="form-control" onChange={handleChange} id="account" defaultValue={expense?.account} />
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="value" className="form-label">Value</label>
                                    <input type="numeric" className="form-control" onChange={handleChange} id="value" defaultValue={expense?.value} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="createdOn" className="form-label">Date</label>
                                    <input type="date" className="form-control" onChange={handleChangeDate} id="createdOn" defaultValue={formatDate(expense?.createdOn)} />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select required className="form-control" onChange={handleChange} id="category" defaultValue={expense?.category}>
                                        <option></option>
                                        {
                                            getCategories(config).map(c => (<option key={c} value={c}>{c}</option>))
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="subcategory" className="form-label">Subcategory</label>
                                    <select required className="form-control" onChange={handleChange} id="subcategory" defaultValue={expense?.subcategory}>
                                        <option></option>
                                        {
                                            subcategories?.map(sc => (<option key={sc} value={sc}>{sc}</option>))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea className="form-control" onChange={handleChange} rows={3} id="description" defaultValue={expense?.description} />
                                </div>
                            </div>
                        </div>
                    </>}
                    {expense.id ? '' : <div className="row">
                        <div className="col-md-12 mb-3 text-center" >
                            <input type="file" title={'A,B,C=createdOn,D=void,E=label&description,F=value,G,H,I=state:COMPLETED,J,K=category,L=subcategory,M=account'} className="form-control" onChange={onFileChange} id="bulkUpload" />
                        </div>
                    </div>}
                    <div className="row">
                        <div className={expense.id ? "col-6" : "col-12"}>
                            <div className="mt-5 mb-3 text-center">
                                <button type="submit" className="btn btn-lg btn-dark">Submit</button>
                            </div>
                        </div>
                        {expense.id ?
                            <div className="col-6">
                                <div className="mt-5 mb-3 text-center">
                                    <button type="button" onClick={copyAndCreate} className="btn btn-lg btn-dark">Create New</button>
                                </div>
                            </div> : ''
                        }
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ExpenseForm;
