import { NextPage } from "next";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateDoc, addDoc, where, limit, getDoc, QueryDocumentSnapshot, DocumentData, collection, doc, DocumentSnapshot } from "@firebase/firestore";
import { firestore } from "../../firebase/webApp";
import { Container, AssetForm } from "../../components";
import { Asset } from '../../types';


const AssetPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const assetRef = doc(firestore, 'assets/'+id);
    const [asset, setAsset] = useState<DocumentSnapshot<DocumentData>|null>(null);

    const getAsset = async () => {
        // construct a query to get up to 10 undone todos 
        // get the todos
        const result = await getDoc(assetRef);
    
        // map through todos adding them to an array
        
        // set it to state
        console.log(result);
        setAsset(result);
      };
    
    const saveAsset = async (value:Asset) => {
      if(id === 'new') {
        const docRef = await addDoc(collection(firestore, 'assets'), value);
        window.location.replace('/asset/'+docRef.id);
      } else {
        const result = await updateDoc(assetRef,value);
      }
    }

    useEffect(() => {
        switch (id) {
          case undefined: return void 0;
          case 'new':
            break;
          default:
            getAsset();
        }
      }, [id]);

    return (
        <Container>
          <AssetForm asset={asset?.data() as Asset} onSubmit={saveAsset}/>
        </Container>
    )
}

export default AssetPage;