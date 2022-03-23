import { BasicData } from "../components/charts/pie";
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
            value,
            targetRatio: asset.targetRatio
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
        invested: totalInvested
    });

    return assetsValues;
}

export const toPieData = (assets: Asset[], field: 'category' | 'name', valueField = 'value'): BasicData[] => {
    const assetsValues = getAssetsValues(assets);
    return assets.reduce((acc: BasicData[], asset: Asset) => {
        const existingDataIdx = acc.findIndex(data => data.name === asset[field]);
        const existingData = existingDataIdx >= 0 ? acc.splice(existingDataIdx,1)[0] : null;
        return [...acc, {
            name: asset[field],
            value: assetsValues.get(asset.id)[valueField] + (existingData? existingData.value : 0)
        }]
    },[]).filter(data => data.value > 0).sort((a,b) => b.value - a.value);
}