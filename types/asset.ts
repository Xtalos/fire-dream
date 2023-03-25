
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
    minQuantity: number
    currency: string
    currencyRisk: number
    conversion: string
    hidden: boolean
    createdOn: Time
    updatedOn: Time
    lastQuantity: number
    lastValue: number
    lastInvested: number
}

export default Asset;