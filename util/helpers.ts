import moment from "moment";
import { BasicData } from "../components/charts/pie";
import { Asset, Expense, Wallet } from "../types";
import { ExpenseWithMonth } from "../types/expense";

export const coalesce = (value: any, alt = 0) => {
    return parseFloat((value || alt) + '');
}

export const formatValue = (value: string | number, unit = 'EUR') => {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    value = isNaN(value) ? 0 : value;

    return (Math.round(value * 100) / 100).toFixed(2);
}
export const formatQuantity = (value: string | number) => {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    value = isNaN(value) ? 0 : value;

    return Math.round(value * 10000) / 10000;
}

export const formatRatio = (value: string | number) => {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    value = isNaN(value) ? 0 : value;

    return Math.round(value * 1000) / 10;
}

export const formatRisk = (value: string | number) => {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    value = isNaN(value) ? 0 : value;

    return Math.round(value * 10) / 10;
}

export const getCalculatedValues = (assets: Asset[], normalize = false) => {
    let totalValue = 0;
    let totalInvested = 0;
    let totalRatio = 0;
    let globalRisk = 0;
    const conversionMap = new Map<string, number>();
    assets.filter(asset => asset.lastValue).forEach(asset => conversionMap.set(asset.symbol, asset.lastValue));

    const assetsValues = new Map<string, any>();
    assets.forEach(asset => {
        const conversion = conversionMap.get(asset.conversion) || 1;
        const normalization = normalize && asset.lastInvested ? parseFloat('' + asset.lastInvested) : 0;
        const value = conversion * (parseFloat('' + asset.lastValue) || 0) * (parseFloat(asset.lastQuantity + '') || 0) - normalization;
        totalValue += value || 0;
        totalInvested += parseFloat('' + (asset.lastInvested || 0));
        totalRatio += parseFloat('' + (asset.targetRatio || 0));
        assetsValues.set(asset.id, {
            value,
            targetRatio: asset.targetRatio || 0
        });
    });
    assets.forEach(asset => {
        const info = assetsValues.get(asset.id);
        const risk = parseFloat('' + asset.platformRisk) * (parseFloat('' + asset.currencyRisk) + parseFloat('' + asset.risk)) / 2;
        globalRisk += risk * (info.value || 0) / totalValue;
        assetsValues.set(asset.id, {
            value: info.value,
            targetRatio: info.targetRatio,
            ratio: info.value / totalValue,
            globalRisk: risk
        });
    });
    assetsValues.set('total', {
        value: totalValue,
        targetRatio: totalRatio,
        globalRisk: globalRisk,
        ratio: 1,
        invested: normalize ? 0 : totalInvested
    });

    return assetsValues;
}

export const getExpensesWithMonth = (expenses: Expense[]) => {
    let expensesWithMonth = expenses.filter(expense => expense.value).map(expense => ({...expense,month:formatDate(expense.createdOn, 'MMMM YYYY')}));

    return expensesWithMonth as ExpenseWithMonth[];
}

export const toExpensePieData = (expenses: ExpenseWithMonth[], field: 'category' | 'label' | 'subcategory' | 'account' | 'month', valueField = 'value'): BasicData[] => {
    return expenses.reduce((acc: BasicData[], expense: ExpenseWithMonth) => {
        const existingDataIdx = acc.findIndex(data => data.name.includes(expense[field]));
        const existingData = existingDataIdx >= 0 ? acc.splice(existingDataIdx, 1)[0] : null;
        return [...acc, {
            name: expense[field],
            value: coalesce(expense.value) + coalesce(existingData?.value)
        }];
    }, []);//.filter(data => data.value > 0);//.sort((a,b) => b.value - a.value);
}

export const toPieData = (assets: Asset[], field: 'category' | 'name' | 'platform', valueField = 'value'): BasicData[] => {
    const assetsValues = getCalculatedValues(assets);
    return assets.reduce((acc: BasicData[], asset: Asset) => {
        const existingDataIdx = acc.findIndex(data => data.name === asset[field]);
        const existingData = existingDataIdx >= 0 ? acc.splice(existingDataIdx, 1)[0] : null;
        return [...acc, {
            name: asset[field],
            value: coalesce(assetsValues.get(asset.id)[valueField]) + coalesce(existingData?.value)
        }]
    }, []);//.filter(data => data.value > 0);//.sort((a,b) => b.value - a.value);
}

export const formatDate = (date?: number, format = 'YYYY-MM-DD') => date && moment.unix(date).format(format);

export const isWalletRevisionExpired = (wallet: Wallet) => {
    return wallet.revisedOn === undefined || moment().diff(moment(wallet.revisedOn, 'X'), 'days') > (parseInt(wallet.revisionFrequency + '') ?? 0);
}

export const getWalletAssetsArray = (wallet: Wallet, assets: Asset[]) => {
    return assets.filter(asset => undefined !== Object.values(wallet.assets).find(wa => wa.id === asset.id));
}