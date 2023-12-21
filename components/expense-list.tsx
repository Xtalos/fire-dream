/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Expense } from '../types';
import { ExpenseWithMonth } from '../types/expense';
import { formatDate, formatValue, getExpensesWithMonth, getSubCategoryLabel, toExpensePieData } from '../util/helpers';
import Pie from './charts/pie';
import ExpenseForm from './expense-form';

type Props = {
    expenses: Expense[]
    cachedExpenses: Expense[]
    onSubmit: Function
    onBulkCreate: Function
    onDelete: Function
    owner: string
    dateFilter: DateFilter
    onChangeDateFilter: Function
    filterExpenses: Function
}

export type DateFilter = { start: string, end: string }
export type ParamFilter = {
    account: string[],
    category: string[],
    subcategory: string[],
}

const ExpenseList = ({ expenses, cachedExpenses, onSubmit, onBulkCreate, onDelete, owner, dateFilter, onChangeDateFilter, filterExpenses }: Props) => {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [charts, setCharts] = useState<boolean>(false);
    const [hideList, setHideList] = useState<boolean>(false);
    const [paramFilter, setParamFilter] = useState<ParamFilter>({account:[],category:[],subcategory:[]});
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat('' + expense.value ?? 0), 0);
    let newDateFilter = dateFilter;

    const addExpense = () => {
        setExpense({
            label: '',
            category: '',
            subcategory: '',
            description: '',
            value: 0,
            account: '',
            owner: owner,
            createdOn: parseInt(moment().format('X'))
        })
    }

    const saveExpense = async (expense: Expense) => {
        let closeForm = await onSubmit(expense);
        if (closeForm) {
            setExpense(null);
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = event.target.id as 'start' | 'end';
        const value = event.target.value || moment().format('YYYY-MM-DD');
        newDateFilter = {
            ...newDateFilter,
            [id]: value
        };
    }

    const handleFilterSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.id;
        const field = id.slice(0, -6) as 'account' | 'category' | 'subcategory';
        const filter = {
            ...paramFilter,
            [field]:event.target.value ? [event.target.value] : []
        };
        console.log(field);
        setParamFilter(filter);
        console.log(filter);
        filterExpenses(filter);
    }

    const getFilterLabel = (name: 'category' | 'subcategory' | 'account', expenses: Expense[]) => {
        return expenses.reduce((acc: string[], expense) => { return acc.includes(expense[name].trim()) ? acc : [...acc, expense[name].trim()] }, [])
    }

    const getAccount = (expenses: Expense[]) => {
        return expenses.map(expense => ({
            ...expense,
            account: expense.account
        })) as ExpenseWithMonth[];
    }

    const getCategory = (expenses: Expense[]) => {
        return expenses.map(expense => ({
            ...expense,
            category: expense.category
        })) as ExpenseWithMonth[];
    }

    const getSubCategory = (expenses: Expense[]) => {
        return expenses.map(expense => ({
            ...expense,
            subcategory: getSubCategoryLabel(expense)
        })) as ExpenseWithMonth[];
    }

    const applyDateFilter = () => {
        if (newDateFilter.start == dateFilter.start && newDateFilter.end == dateFilter.end) {
            return;
        }
        console.log('Update date filter', newDateFilter);
        onChangeDateFilter(newDateFilter);
    }

    return (
        <div className="row">
            <div className="col-lg-10 offset-lg-1">
                <div className="row">
                    <div className="col-12 mt-5 text-center" >
                        <a role="button" className="mb-5 btn btn-lg btn-dark" onClick={() => addExpense()}>Add expense</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="start" className="form-label">Start Date</label>
                            <input type="date" className="form-control" onChange={handleChange} id="start" defaultValue={dateFilter.start} />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="end" className="form-label">End Date</label>
                            <input type="date" className="form-control" onChange={handleChange} id="end" defaultValue={dateFilter.end} />
                        </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-end pb-3">
                        <a className="btn btn-dark w-100" onClick={applyDateFilter}>Filter</a>
                    </div>
                    <div className="col-md-2 d-flex align-items-end pb-3">
                        <a className="btn btn-dark w-100" onClick={() => setCharts(!charts)}>Charts</a>
                    </div>
                </div>
                {!charts || cachedExpenses.length < 1 ? '' : <>
                    <div className="row mt-5 mb-5">
                        <div className="col-md-6">
                            <Pie data={toExpensePieData(getAccount(expenses), 'account')} graphId='expensesComposition' title='Expenses' format={(v: string) => '€' + formatValue(v)} />
                        </div>
                        <div className="mt-5 mt-md-0 col-md-6">
                            <Pie data={toExpensePieData(getExpensesWithMonth(expenses), 'month')} graphId='expMonthComposition' title='Month' format={(v: string) => '€' + formatValue(v)} />
                        </div>
                    </div>
                    <div className="row mb-5">
                        <div className="col-md-6">
                            <Pie data={toExpensePieData(getCategory(expenses), 'category')} graphId='expCategoryComposition' title='Categories' format={(v: string) => '€' + formatValue(v)} />
                        </div>
                        <div className="mt-5 mt-md-0 col-md-6">
                            <Pie data={toExpensePieData(getSubCategory(expenses), 'subcategory')} graphId='expSubcategoryComposition' title='Sub Categories' format={(v: string) => '€' + formatValue(v)} />
                        </div>
                    </div>
                    <div className="row mb-5">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="accountFilter" className="form-label">Account</label>
                                <select required className="form-control" onChange={handleFilterSelectChange} id="accountFilter" >
                                    <option key='none'></option>
                                    {getFilterLabel('account', getAccount(cachedExpenses)).map(label => <option key={label} value={label}>{label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="categoryFilter" className="form-label">Category</label>
                                <select required className="form-control" onChange={handleFilterSelectChange} id="categoryFilter" >
                                    <option key='none'></option>
                                    {getFilterLabel('category', cachedExpenses).map(label => <option key={label} value={label}>{label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="subcategoryFilter" className="form-label">SubCategory</label>
                                <select required className="form-control" onChange={handleFilterSelectChange} id="subcategoryFilter" >
                                    <option key='none'></option>
                                    {getFilterLabel('subcategory', getSubCategory(cachedExpenses)).map(label => <option key={label} value={label}>{label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div></>}
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group mb-5">
                            <li className="list-group-item bg-dark text-white" key="header" onClick={() => { setHideList(!hideList) }}>
                                <div className="row d-none d-sm-flex">
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Label</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Category</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Value €</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">Description</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Account</div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center">CreatedOn</div>
                                    <div className="col-sm-1 p-1 p-lg-2 text-center">Action</div>
                                </div>
                            </li>
                            {hideList ? '' : expenses.map(expense => {
                                return (
                                    <li className="list-group-item" key={expense.id}>
                                        <div className="row">
                                            <div role="button" className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div>{expense.label}</div></div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-flex flex-column"><div className="d-sm-none">Category</div>{expense.category}<small>{expense.subcategory}</small></div></div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Value €</div>{formatValue(expense.value)}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Description</div>{expense.description}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Account</div>{expense.account}</div>
                                            <div className="col-sm-2 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Date</div>{formatDate(expense.createdOn)}</div>
                                            <div className="col-sm-1 p-2 p-lg-2 text-center align-self-center"><div className="d-sm-none">Action</div>
                                                <div className="col text-center">
                                                    <a role="button" onClick={() => setExpense(expense)}>
                                                        <img
                                                            title="edit"
                                                            alt="edit"
                                                            src="/edit.svg"
                                                            width="30"
                                                            height="30"
                                                            className="m-2"
                                                        />
                                                    </a>
                                                </div>
                                                <div className="col text-center">
                                                    <a role="button" onClick={() => onDelete(expense)}>
                                                        <img
                                                            title="trash"
                                                            alt="trash"
                                                            src="/trash.svg"
                                                            width="30"
                                                            height="30"
                                                            className="m-2"
                                                        />
                                                    </a>
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
                                    <div className="col-sm-2 p-1 p-lg-2 text-center"></div>
                                    <div className="col-sm-2 p-1 p-lg-2 text-center"><div className="d-sm-none">Value</div>{formatValue(totalExpenses)} €</div>
                                    <div className="col-sm-6 p-1 p-lg-2 text-center"></div>
                                </div>
                            </li>
                        </ul>
                        {expense &&
                            <Modal show={true} onHide={() => setExpense(null)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Expense</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <ExpenseForm expense={expense} owner={owner} onSubmit={saveExpense} onBulkCreate={onBulkCreate} />
                                </Modal.Body>
                            </Modal>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpenseList;
