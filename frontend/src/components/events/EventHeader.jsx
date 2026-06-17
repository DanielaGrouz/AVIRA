import React from 'react';
import Config from '../../services/Config';

const EventHeader = ({ eventDetails, eventId }) => {
  const handleDownloadSavedInvite = async (url) => {
    const fullUrl = url.startsWith('http') ? url : `${Config.BASE_URL}${url}`;
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `event_${eventId}_invitation.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image, opening in new tab instead', error);
      window.open(fullUrl, '_blank');
    }
  };

  const invitationUrl = eventDetails.invitationPath;

  return (
    <div
      className="details-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
      }}
    >
      <div style={{ flex: 1 }}>
        <h1 className="details-title">{eventDetails.name || eventDetails.title}</h1>
        <p className="details-description">{eventDetails.description}</p>
      </div>

      {invitationUrl && (
        <div
          className="event-invitation-thumbnail"
          onClick={() => handleDownloadSavedInvite(invitationUrl)}
          title="Click to download invitation"
          style={{
            cursor: 'pointer',
            overflow: 'hidden',
            width: '150px',
            height: '100px',
            borderRadius: '8px',
          }}
        >
          <img
            src={
              invitationUrl.startsWith('http')
                ? invitationUrl
                : `${Config.BASE_URL}${invitationUrl}`
            }
            alt="Event Invitation"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventHeader;
