// src/components/events/GuestManager.jsx
import React from 'react';
import EventService from '../../services/EventService';
import GenericTableManager from './GenericTableManager';
import GuestModal from './GuestModal';

const GuestManager = ({ eventId }) => {
    const columns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'role', header: 'Role' },
        {
            accessorKey: 'status',
            header: 'RSVP',
            cell: info => (
                <span style={{ color: info.getValue() === 'Confirmed' ? '#10b981' : '#64748b' }}>
                    {info.getValue()}
                </span>
            )
        }
    ];

    return (
        <GenericTableManager
            title="Guest List"
            itemName="guest"
            idField="guestId"
            initialFormState={{ name: '', phone: '', role: 'Guest', status: 'Pending' }}
            baseColumns={columns}
            FormModal={GuestModal}
            canDelete={(row) => row.role?.toUpperCase() !== 'MANAGER'}
            // API Wrappers
            fetchItems={(page, sort, search, size) => EventService.getGuests(eventId, page, sort, search, size)}
            addItem={(payload) => EventService.addGuest({ eventId, ...payload })}
            updateItem={(id, payload) => EventService.updateGuest(id, { eventId, ...payload })}
            deleteItem={(id) => EventService.deleteGuest(eventId, id)}
        />
    );
};

export default GuestManager;