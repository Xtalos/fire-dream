
type AssetValueCache = {
    id?:string
    createdOn: number
    owner: string
    cache: { timeAssetValues: any, timeCategoryValues: any, timeTotalValues: any }
}

export default AssetValueCache;