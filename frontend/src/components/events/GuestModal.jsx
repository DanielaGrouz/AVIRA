import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import CustomSelect from '../CustomSelect';

const GuestModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(initialData);
        setError('');
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const name = formData.name;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            setError('Name must be a string (min 2 chars)');
            return;
        }

        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
            setError('Please enter a valid Israeli phone number (e.g., 0545368889).');
            return;
        }

        try {
            await onSave({ ...formData, phone: cleanPhone });
        } catch (err) {
            setError('Failed to save guest. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Guest" : "Add Guest"}>
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    {error && (
                        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #f87171' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text" className="form-input" required placeholder="e.g. Jane Doe"
                            value={formData.name}
                            onChange={(e) => { setFormData({...formData, name: e.target.value}); setError(''); }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel" className="form-input" required placeholder="e.g. 0545368889"
                            value={formData.phone}
                            onChange={(e) => { setFormData({...formData, phone: e.target.value}); setError(''); }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <CustomSelect
                            value={formData.status}
                            placement="top"
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'confirmed', label: 'Confirmed' },
                                { value: 'cancelled', label: 'Cancelled' }
                            ]}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <Button variant="text" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="success" type="submit">{isEditing ? "Update Guest" : "Save Guest"}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default GuestModal;