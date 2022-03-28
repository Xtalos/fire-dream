import { AssetValue } from ".";

type AssetValueCache = {
    id?:string
    createdOn: number
    owner: string
    cache: AssetValue[]
}

export default AssetValueCache;