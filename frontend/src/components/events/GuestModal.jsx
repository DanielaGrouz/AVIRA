import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import CustomSelect from '../CustomSelect';

const GuestModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  useEffect(() => {
    setFormData(initialData);
    setError('');
    setSendWhatsapp(true);
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

    const currentStatus = formData.status ? formData.status.toLowerCase() : '';
    if (!['pending', 'confirmed', 'cancelled'].includes(currentStatus)) {
      setError('Please select a valid RSVP status.');
      return;
    }

    try {
      await onSave({ ...formData, phone: cleanPhone, status: currentStatus, sendWhatsapp });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message ||
        err.data?.error?.message ||
        err.message ||
        'Failed to save guest. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Guest' : 'Add Guest'}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Error message */}
          {error && (
            <div
              style={{
                color: 'var(--color-error-text, #9b4040)',
                backgroundColor: 'var(--color-error-bg, #fdf0ef)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-error-line, #d4837a)',
                letterSpacing: '0.02em',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setError('');
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              required
              placeholder="e.g. 0545368889"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setError('');
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <CustomSelect
              value={formData.status}
              placement="top"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          {!isEditing && (
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              {/* CUSTOM UI CHECKBOX (No native input issues) */}
              <div
                onClick={() => setSendWhatsapp(!sendWhatsapp)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    backgroundColor: sendWhatsapp
                      ? 'var(--color-sage-deep, #9cbfb0)'
                      : 'transparent',
                    border: `2px solid ${sendWhatsapp ? 'var(--color-sage-deep, #9cbfb0)' : 'var(--color-sage, #b8cfc4)'}`,
                  }}
                >
                  {/* Only show the checkmark SVG if sendWhatsapp is true */}
                  {sendWhatsapp && (
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L4.5 8.5L13 1"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-light)',
                  }}
                >
                  Send RSVP invitation via WhatsApp?
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="text" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" type="submit">
            {isEditing ? 'Update Guest' : 'Save Guest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GuestModal;
