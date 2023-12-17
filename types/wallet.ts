import { DocumentReference } from "@firebase/firestore";

type Wallet = {
    id: string
    label: string
    type: 'expense' | 'account' | 'investment'
    invested: number
    targetRatio: number
    revisionFrequency: number
    revisedOn: number
    startedOn: number
    lastValue: number
    risk: number
    owner: string
    active: boolean
    assets: { [label:string]:DocumentReference }
}

export default Wallet;