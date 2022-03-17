
import Time from './time';

type AssetValue = {
    id?:string
    assetId: string
    quantity: number
    value: number
    invested: number
    createdOn: number
}

export default AssetValue;