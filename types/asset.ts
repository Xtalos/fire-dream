
import Time from './time';

type Asset = {
    id: string
    name: string
    category: string
    symbol: string
    invested: number
    targetRatio: number
    platform: string
    platformRisk: number
    risk: number
    currency: string
    currencyRisk: number
    conversion: string
    createdOn: Time
    updatedOn: Time
}

export default Asset;