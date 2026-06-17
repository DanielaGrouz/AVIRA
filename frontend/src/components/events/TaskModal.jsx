import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import CustomSelect from '../CustomSelect';

const TaskModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Confirm catering menu"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <CustomSelect
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
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
                { value: 'in progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="text" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Update Task' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
