import React from 'react';
import { AssetValue,Time } from '../types';
import moment from 'moment';
import { Button, Modal } from 'react-bootstrap';
import AssetValueForm from './asset-value-form';

type Props = {
    assetValue: AssetValue|null
    show: boolean
    handleShow: Function
    onSubmit: Function
}

const AssetValueFormModal = ({ assetValue,show,handleShow,onSubmit }: Props) => {

    return (
        assetValue &&
            <Modal style={{opacity:1}} show={true} onHide={() => handleShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Asset Value</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AssetValueForm assetValue={assetValue} onSubmit={(result: AssetValue) => console.log(result)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => handleShow(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleShow(false)}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
    );
}

export default AssetValueFormModal;
