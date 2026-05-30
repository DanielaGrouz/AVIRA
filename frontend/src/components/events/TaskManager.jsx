import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EventService from '../../services/EventService';
import Table from '../Table';
import Button from '../Button';
import Pagination from '../Pagination';
import TaskModal from './TaskModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const TaskManager = ({ eventId }) => {
    // --- State ---
    const [tasks, setTasks] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const TASK_PAGE_SIZE = 1;

    // --- Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskData, setTaskData] = useState({ title: '', status: 'Pending', priority: 'Medium' });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // --- Data Fetching ---
    const fetchTasks = async () => {
        try {
            // The original code did not use search/sort for tasks, but you can easily add it here
            const res = await EventService.getTasks(eventId, currentPage, null, "", TASK_PAGE_SIZE);
            setTasks(res.data.data.data);
            setPageCount(res.data.data.totalPages);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [eventId, currentPage]);

    // --- Handlers ---
    const handleSave = async (payload) => {
        try {
            const taskPayload = { eventId, ...payload };
            if (editingTaskId) {
                await EventService.updateTask(editingTaskId, taskPayload);
            } else {
                await EventService.addTask(taskPayload);
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to save task", error);
            throw error; // Let the modal handle the error display if needed
        }
    };

    const handleDelete = async () => {
        try {
            await EventService.deleteTask(eventId, taskToDelete);
            setDeleteModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const openAddModal = () => {
        setEditingTaskId(null);
        setTaskData({ title: '', status: 'Pending', priority: 'Medium' });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTaskId(task.taskId);
        setTaskData({
            title: task.title || task.description,
            status: task.status,
            priority: task.priority || 'Medium'
        });
        setIsModalOpen(true);
    };

    // --- Table Columns ---
    const columns = [
        { accessorKey: 'title', header: 'Task' },
        { accessorKey: 'priority', header: 'Priority' },
        { accessorKey: 'status', header: 'Status' },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <div className="actions-cell">
                    <button
                        onClick={() => openEditModal(row.original)}
                        className="icon-btn edit-btn"
                        title="Edit Task"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => {
                            setTaskToDelete(row.original.taskId);
                            setDeleteModalOpen(true);
                        }}
                        className="icon-btn delete-btn"
                        title="Delete Task"
                    >
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>Event Tasks</h2>
                <Button variant="primary" onClick={openAddModal}>
                    + Add Task
                </Button>
            </div>

            <Table data={tasks} columns={columns} />

            {pageCount > 1 && (
                <div className="table-pagination-wrapper">
                    <Pagination
                        currentPage={currentPage}
                        totalPageCount={pageCount}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modals */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={taskData}
                isEditing={!!editingTaskId}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName="task"
            />
        </div>
    );
};

export default TaskManager;