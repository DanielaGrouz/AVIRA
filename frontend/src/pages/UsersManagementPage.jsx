import React, {useState, useEffect} from 'react';
import {FiSearch, FiMail, FiShield, FiEdit2, FiTrash2} from 'react-icons/fi';
import UserService from '../services/UserService';
import Pagination from "../components/Pagination";

const UsersManagementPage = () => {
    const [users, setUsers] = useState([]);
    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    // const [sortBy, setSortBy] = useState('id');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);

    // Updated to match the fields from your UserService
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userRole: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.getAll(currentPage, 'id');
            setUsers(response.data.data.data);
            setTotalPageCount(response.data.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Delete Flow ---
    const handleTriggerDelete = (id) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await UserService.delete(userToDelete);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const cancelDeleteUser = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    // --- Edit Flow ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        const targetId = editingUser.userId;

        try {
            await UserService.updateSettings(targetId, formData);
            handleCloseModal();
            await fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleOpenModal = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userRole: user.userRole
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    // --- Helpers ---
    const getInitials = (firstName = '', lastName = '') => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${first}${last}`;
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <div className="header-top-row">
                    <h1>User Management</h1>
                </div>
            </div>

            {isLoading ? (
                <div className="no-location-box" style={{marginTop: '2rem'}}>
                    Loading users...
                </div>
            ) : (
                <>
                    <div className="events-grid">
                        {users.map(user => {
                            const userId = user.userId;
                            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

                            return (
                                <div className="event-card" key={userId}>
                                    <div className="event-card-header">
                                        <div className="event-date-badge">
                                            <span
                                                className="badge-day">{getInitials(user.firstName, user.lastName)}</span>
                                        </div>

                                        <div className="event-title-area">
                                            <h3 className="event-title">{fullName || 'Unknown User'}</h3>
                                            <div className="event-time-guests">
                                                <span>
                                                    <FiMail size={12}/>
                                                    {user.email}
                                                </span>
                                                <span>
                                                    <FiShield size={12}/>
                                                    {user.userRole || 'Viewer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="event-actions">
                                        <div className="card-icon-actions">
                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal(user)}
                                                    title="Edit User">
                                                <FiEdit2 size={16}/>
                                            </button>
                                            <button className="icon-btn delete-btn"
                                                    onClick={() => handleTriggerDelete(userId)} title="Delete User">
                                                <FiTrash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination currentPage={currentPage} totalPageCount={totalPageCount}
                                onPageChange={setCurrentPage}/>
                </>
            )}

            {!isLoading && users.length === 0 && (
                <div className="no-location-box" style={{marginTop: '2rem'}}>
                    No users found matching your search.
                </div>
            )}

            {/* Edit User Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Edit User</h2>
                        <p>Update the settings and role for this user.</p>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <div style={{flex: 1}}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Jane"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Doe"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. jane@avira.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={cancelDeleteUser}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to remove this user? This action cannot be undone.</p>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={cancelDeleteUser}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={confirmDeleteUser}
                                style={{background: 'linear-gradient(135deg, var(--color-error-line) 0%, var(--color-error-text) 100%)'}}
                            >
                                Yes, Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagementPage;