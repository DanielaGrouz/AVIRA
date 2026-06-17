import React from 'react';
import EventService from '../../services/EventService';
import GenericTableManager from './GenericTableManager';
import TaskModal from './TaskModal';

const TaskManager = ({ eventId }) => {
  const columns = [
    { accessorKey: 'title', header: 'Task' },
    { accessorKey: 'priority', header: 'Priority' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() || 'pending';
        let color = '#64748b';
        if (status.toLowerCase() === 'in progress') color = '#cf3fdf';
        if (status.toLowerCase() === 'completed') color = '#10b981';

        return <span style={{ color, fontWeight: '500' }}>{status}</span>;
      },
    },
  ];

  return (
    <GenericTableManager
      title="Event Tasks"
      itemName="task"
      idField="taskId"
      initialFormState={{ title: '', status: 'Pending', priority: 'Medium' }}
      baseColumns={columns}
      FormModal={TaskModal}
      mapRowToForm={(row) => ({
        title: row.title || row.description,
        status: row.status,
        priority: row.priority || 'Medium',
      })}
      fetchItems={(page, sort, search, size, sortDirection) =>
        EventService.getTasks(eventId, page, sort, search, size, sortDirection)
      }
      addItem={(payload) => EventService.addTask({ eventId, ...payload })}
      updateItem={(id, payload) => EventService.updateTask(id, { eventId, ...payload })}
      deleteItem={(id) => EventService.deleteTask(eventId, id)}
    />
  );
};

export default TaskManager;
