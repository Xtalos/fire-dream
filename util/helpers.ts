import { Asset } from "../types";

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

export const getAssetsValues = (assets: Asset[]) => {
    let totalValue = 0;
    let totalInvested = 0;
    let totalRatio = 0;
    let globalRisk = 0;
    const conversionMap = new Map<string, number>();
    assets.forEach(asset => conversionMap.set(asset.symbol, asset.lastValue));

    const assetsValues = new Map<string, any>();
    assets.forEach(asset => {
        const conversion = conversionMap.get(asset.conversion) || 1;
        const value = conversion * asset.lastValue * asset.lastQuantity;
        totalValue += value || 0;
        totalInvested += parseFloat('' + (asset.lastInvested || 0));
        totalRatio += parseFloat('' + (asset.targetRatio || 0));
        assetsValues.set(asset.id, {
            value
        });
    });
    assets.forEach(asset => {
        const info = assetsValues.get(asset.id);
        const risk = parseFloat('' + asset.platformRisk) * (parseFloat('' + asset.currencyRisk) + parseFloat('' + asset.risk)) / 2;
        globalRisk += risk * (info.value || 0) / totalValue;
        assetsValues.set(asset.id, {
            value: info.value,
            ratio: info.value / totalValue,
            globalRisk: risk
        });
    });
    assetsValues.set('total', {
        value: totalValue,
        totalTargetRatio: totalRatio,
        globalRisk: globalRisk,
        ratio: 1,
        invested: totalInvested
    });

    return assetsValues;
}