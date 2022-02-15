import { DocumentReference } from "@firebase/firestore";

type Wallet = {
    id: string
    label: string
    invested: number
    lastValue: number
    risk: number
    owner: string
    assets: { [label:string]:DocumentReference }
}

export default Wallet;