import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    FileText,
    ChevronDown,
    ChevronUp,
    Plus,
    Edit2,
    Trash2,
    Tag,
    X,
    CheckCircle,
    BarChart2
} from 'lucide-react';
import NoteList from '../../components/NoteList';
import NoteEditor from '../../components/NoteEditor';
import { useTemplates } from '../../context/TemplateContext';
import { TherapistContext } from '../../context/TherapistContext';
import { toast } from 'react-toastify';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';





// Helper function to calculate client duration
const calculateClientDuration = (firstAppointmentDate) => {
    if (!firstAppointmentDate) return '';

    const startDate = parseISO(firstAppointmentDate);
    const now = new Date();

    const years = differenceInYears(now, startDate);
    const months = differenceInMonths(now, startDate) % 12;

    if (years === 0) {
        return `${months} month${months !== 1 ? 's' : ''}`;
    }

    return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} month${months !== 1 ? 's' : ''}` : ''}`;
};

const statusOptions = [
    "Ongoing",
    "Goal Setting",
    "Archived",
    "Terminated"
];

function StatusDropdown({ value, onChange, small, compact }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative w-full ${small ? 'w-auto' : ''}`} ref={ref}>
            <button
                className={`w-full flex justify-between items-center bg-white border border-gray-200 ${compact ? 'rounded-lg px-4 py-2 text-[15px]' : 'rounded-2xl px-6 py-4 text-[17px]'} font-semibold shadow-lg hover:shadow-xl transition cursor-pointer`}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                {value}
                <ChevronDown className="ml-2 text-indigo-400" size={compact ? 18 : 22} />
            </button>
            {open && (
                <div className={`absolute left-0 right-0 mt-2 bg-white ${compact ? 'rounded-lg' : 'rounded-2xl'} shadow-xl border border-gray-100 z-50`}>
                    {statusOptions.map((option) => (
                        <button
                            key={option}
                            className={`w-full text-left px-6 py-3 text-[15px] font-medium hover:bg-indigo-50 transition ${value === option ? "bg-indigo-100 text-indigo-700" : "text-gray-700"}`}
                            onClick={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                            type="button"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const TABS = [
    { key: 'stats', label: 'Client Profile' },
    { key: 'timeline', label: 'Session Timeline' },
    { key: 'notes', label: 'Notes' },
];

const getEngagementScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
};
const getRetentionPrediction = (score) => {
    if (score >= 0.8) return { label: 'High', color: 'text-green-600' };
    if (score >= 0.5) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-red-600' };
};

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        getClientDetails,
        addClientNote,
        addClientGoal,
        addClientProgress,
        fetchClientNotes,
        pinClientNote,
        deleteClientNote,
        fetchAnalytics
    } = useContext(TherapistContext);

    // State management
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [clientStatus, setClientStatus] = useState('');
    const [clientGoals, setClientGoals] = useState([]);
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [sessions, setSessions] = useState([]);
    const [showCancelled, setShowCancelled] = useState(false);
    const [timelineOrder, setTimelineOrder] = useState('desc'); // 'desc' for latest first, 'asc' for earliest first
    const [sessionDateSearch, setSessionDateSearch] = useState('');
    const [timelineFilter, setTimelineFilter] = useState('latest'); // 'latest', 'earliest', 'latest-cancelled', 'earliest-cancelled'
    const [dateRange, setDateRange] = useState('all'); // 'month', '3months', 'year', '5years', 'all'
    const [yearSearch, setYearSearch] = useState('');
    const [showAllSessions, setShowAllSessions] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [selectedTab, setSelectedTab] = useState('stats');

    const { psychometricTools, clientNoteTemplates } = useTemplates();

    // Fetch client data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [data, analyticsData] = await Promise.all([
                    getClientDetails(id),
                    fetchAnalytics()
                ]);
                if (data) {
                    setClientData(data);
                    setClientStatus(data.status);
                    setClientGoals(data.goals || []);
                    setSessions(data.sessions || []);
                    setNotes(data.notes || []);
                }
                setAnalytics(analyticsData);
            } catch (err) {
                console.error('Error fetching client details:', err);
                setError(err.message);
                toast.error('Failed to load client details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, getClientDetails, fetchAnalytics]);

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        try {
            const updatedData = await addClientProgress({
                clientId: id,
                status: newStatus,
                type: 'status_change'
            });
            if (updatedData) {
                setClientStatus(newStatus);
                toast.success('Status updated successfully');
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    // Handle adding new goal
    const handleAddGoal = async () => {
        if (newGoal.trim()) {
            try {
                const goalData = {
                    clientId: id,
                    title: newGoal.trim(),
                    status: 'active'
                };
                const addedGoal = await addClientGoal(goalData);
                if (addedGoal) {
                    setClientGoals([...clientGoals, addedGoal]);
                    setNewGoal('');
                    setShowGoalInput(false);
                    toast.success('Goal added successfully');
                }
            } catch (err) {
                toast.error('Failed to add goal');
            }
        }
    };

    // Handle removing goal
    const handleRemoveGoal = async (goalToRemove) => {
        try {
            const updatedGoals = clientGoals.filter(goal => goal !== goalToRemove);
            await addClientProgress({
                clientId: id,
                goals: updatedGoals,
                type: 'goals_update'
            });
            setClientGoals(updatedGoals);
            toast.success('Goal removed successfully');
        } catch (err) {
            toast.error('Failed to remove goal');
        }
    };

    // Handle adding/editing note
    const handleAddNote = async (note) => {
        try {
            const newNote = {
                clientId: id,
                content: note.content || '',
                templateUsed: note.templateName || note.type || 'General',
                fields: note.fields || null,
                appointmentId: note.appointmentId || null,
                date: note.date || new Date().toISOString(),
                templateId: note.templateId || null,
                templateName: note.templateName || null,
                status: 'published'
            };

            console.log('Adding note with data:', newNote); // Debug log

            // For template-based notes, we don't require content
            if (!note.templateId && !newNote.content) {
                toast.error('Note content is required');
                return;
            }

            const addedNote = await addClientNote(newNote);
            if (addedNote) {
                console.log('Note added successfully:', addedNote); // Debug log
                setNotes(prevNotes => [addedNote, ...prevNotes]);
                setShowNoteEditor(false);
                toast.success('Note added successfully');
            }
        } catch (err) {
            console.error('Error adding note:', err);
            toast.error('Failed to add note');
        }
    };

    // Handle pinning note
    const handlePinNote = async (noteId, pinned) => {
        try {
            await pinClientNote(noteId, pinned);
            setNotes(notes.map(note =>
                note._id === noteId ? { ...note, pinned } : note
            ));
            toast.success(pinned ? 'Note pinned' : 'Note unpinned');
        } catch (err) {
            toast.error('Failed to update note');
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await deleteClientNote(noteId);
            setNotes(notes.filter(note => note._id !== noteId));
            toast.success('Note deleted');
        } catch (err) {
            toast.error('Failed to delete note');
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setShowNoteEditor(true);
    };

    const now = new Date();
    let filteredSessions = [...sessions];

    // If showCancelled is true, show ALL sessions (no cancelled filter)
    if (!showCancelled) {
        const showCancelledFilter = timelineFilter.includes('cancelled');
        filteredSessions = filteredSessions.filter(
            s => showCancelledFilter
                ? (s.statusOfAppointment || s.status) === 'cancelled'
                : (s.statusOfAppointment || s.status) !== 'cancelled'
        );
    }
    // If showCancelled is true, do NOT filter out cancelled sessions at all

    // Date range filter
    const getDateLimit = (range) => {
        const d = new Date();
        switch (range) {
            case 'month': d.setMonth(d.getMonth() - 1); break;
            case '3months': d.setMonth(d.getMonth() - 3); break;
            case 'year': d.setFullYear(d.getFullYear() - 1); break;
            case '5years': d.setFullYear(d.getFullYear() - 5); break;
            default: return null;
        }
        return d;
    };
    const dateLimit = getDateLimit(dateRange);
    if (dateLimit) {
        filteredSessions = filteredSessions.filter(s => new Date(s.date) >= dateLimit);
    }

    // Year search filter
    if (yearSearch) {
        filteredSessions = filteredSessions.filter(s => {
            // Format session date as YYYY-MM-DD
            const sessionDate = new Date(s.date).toISOString().split('T')[0];
            return sessionDate.includes(yearSearch);
        });
    }

    // Sort
    filteredSessions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (timelineFilter === 'latest' || timelineFilter === 'latest-cancelled') return dateB - dateA;
        return dateA - dateB;
    });

    // Show only 6 by default
    const sessionsToShow = showAllSessions ? filteredSessions : filteredSessions.slice(0, 6);

    const nextSession = sessionsToShow.length > 0 ? sessionsToShow[0] : null;

    // Prepare stacked bar chart data for session booking format
    const sessionFormatData = (() => {
        const grouped = {};
        sessions.forEach(s => {
            const month = format(new Date(s.date), 'yyyy-MM');
            if (!grouped[month]) grouped[month] = { month, online: 0, inperson: 0 };
            if ((s.type || '').toLowerCase() === 'online') grouped[month].online += 1;
            else if ((s.type || '').toLowerCase().includes('in')) grouped[month].inperson += 1;
        });
        // Sort months chronologically
        return Object.values(grouped).sort((a, b) => new Date(a.month + '-01') - new Date(b.month + '-01'));
    })();
    const sessionTotalData = sessionFormatData.map((entry) => ({
        month: entry.month,
        total: entry.online + entry.inperson
    }));
    const BAR_COLORS = { online: '#4C5AE3', inperson: '#6366F1' };

    // Prepare appointment type distribution data
    const appointmentTypeData = sessions.reduce((acc, session) => {
        const type = session.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const pieChartData = Object.entries(appointmentTypeData).map(([name, value]) => ({
        name,
        value
    }));

    const PIE_COLORS = ['#4C5AE3', '#6366F1']; // Harmonious blue/purple shades

    // Get first appointment date
    const firstAppointmentDate = sessions.length > 0
        ? sessions.reduce((earliest, session) => {
            return new Date(session.date) < new Date(earliest.date) ? session : earliest;
        }).date
        : null;

    // Get AI stats for this client
    const aiStats = analytics?.engagementScores?.[id];
    const engagementScore = aiStats?.score;
    const retentionPrediction = aiStats ? getRetentionPrediction(aiStats.score) : null;

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                {/* Tabs */}
                <div className="flex mt-2 gap-2 mb-8 border-b border-gray-200">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`px-6 py-3 text-lg font-semibold rounded-t-2xl transition-colors duration-150 focus:outline-none ${selectedTab === tab.key ? 'bg-white border-x border-t border-gray-200 text-indigo-700 shadow-sm -mb-px' : 'bg-gray-50 text-gray-500 hover:text-indigo-600'}`}
                            onClick={() => setSelectedTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Client Stats Section */}
                {selectedTab === 'stats' && (
                    <div className="flex flex-col md:flex-row gap-8 mb-10">
                        {/* Profile Card */}
                        <div className="flex-1 min-w-[280px] max-w-[340px] bg-white rounded-3xl shadow-xl p-8 flex flex-col items-start justify-between">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
                                {clientData?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="text-[28px] font-extrabold text-gray-900 mb-1">{clientData?.name}</div>
                            <div className="text-[16px] text-gray-500 mb-2">{clientData?.university}{clientData?.birthdate && (<span className="text-gray-400"> · {Math.floor((new Date() - new Date(clientData.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))} yrs</span>)}</div>
                            <div className="w-full mb-4">
                                <StatusDropdown value={clientStatus} onChange={handleStatusChange} small compact />
                            </div>
                            <div className="w-full">
                                <div className="flex items-center mb-2">
                                    <span className="text-[18px] font-semibold text-gray-700 mr-2">Goals</span>
                                    <button
                                        onClick={() => setShowGoalInput(!showGoalInput)}
                                        className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full shadow transition text-[16px]"
                                        title="Add goal"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {clientGoals.map((goal, index) => (
                                        <div
                                            key={index}
                                            className="inline-flex items-center bg-white border border-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-[16px] font-semibold shadow-sm hover:shadow-md transition-all"
                                        >
                                            <span>{goal.title}</span>
                                            <button
                                                onClick={() => handleRemoveGoal(goal)}
                                                className="ml-1 text-gray-400 hover:text-red-500 transition"
                                                title="Remove goal"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {showGoalInput && (
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={newGoal}
                                            onChange={(e) => setNewGoal(e.target.value)}
                                            placeholder="Add new goal..."
                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-[16px]"
                                        />
                                        <button
                                            onClick={handleAddGoal}
                                            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-[16px] font-medium"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* AI Insights Card */}
                        <div className="flex-1 min-w-[260px] max-w-[340px] bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-8 flex flex-col min-h-[260px] border border-indigo-100">
                            <div className="text-xs font-bold text-gray-700 mb-6 tracking-widest uppercase">AI Insights</div>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <BarChart2 className="text-indigo-400" size={22} />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-base text-gray-500">Engagement Score</span>
                                        <span className={`text-2xl font-extrabold ${getEngagementScoreColor(engagementScore)}`}>{engagementScore !== undefined ? (engagementScore * 100).toFixed(0) + '%' : '--'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Tag className="text-indigo-400" size={22} />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-base text-gray-500">Retention Prediction</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${retentionPrediction?.color} border-current bg-opacity-10`}>{retentionPrediction?.label || '--'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <CheckCircle className="text-indigo-400" size={22} />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-base text-gray-500">Completion Rate</span>
                                        <span className="text-xl font-bold text-gray-900">{aiStats ? ((aiStats.completedSessions / aiStats.totalSessions) * 100).toFixed(0) + '%' : '--'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Clock className="text-indigo-400" size={22} />
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="text-base text-gray-500">Avg. Session Interval</span>
                                        <span className="text-xl font-bold text-gray-900">{aiStats ? Math.round(aiStats.avgInterval) + ' days' : '--'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Stat Cards Grid */}
                        <div className="flex-[2] min-w-[340px] max-w-[600px] grid grid-cols-2 gap-8">
                            {/* Next Session */}
                            <div className="bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 min-w-[180px] min-h-[170px] hover:scale-[1.03] transition-transform">
                                <div className="bg-white shadow-md rounded-full p-4 mb-4">
                                    <Calendar className="text-indigo-500" size={32} />
                                </div>
                                <div className="text-base text-gray-500 font-medium mb-1">Next session</div>
                                <div className="text-2xl font-extrabold text-indigo-700">{nextSession ? format(new Date(nextSession.date), 'MMMM d, yyyy') : '—'}</div>
                            </div>
                            {/* Total Sessions */}
                            <div className="bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 min-w-[180px] min-h-[170px] hover:scale-[1.03] transition-transform">
                                <div className="bg-white shadow-md rounded-full p-4 mb-4">
                                    <Clock className="text-indigo-500" size={32} />
                                </div>
                                <div className="text-base text-gray-500 font-medium mb-1">Total sessions</div>
                                <div className="text-2xl font-extrabold text-indigo-700">{sessions.length}</div>
                            </div>
                            {/* First Appointment */}
                            <div className="bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 min-w-[180px] min-h-[170px] hover:scale-[1.03] transition-transform">
                                <div className="bg-white shadow-md rounded-full p-4 mb-4">
                                    <Calendar className="text-indigo-500" size={32} />
                                </div>
                                <div className="text-base text-gray-500 font-medium mb-1">First appointment</div>
                                <div className="text-2xl font-extrabold text-indigo-700">{firstAppointmentDate && format(new Date(firstAppointmentDate), 'MMMM d, yyyy')}</div>
                            </div>
                            {/* Client For */}
                            <div className="bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 min-w-[180px] min-h-[170px] hover:scale-[1.03] transition-transform">
                                <div className="bg-white shadow-md rounded-full p-4 mb-4">
                                    <Clock className="text-indigo-500" size={32} />
                                </div>
                                <div className="text-base text-gray-500 font-medium mb-1">Client for</div>
                                <div className="text-2xl font-extrabold text-indigo-700">{firstAppointmentDate && calculateClientDuration(firstAppointmentDate)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Timeline Section */}
                {selectedTab === 'timeline' && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Session Booking Trends</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={sessionTotalData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#4C5AE3"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    <Tooltip formatter={(value) => [`${value} sessions`, 'Total Bookings']} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl shadow p-6 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                    <Calendar className="text-indigo-500" size={28} />
                                    Session Timeline
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">View and filter all client sessions at a glance.</p>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
                                {/* Dropdown for order/cancelled */}
                                <div className="relative">
                                    <select
                                        className="appearance-none px-4 py-2 rounded-lg border font-medium bg-white text-gray-700 border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-400"
                                        value={timelineFilter}
                                        onChange={e => setTimelineFilter(e.target.value)}
                                    >
                                        <option value="latest">Latest to Earliest</option>
                                        <option value="earliest">Earliest to Latest</option>
                                        <option value="latest-cancelled">Show Cancelled (Latest First)</option>
                                        <option value="earliest-cancelled">Show Cancelled (Earliest First)</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </span>
                                </div>

                                {/* Year search */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={yearSearch}
                                        onChange={e => setYearSearch(e.target.value)}
                                        placeholder="Date (e.g. 2023-01-01)"
                                    />
                                    <span className="text-gray-400">
                                        <Calendar size={18} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            className={`mb-4 px-4 py-2 rounded-lg border font-medium transition-colors ${showCancelled ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                            onClick={() => setShowCancelled((prev) => !prev)}
                        >
                            {showCancelled ? 'Show Only Non-Cancelled Sessions' : 'Show All Sessions (Including Cancelled)'}
                        </button>

                        <div className="relative pl-8 before:absolute before:top-0 before:left-4 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-indigo-200 before:to-indigo-400">
                            {sessionsToShow.map((session, idx) => {
                                // Determine status and color
                                const isPast = new Date(session.date) < new Date();
                                const isCancelled = (session.statusOfAppointment || session.status) === 'cancelled';
                                const isUpcoming = !isPast && !isCancelled;
                                let dotColor = isCancelled
                                    ? 'bg-red-400'
                                    : isPast
                                        ? 'bg-gray-400'
                                        : 'bg-indigo-500';

                                let icon = isCancelled
                                    ? <X className="text-white" size={18} />
                                    : isPast
                                        ? <CheckCircle className="text-white" size={18} />
                                        : <Calendar className="text-white" size={18} />;

                                return (
                                    <div key={session._id || idx} className="relative mb-8 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${dotColor} border-4 border-white z-10 transition-transform group-hover:scale-110`}>
                                            {icon}
                                        </div>
                                        {/* Note Indicator Badge */}
                                        {notes.some(note => note.appointmentId === session._id) && (
                                            <div className="absolute left-10 top-2 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center z-10">
                                                <FileText className="text-indigo-600" size={14} />
                                            </div>
                                        )}
                                        {/* Card */}
                                        <div className={`ml-12 p-4 rounded-xl shadow transition-all border
                                        ${isCancelled
                                                ? 'bg-red-50 border-red-200'
                                                : isPast
                                                    ? 'bg-gray-50 border-gray-100'
                                                    : 'bg-indigo-50 border-indigo-200'
                                            }
                                        group-hover:shadow-lg
                                    `}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {new Date(session.date).toLocaleDateString()} at {session.time}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Type: {session.type} session
                                                    </p>
                                                </div>
                                                {isCancelled && (
                                                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">Cancelled</span>
                                                )}
                                                {isUpcoming && (
                                                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">Upcoming</span>
                                                )}
                                                {isPast && !isCancelled && (
                                                    <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold">Past</span>
                                                )}
                                            </div>
                                            {/* Session Notes */}
                                            {isPast && !isCancelled && (
                                                <div className="mt-4">
                                                    {notes
                                                        .filter(note => note.appointmentId === session._id)
                                                        .map(note => (
                                                            <div
                                                                key={note._id}
                                                                className="mt-2 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                                                                onClick={() => {
                                                                    setEditingNote(note);
                                                                    setShowNoteEditor(true);
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="text-indigo-500" size={16} />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {note.templateUsed}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronDown className="text-gray-400" size={16} />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                                        {note.content}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    {notes.filter(note => note.appointmentId === session._id).length === 0 && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingNote(null);
                                                                setShowNoteEditor(true);
                                                                setSelectedSessionId(session._id);
                                                            }}
                                                            className="mt-2 w-full px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={16} />
                                                            <span>Add Note to this Appointment</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {/* Details on expand */}
                                            {expandedSession === session._id && (
                                                <div className="mt-4 border-t pt-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-medium text-gray-700">Session Notes</h4>
                                                        <span className="text-xs text-gray-500">
                                                            {notes.filter(note => note.appointmentId === session._id).length} notes
                                                        </span>
                                                    </div>
                                                    {notes
                                                        .filter(note => note.appointmentId === session._id)
                                                        .map(note => (
                                                            <div
                                                                key={note._id}
                                                                className="mb-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                                                onClick={() => {
                                                                    setEditingNote(note);
                                                                    setShowNoteEditor(true);
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="text-indigo-500" size={16} />
                                                                        <span className="font-medium text-gray-800">
                                                                            {note.templateUsed}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(note.date).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {note.content}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    {notes.filter(note => note.appointmentId === session._id).length === 0 && (
                                                        <div className="text-center py-4">
                                                            <p className="text-sm text-gray-500 mb-3">No notes for this session</p>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingNote(null);
                                                                    setShowNoteEditor(true);
                                                                    setSelectedSessionId(session._id);
                                                                }}
                                                                className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2 mx-auto"
                                                            >
                                                                <Plus size={16} />
                                                                <span>Add Note to this Appointment</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                                                className="absolute right-4 top-4 text-indigo-600 hover:text-indigo-800"
                                            >
                                                {expandedSession === session._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredSessions.length > 6 && (
                            <button
                                className="mt-4 px-4 py-2 rounded-lg border font-medium bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                onClick={() => setShowAllSessions(v => !v)}
                            >
                                {showAllSessions ? 'Show Less' : `Show All (${filteredSessions.length})`}
                            </button>
                        )}
                    </div>
                )}

                {/* Notes Section */}
                {selectedTab === 'notes' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Client Notes</h2>
                            <button
                                onClick={() => {
                                    setEditingNote(null);
                                    setShowNoteEditor(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                            >
                                <Plus size={16} />
                                <span>Add Note</span>
                            </button>
                        </div>

                        <NoteList
                            notes={notes}
                            onPinNote={handlePinNote}
                            onDeleteNote={handleDeleteNote}
                            onEditNote={handleEditNote}
                            searchQuery={searchQuery}
                            sessions={sessions}
                        />
                    </div>
                )}
            </div>

            {showNoteEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
                        <NoteEditor
                            onSave={editingNote ? handleUpdateNote : handleAddNote}
                            onCancel={() => {
                                setShowNoteEditor(false);
                                setEditingNote(null);
                                setSelectedSessionId(null);
                            }}
                            initialContent={editingNote?.content}
                            isEditing={!!editingNote}
                            template={editingNote && editingNote.fields ? clientNoteTemplates.find(t => t.name === editingNote.templateUsed) : null}
                            psychometricTools={psychometricTools}
                            clientNoteTemplates={clientNoteTemplates}
                            appointments={sessions}
                            clientId={id}
                            selectedSessionId={selectedSessionId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetail;