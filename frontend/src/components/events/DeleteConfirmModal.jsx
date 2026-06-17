import React from 'react';
import Modal from '../Modal';
import Button from '../Button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="modal-body">
        <p style={{ margin: 0, color: '#475569', fontSize: '1rem', lineHeight: '1.5' }}>
          Are you sure you want to delete this {itemName}?
          <br />
          <br />
          <strong>This action cannot be undone.</strong>
        </p>
      </div>
      <div className="modal-footer">
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
