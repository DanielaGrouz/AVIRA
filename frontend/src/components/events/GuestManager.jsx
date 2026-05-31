import React from 'react';
import EventService from '../../services/EventService';
import GenericTableManager from './GenericTableManager';
import GuestModal from './GuestModal';

const GuestManager = ({ eventId, eventDetails }) => {
    const columns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'role', header: 'Role' },
        {
            accessorKey: 'status',
            header: 'RSVP',
            cell: info => {
                const status = info.getValue() || 'Pending';
                let color = '#64748b';
                if (status.toLowerCase() === 'confirmed') color = '#10b981';
                if (status.toLowerCase() === 'cancelled') color = '#ef4444';

                return <span style={{ color, fontWeight: '500' }}>{status}</span>;
            }
        }
    ];

    const handleAddGuest = async (payload) => {
        const { sendWhatsapp, ...guestData } = payload;

        const response = await EventService.addGuest({ eventId, ...guestData });

        const savedGuest = response.data?.data;

        if (sendWhatsapp && savedGuest && savedGuest.phone) {
            let cleanPhone = savedGuest.phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '972' + cleanPhone.substring(1);
            }

            const frontendUrl = 'http://localhost:5000';

            let formattedDate = eventDetails?.date;
            if (formattedDate && formattedDate !== 'TBD') {
                const dateObj = new Date(formattedDate);
                if (!isNaN(dateObj)) {
                    formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
            }

            // 2. These are the human-readable variables for the text message body
            const eventName = eventDetails?.title || 'our event';
            const eventDate = eventDetails?.date && eventDetails.date !== 'TBD' ? `\n Date: ${formattedDate}` : '';
            const eventTime = eventDetails?.time && eventDetails.time !== 'TBD' ? `\n Time: ${eventDetails.time}` : '';
            const eventLocation = eventDetails?.location && eventDetails.location !== 'TBD' ? `\n Location: ${eventDetails.location}` : '';

            // 3. These are the encoded variables specifically for the react-router URL
            const safeTitle = encodeURIComponent(eventDetails?.title || 'TBD');
            const safeDate = encodeURIComponent(eventDetails?.date || 'TBD');
            const safeTime = encodeURIComponent(eventDetails?.time || 'TBD');
            const safeLocation = encodeURIComponent(eventDetails?.location || 'TBD');

            const rsvpLink = `${frontendUrl}/rsvp/${eventId}/${safeTitle}/${safeDate}/${safeTime}/${safeLocation}/${savedGuest.guestId}`;

            // 4. Combine the human-readable text with the safe link, then encode the entire message for WhatsApp
            const message = encodeURIComponent(
                `Hi ${savedGuest.name}! \nWe are excited to invite you to ${eventName}!${eventDate}${eventTime}${eventLocation}\n\nPlease let us know if you can make it by clicking the link below:\n${rsvpLink}`
            );

            window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        }

        return response;
    };

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
            fetchItems={(page, sort, search, size, sortDirection) => EventService.getGuests(eventId, page, sort, search, size, sortDirection)}
            addItem={handleAddGuest}
            updateItem={(id, payload) => EventService.updateGuest(id, { eventId, ...payload })}
            deleteItem={(id) => EventService.deleteGuest(eventId, id)}
        />
    );
};

export default GuestManager;