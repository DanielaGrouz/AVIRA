// src/components/events/TaskManager.jsx
import React from 'react';
import EventService from '../../services/EventService';
import GenericTableManager from './GenericTableManager';
import TaskModal from './TaskModal';

const TaskManager = ({ eventId }) => {
    const columns = [
        { accessorKey: 'title', header: 'Task' },
        { accessorKey: 'priority', header: 'Priority' },
        { accessorKey: 'status', header: 'Status' }
    ];

    return (
        <GenericTableManager
            title="Event Tasks"
            itemName="task"
            idField="taskId"
            initialFormState={{ title: '', status: 'Pending', priority: 'Medium' }}
            baseColumns={columns}
            FormModal={TaskModal}
            // Maps the raw task row to match the form inputs
            mapRowToForm={(row) => ({
                title: row.title || row.description,
                status: row.status,
                priority: row.priority || 'Medium'
            })}
            // API Wrappers
            fetchItems={(page, sort, search, size) => EventService.getTasks(eventId, page, sort, search, size)}
            addItem={(payload) => EventService.addTask({ eventId, ...payload })}
            updateItem={(id, payload) => EventService.updateTask(id, { eventId, ...payload })}
            deleteItem={(id) => EventService.deleteTask(eventId, id)}
        />
    );
};

export default TaskManager;