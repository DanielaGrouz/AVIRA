import React, { useEffect, useState } from 'react';
import EventService from '../../services/EventService';
import GenericTableManager from './GenericTableManager';
import GuestModal from './GuestModal';
import { io } from 'socket.io-client';
import Config from '../../services/Config';

const GuestManager = ({ eventId, eventDetails }) => {
  const [liveUpdate, setLiveUpdate] = useState(null); // <--- NEW STATE
  useEffect(() => {
    const socket = io(Config.BASE_URL);

    socket.emit('joinEventRoom', eventId);

    socket.on('rsvpUpdated', (updatedData) => {
      console.log('Real-time RSVP received:', updatedData);
      setLiveUpdate(updatedData);
    });

    return () => {
      socket.disconnect();
    };
  }, [eventId]);
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: 'status',
      header: 'RSVP',
      cell: (info) => {
        const status = info.getValue() || 'Pending';
        let color = '#64748b';
        if (status.toLowerCase() === 'confirmed') color = '#10b981';
        if (status.toLowerCase() === 'cancelled') color = '#ef4444';

        return <span style={{ color, fontWeight: '500' }}>{status}</span>;
      },
    },
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

      const frontendUrl = Config.FRONTEND_URL;

      let formattedDate = eventDetails?.date;
      if (formattedDate && formattedDate !== 'TBD') {
        const dateObj = new Date(formattedDate);
        if (!isNaN(dateObj)) {
          formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }

      const eventName = eventDetails?.title || 'our event';
      const eventDate =
        eventDetails?.date && eventDetails.date !== 'TBD' ? `\n Date: ${formattedDate}` : '';
      const eventTime =
        eventDetails?.time && eventDetails.time !== 'TBD' ? `\n Time: ${eventDetails.time}` : '';
      const eventLocation =
        eventDetails?.location && eventDetails.location !== 'TBD'
          ? `\n Location: ${eventDetails.location}`
          : '';
      const rsvpLink = `${frontendUrl}/rsvp/${savedGuest.token}`;

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
      initialFormState={{ name: '', phone: '', status: 'pending' }}
      baseColumns={columns}
      FormModal={GuestModal}
      canDelete={(row) => row.role?.toUpperCase() !== 'MANAGER'}
      fetchItems={(page, sort, search, size, sortDirection) =>
        EventService.getGuests(eventId, page, sort, search, size, sortDirection)
      }
      addItem={handleAddGuest}
      updateItem={(id, payload) => EventService.updateGuest(id, { eventId, ...payload })}
      deleteItem={(id) => EventService.deleteGuest(eventId, id)}
      updatedItem={liveUpdate}
    />
  );
};

export default GuestManager;
