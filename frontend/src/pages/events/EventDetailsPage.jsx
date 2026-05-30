import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EventService from '../../services/EventService';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import '../../styles/events/EventDetailsPage.css';
import CustomSelect from "../../components/CustomSelect";
import AppRoutes from "../../AppRoutesConfig";

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [eventDetails, setEventDetails] = useState(null);

    // --- Pagination States ---
    const [guests, setGuests] = useState([]);
    const [guestPageCount, setGuestPageCount] = useState(0);
    const [guestCurrentPage, setGuestCurrentPage] = useState(1);
    const GUEST_PAGE_SIZE = 10;

    const [tasks, setTasks] = useState([]);
    const [taskPageCount, setTaskPageCount] = useState(0);
    const [taskCurrentPage, setTaskCurrentPage] = useState(1);
    const TASK_PAGE_SIZE = 10;

    // --- AI & Tools States ---
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [actionResultTitle, setActionResultTitle] = useState('');
    const [actionResultText, setActionResultText] = useState('');
    const [actionResultData, setActionResultData] = useState(null);
    const [actionResultImage, setActionResultImage] = useState(null);
    const [activeAction, setActiveAction] = useState(null);
    const [modalActionType, setModalActionType] = useState(null);
    const [addedSuggestedTasks, setAddedSuggestedTasks] = useState(new Set());
    const fileInputRef = useRef(null);

    // --- Modal States ---
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingGuestId, setEditingGuestId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);

    const [guestData, setGuestData] = useState({ name: '', phone: '', role: 'Guest', status: 'Pending' });
    const [taskData, setTaskData] = useState({ title: '', status: 'Pending', priority: 'Medium' });
    const [guestError, setGuestError] = useState('');

    const [itemToDelete, setItemToDelete] = useState(null);

    // --- Fetchers ---
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await EventService.getById(id);
                setEventDetails(res.data.data);
            } catch (error) {
                return navigate(AppRoutes.NOT_FOUND);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const fetchGuests = async () => {
        try {
            const res = await EventService.getGuests(id, {
                page: guestCurrentPage, limit: GUEST_PAGE_SIZE
            });
            setGuests(res.data.data.guests);
            setGuestPageCount(Math.ceil((res.data.data.totalCount || 0) / GUEST_PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching guests:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await EventService.getTasks(id, {
                page: taskCurrentPage, limit: TASK_PAGE_SIZE
            });
            setTasks(res.data.data.tasks || res.data.data);
            setTaskPageCount(Math.ceil((res.data.data.totalCount || 0) / TASK_PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => { fetchGuests(); }, [id, guestCurrentPage]);
    useEffect(() => { fetchTasks(); }, [id, taskCurrentPage]);

    // --- Smart Actions Handlers ---
    const handleSmartAction = async (actionType, title) => {
        setActiveAction(actionType);
        setActionResultImage(null);
        setActionResultText('');
        setActionResultData(null);
        setAddedSuggestedTasks(new Set());

        try {
            let res;
            if (actionType === 'invite') {
                res = await EventService.generateInvite(id);
                const imageUrl = URL.createObjectURL(res.data);
                setActionResultImage(imageUrl);
                setActionResultTitle(title);
                setIsResultModalOpen(true);
                return;
            }
            else if (actionType === 'shopping') res = await EventService.generateShoppingList(id);
            else if (actionType === 'tasks') res = await EventService.generateTaskList(id);
            else if (actionType === 'stores') {
                const location = eventDetails?.location || 'Israel';
                res = await EventService.findStores(id, location);
            }

            let resultData = res.data?.data || res.data;

            if (typeof resultData === 'string' && resultData.trim().startsWith('[')) {
                try { resultData = JSON.parse(resultData); } catch (e) {}
            }

            setActionResultData(resultData);
            setActionResultText(typeof resultData === 'object' ? JSON.stringify(resultData, null, 2) : resultData);
            setActionResultTitle(title);
            setModalActionType(actionType);
            setIsResultModalOpen(true);

        } catch (error) {
            console.error(`Error with ${actionType}:`, error);
            setActionResultTitle("Error");
            setActionResultText("Failed to execute this action. Please try again.");
            setIsResultModalOpen(true);
        } finally {
            setActiveAction(null);
        }
    };

    // פונקציה חכמה שמוסיפה גם משימה רגילה וגם פריט קניות בתור משימה
    const handleAddSuggestedTask = async (itemObj, index, isShopping = false) => {
        try {
            let titleStr = "New Task";

            // במידה וזה פריט קניות נרכיב כותרת כמו: Buy Orange Juice (0.25 liters)
            if (isShopping) {
                const qtyUnit = [itemObj.quantity, itemObj.unit].filter(Boolean).join(' ');
                titleStr = qtyUnit ? `Buy ${itemObj.item} (${qtyUnit})` : `Buy ${itemObj.item}`;
            } else {
                titleStr = itemObj.task || itemObj.title || "New Task";
            }

            const payload = {
                eventId: id,
                title: titleStr,
                status: 'Pending',
                priority: 'Medium'
            };

            await EventService.addTask(payload);
            fetchTasks();
            setAddedSuggestedTasks(prev => new Set(prev).add(index));
        } catch (error) {
            console.error("Failed to add suggested item as task", error);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setActiveAction('upload');
        try {
            await EventService.saveInvitation(id, file);
            const res = await EventService.getById(id);
            setEventDetails(res.data.data);

            setActionResultTitle("Success");
            setActionResultText("Invitation uploaded and saved successfully!");
            setActionResultImage(null);
            setModalActionType('upload');
            setIsResultModalOpen(true);
        } catch (error) {
            console.error("Error uploading invitation", error);
            setActionResultTitle("Error");
            setActionResultText("Failed to upload invitation.");
            setIsResultModalOpen(true);
        } finally {
            setActiveAction(null);
            event.target.value = null;
        }
    };

    // --- Open Modal Handlers ---
    const openAddGuestModal = () => {
        setEditingGuestId(null);
        setGuestData({ name: '', phone: '', status: 'Pending' });
        setIsGuestModalOpen(true);
    };

    const openEditGuestModal = (guest) => {
        setEditingGuestId(guest.guestId);
        setGuestData({
            name: guest.name,
            phone: guest.phone,
            status: guest.status
        });
        setIsGuestModalOpen(true);
    };

    const openAddTaskModal = () => {
        setEditingTaskId(null);
        setTaskData({ title: '', status: 'Pending', priority: 'Medium' });
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTaskId(task.taskId);
        setTaskData({
            title: task.title || task.description,
            status: task.status,
            priority: task.priority || 'Medium'
        });
        setIsTaskModalOpen(true);
    };

    // --- Submit Handlers ---
    const handleSaveGuest = async (e) => {
        e.preventDefault();
        setGuestError('');

        const name = guestData.name;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            setGuestError('Name must be a string (min 2 chars)');
            return;
        }

        const cleanPhone = guestData.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
            setGuestError('Please enter a valid Israeli phone number (e.g., 0545368889).');
            return;
        }

        try {
            const payload = { eventId: id, ...guestData, phone: cleanPhone };
            if (editingGuestId) {
                await EventService.updateGuest(editingGuestId, payload);
            } else {
                await EventService.addGuest(payload);
            }

            setIsGuestModalOpen(false);
            fetchGuests();
        } catch (error) {
            console.error("Failed to save guest", error);
            setGuestError('Failed to save guest. Please try again.');
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { eventId: id, ...taskData };
            if (editingTaskId) {
                await EventService.updateTask(editingTaskId, payload);
            } else {
                await EventService.addTask(payload);
            }

            setIsTaskModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    const promptDeleteGuest = (guestId) => {
        setItemToDelete({ id: guestId, type: 'guest'});
        setIsDeleteModalOpen(true);
    };

    const promptDeleteTask = (taskId) => {
        setItemToDelete({ id: taskId, type: 'task' });
        setIsDeleteModalOpen(true);
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'guest') {
            try {
                await EventService.deleteGuest(id, itemToDelete.id);
                fetchGuests();
            } catch (error) {
                console.error("Failed to delete guest", error);
            }
        } else if (itemToDelete.type === 'task') {
            try {
                await EventService.deleteTask(id, itemToDelete.id);
                fetchTasks();
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const guestColumns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'phone', header: 'Phone' },
        { accessorKey: 'role', header: 'Role' },
        {
            accessorKey: 'status', header: 'RSVP',
            cell: info => (
                <span style={{ color: info.getValue() === 'Confirmed' ? '#10b981' : '#64748b' }}>
                    {info.getValue()}
                </span>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const isManager = row.original.role?.toUpperCase() === 'MANAGER';
                return (
                    <div className="actions-cell">
                        <button onClick={() => openEditGuestModal(row.original)} className="icon-btn edit-btn" title="Edit Guest">
                            <FaEdit />
                        </button>
                        {!isManager && (
                            <button onClick={() => promptDeleteGuest(row.original.guestId)} className="icon-btn delete-btn" title="Delete Guest">
                                <FaTrash />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const taskColumns = [
        { accessorKey: 'title', header: 'Task' },
        { accessorKey: 'priority', header: 'Priority' },
        { accessorKey: 'status', header: 'Status' },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="actions-cell">
                    <button onClick={() => openEditTaskModal(row.original)} className="icon-btn edit-btn" title="Edit Task">
                        <FaEdit />
                    </button>
                    <button onClick={() => promptDeleteTask(row.original.taskId)} className="icon-btn delete-btn" title="Delete Task">
                        <FaTrash />
                    </button>
                </div>
            )
        }
    ];

    if (!eventDetails) return <div className="loading-state">Loading Event Details...</div>;

    return (
        <div className="details-container">
            <Button variant="text" className="back-btn" onClick={() => navigate(-1)}>
                &larr; Back to Events
            </Button>

            <div className="details-header">
                <h1 className="details-title">{eventDetails.name}</h1>
                <p className="details-description">{eventDetails.description}</p>
            </div>

            {/* --- Smart Actions / Event Tools Section --- */}
            <div className="event-tools-section">
                <div className="event-tools-buttons">
                    <button
                        className={`tool-btn outline-btn ${activeAction === 'invite' ? 'loading-action' : ''}`}
                        onClick={() => handleSmartAction('invite', 'Generated Invitation')}
                        disabled={activeAction !== null}
                    >
                        ✨ {activeAction === 'invite' ? 'Generating...' : 'Generate Invite'}
                    </button>

                    <button
                        className={`tool-btn outline-btn ${activeAction === 'shopping' ? 'loading-action' : ''}`}
                        onClick={() => handleSmartAction('shopping', 'Shopping List')}
                        disabled={activeAction !== null}
                    >
                        🛒 {activeAction === 'shopping' ? 'Generating...' : 'Shopping List'}
                    </button>

                    <button
                        className={`tool-btn outline-btn ${activeAction === 'tasks' ? 'loading-action' : ''}`}
                        onClick={() => handleSmartAction('tasks', 'Generated Tasks')}
                        disabled={activeAction !== null}
                    >
                        📋 {activeAction === 'tasks' ? 'Generating...' : 'Generate Tasks'}
                    </button>

                    <button
                        className={`tool-btn outline-btn ${activeAction === 'stores' ? 'loading-action' : ''}`}
                        onClick={() => handleSmartAction('stores', 'Nearby Stores')}
                        disabled={activeAction !== null}
                    >
                        📍 {activeAction === 'stores' ? 'Searching...' : 'Find Stores'}
                    </button>

                    <button
                        className={`tool-btn primary-btn ${activeAction === 'upload' ? 'loading-action' : ''}`}
                        onClick={handleUploadClick}
                        disabled={activeAction !== null}
                    >
                        📤 {activeAction === 'upload' ? 'Uploading...' : 'Save Invitation'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
            </div>

            <div className="tables-layout">
                {/* --- Guests Card --- */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Guest List</h2>
                        <Button variant="success" onClick={openAddGuestModal}>
                            + Add Guest
                        </Button>
                    </div>
                    <Table data={guests} columns={guestColumns} />

                    {guestPageCount > 1 && (
                        <div className="table-pagination-wrapper">
                            <Pagination
                                currentPage={guestCurrentPage}
                                totalPageCount={guestPageCount}
                                onPageChange={setGuestCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {/* --- Tasks Card --- */}
                <div className="table-card">
                    <div className="table-header">
                        <h2>Event Tasks</h2>
                        <Button variant="primary" onClick={openAddTaskModal}>
                            + Add Task
                        </Button>
                    </div>
                    <Table data={tasks} columns={taskColumns} />

                    {taskPageCount > 1 && (
                        <div className="table-pagination-wrapper">
                            <Pagination
                                currentPage={taskCurrentPage}
                                totalPageCount={taskPageCount}
                                onPageChange={setTaskCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}

            <Modal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} title={editingGuestId ? "Edit Guest" : "Add Guest"}>
                <form onSubmit={handleSaveGuest}>
                    <div className="modal-body">
                        {guestError && (
                            <div style={{
                                color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.75rem',
                                borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid #f87171'
                            }}>
                                {guestError}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text" className="form-input" required placeholder="e.g. Jane Doe"
                                value={guestData.name}
                                onChange={(e) => {
                                    setGuestData({...guestData, name: e.target.value});
                                    if (guestError) setGuestError('');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel" className="form-input" required placeholder="e.g. 0545368889"
                                value={guestData.phone}
                                onChange={(e) => {
                                    setGuestData({...guestData, phone: e.target.value});
                                    if (guestError) setGuestError('');
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <CustomSelect
                                value={guestData.status}
                                placement="top"
                                onChange={(e) => setGuestData({...guestData, status: e.target.value})}
                                options={[
                                    { value: 'pending', label: 'pending' },
                                    { value: 'confirmed', label: 'confirmed' },
                                    { value: 'cancelled', label: 'cancelled' }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button
                            variant="text" type="button"
                            onClick={() => {
                                setIsGuestModalOpen(false);
                                setGuestError('');
                            }}>Cancel</Button>
                        <Button variant="success" type="submit">{editingGuestId ? "Update Guest" : "Save Guest"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTaskId ? "Edit Task" : "Add New Task"}>
                <form onSubmit={handleSaveTask}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Task Title</label>
                            <input
                                type="text" className="form-input" required placeholder="e.g. Confirm catering menu"
                                value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <CustomSelect
                                value={taskData.priority}
                                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' }
                                ]}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <CustomSelect
                                value={taskData.status}
                                placement="top"
                                onChange={(e) => setTaskData({...taskData, status: e.target.value})}
                                options={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'in progress', label: 'In Progress' },
                                    { value: 'completed', label: 'Completed' }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button variant="text" type="button" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingTaskId ? "Update Task" : "Save Task"}</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                title="Confirm Deletion"
            >
                <div className="modal-body">
                    <p style={{ margin: 0, color: '#475569', fontSize: '1rem', lineHeight: '1.5' }}>
                        Are you sure you want to delete this {itemToDelete?.type}?
                        <br/><br/>
                        <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <div className="modal-footer">
                    <Button variant="text" onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}>Cancel</Button>
                    <Button variant="danger" onClick={executeDelete}>Yes, Delete</Button>
                </div>
            </Modal>

            {/* --- AI/Tools Result Modal --- */}
            <Modal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                title={actionResultTitle}
            >
                <div className="modal-body">
                    <div
                        className="result-content-box"
                        style={actionResultImage || modalActionType === 'tasks' || modalActionType === 'shopping' ? { backgroundColor: 'transparent', border: 'none', padding: 0 } : {}}
                    >

                        {/* 1. תמונה להזמנה */}
                        {actionResultImage ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img src={actionResultImage} alt="Generated Invite" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', objectFit: 'contain' }} />
                                </div>
                            )

                            /* 2. רשימת משימות או קניות - רינדור כרטיסיות עם כפתור +Add */
                            : (modalActionType === 'tasks' || modalActionType === 'shopping') && Array.isArray(actionResultData) ? (
                                    <div className="suggested-items-container">
                                        {actionResultData.map((item, index) => {
                                            const isShopping = modalActionType === 'shopping';

                                            // התאמת הכיתוב הראשי לפי סוג החלון
                                            const mainText = isShopping ? item.item : (item.task || item.title || "New Task");

                                            // התאמת טקסט עזר (ימים לפני למשימה, וכמות+יחידה לקניות)
                                            const subText = isShopping
                                                ? [item.quantity, item.unit].filter(Boolean).join(' ')
                                                : (item.daysBefore !== undefined ? `${item.daysBefore} days before` : '');

                                            return (
                                                <div key={index} className="suggested-item-card">
                                                    <div className="suggested-item-info">
                                                        <strong>{mainText}</strong>
                                                        {subText && (
                                                            <span className="suggested-item-meta">{subText}</span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant={addedSuggestedTasks.has(index) ? "success" : "primary"}
                                                        onClick={() => handleAddSuggestedTask(item, index, isShopping)}
                                                        disabled={addedSuggestedTasks.has(index)}
                                                        style={{ minWidth: '90px' }}
                                                    >
                                                        {addedSuggestedTasks.has(index) ? "Added ✓" : "+ Add"}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )

                                /* 3. טקסט גולמי / JSON סטנדרטי למצבים אחרים (למשל מציאת חנויות) */
                                : (
                                    <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                        {actionResultText}
                                    </div>
                                )}

                    </div>
                </div>
                <div className="modal-footer">
                    {actionResultImage && (
                        <a href={actionResultImage} download={`invitation_${id}.png`} style={{ textDecoration: 'none' }}>
                            <Button variant="success" type="button">Download Image</Button>
                        </a>
                    )}
                    <Button variant="text" onClick={() => setIsResultModalOpen(false)}>
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default EventDetailsPage;