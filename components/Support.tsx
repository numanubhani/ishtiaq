import React, { useState } from 'react';
import { Ticket, TicketStatus, User, UserRole, TicketPriority } from '../types';
import { TICKETS } from '../constants';
import { Search, Filter, Plus, MessageSquare, X, Send } from 'lucide-react';
import { useToast } from './Toast';

interface SupportProps {
    currentUser: User;
    tickets: Ticket[];
    onUpdateTicket: (ticket: Ticket) => void;
    onCreateTicket: (ticket: Ticket) => void;
    users: User[];
}

export const Support: React.FC<SupportProps> = ({ currentUser, tickets: propTickets, onUpdateTicket, onCreateTicket, users }) => {
    const { addToast } = useToast();
    const [tickets, setTickets] = useState<Ticket[]>(propTickets);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    
    // Form State
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TicketPriority>(TicketPriority.LOW);

    const filteredTickets = tickets.filter(t => {
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
        if (currentUser.role === UserRole.CLIENT) return t.requesterId === currentUser.id;
        if (currentUser.role === UserRole.AGENT) return t.requesterId === currentUser.id || t.category === 'SUPPORT'; 
        return true;
    });

    // Update tickets when props change
    React.useEffect(() => {
        setTickets(propTickets);
    }, [propTickets]);

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const newTicket: Ticket = {
            id: `t${Date.now()}`,
            requesterId: currentUser.id,
            subject,
            description,
            priority,
            status: TicketStatus.OPEN,
            createdAt: new Date().toISOString(),
            category: currentUser.role === UserRole.CLIENT ? 'SUPPORT' : 'REQUEST'
        };
        onCreateTicket(newTicket);
        setIsModalOpen(false);
        setSubject('');
        setDescription('');
        addToast('Ticket created successfully', 'success');
    };

    const handleEditTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsEditModalOpen(true);
    };

    const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            const updated = { ...ticket, status: newStatus };
            onUpdateTicket(updated);
        }
    };

    const handleAssignTicket = (ticketId: string, assigneeId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            const updated = { ...ticket, assigneeId, status: TicketStatus.IN_PROGRESS };
            onUpdateTicket(updated);
            addToast('Ticket assigned', 'success');
        }
    };

    const supervisors = users.filter(u => u.role === UserRole.SUPERVISOR || u.role === UserRole.ADMIN);

    const getStatusColor = (status: TicketStatus) => {
        switch(status) {
            case TicketStatus.OPEN: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case TicketStatus.RESOLVED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    New Ticket
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={20} />
                    <select 
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value={TicketStatus.OPEN}>Open</option>
                        <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TicketStatus.RESOLVED}>Resolved</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Requester</th>
                                <th className="px-6 py-4">Assignee</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                {(currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.ADMIN) && (
                                    <th className="px-6 py-4 text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{ticket.subject}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{ticket.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {users.find(u => u.id === ticket.requesterId)?.name || ticket.requesterId}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {ticket.assigneeId ? (users.find(u => u.id === ticket.assigneeId)?.name || ticket.assigneeId) : 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{ticket.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${
                                            ticket.priority === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
                                            ticket.priority === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
                                            'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.ADMIN) ? (
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as TicketStatus)}
                                                className={`text-xs px-2 py-1 rounded border ${getStatusColor(ticket.status)}`}
                                            >
                                                <option value={TicketStatus.OPEN}>Open</option>
                                                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                                                <option value={TicketStatus.RESOLVED}>Resolved</option>
                                                <option value={TicketStatus.CLOSED}>Closed</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    {(currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.ADMIN) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!ticket.assigneeId && (
                                                    <select
                                                        onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
                                                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                                    >
                                                        <option value="">Assign...</option>
                                                        {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                )}
                                                <button onClick={() => handleEditTicket(ticket)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400">
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredTickets.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p>No tickets found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Ticket</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as TicketPriority)}
                                >
                                    <option value={TicketPriority.LOW}>Low</option>
                                    <option value={TicketPriority.MEDIUM}>Medium</option>
                                    <option value={TicketPriority.HIGH}>High</option>
                                    <option value={TicketPriority.CRITICAL}>Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea 
                                    required 
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Detailed explanation..."
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center transition-colors"
                                >
                                    <Send size={16} className="mr-2" />
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};