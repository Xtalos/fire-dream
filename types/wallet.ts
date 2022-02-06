import { DocumentReference } from "@firebase/firestore";

type Wallet = {
    id: string
    label: string
    owner: string
    assets: { [label:string]:DocumentReference }
}

export default Wallet;