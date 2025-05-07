import React, { useContext, useState, useEffect } from 'react';
import { TherapistContext } from '../../context/TherapistContext';
import { toast } from 'react-toastify';
import { Calendar, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const RecurringSchedule = () => {
    const {
        recurringSchedules,
        saveRecurringAvailability,
        updateRecurringSchedule,
        fetchRecurringSchedules
    } = useContext(TherapistContext);

    const [formData, setFormData] = useState({
        days: [],
        startTime: '',
        endTime: '',
        type: 'online',
        breaks: [],
        startDate: '',
        endDate: '',
        types: ['Online', 'In-Person']
    });

    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showBreakForm, setShowBreakForm] = useState(false);
    const [breakForm, setBreakForm] = useState({
        start: '',
        end: '',
        label: ''
    });

    const [showSchedules, setShowSchedules] = useState(true);

    useEffect(() => {
        fetchRecurringSchedules();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const handleBreakAdd = () => {
        if (!breakForm.start || !breakForm.end) {
            toast.error('Please fill in break start and end times');
            return;
        }

        setFormData(prev => ({
            ...prev,
            breaks: [...prev.breaks, { ...breakForm }]
        }));
        setBreakForm({ start: '', end: '', label: '' });
        setShowBreakForm(false);
    };

    const handleBreakRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            breaks: prev.breaks.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.days.length) {
            toast.error('Please select at least one day');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            toast.error('Please set start and end times');
            return;
        }

        if (!formData.startDate) {
            toast.error('Please set a start date');
            return;
        }

        const dayNameToNum = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6
        };

        const payload = {
            ...formData,
            days: formData.days.map(d => typeof d === 'string' ? dayNameToNum[d] : d),
            interval: formData.interval || 60, // default to 60 if not set
            types: formData.types,
            // Remove 'type' if present
        };
        delete payload.type;

        try {
            if (editingSchedule) {
                await updateRecurringSchedule(editingSchedule._id, payload);
                toast.success('Schedule updated successfully');
            } else {
                await saveRecurringAvailability(payload);
                toast.success('Schedule created successfully');
            }
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving schedule');
        }
    };

    const handleEdit = (schedule) => {
        // Convert numeric days to day names if needed
        const numToDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const daysAsNames = (schedule.days || []).map(d => typeof d === 'number' ? numToDay[d] : d);

        setEditingSchedule(schedule);
        setFormData({
            name: schedule.name || '',
            days: daysAsNames,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            type: schedule.type,
            breaks: schedule.breaks || [],
            startDate: schedule.startDate ? schedule.startDate.slice(0, 10) : '',
            endDate: schedule.endDate ? schedule.endDate.slice(0, 10) : '',
            types: schedule.types || ['Online', 'In-Person'],
            interval: schedule.interval || 60,
        });
    };

    const resetForm = () => {
        setFormData({
            days: [],
            startTime: '',
            endTime: '',
            type: 'online',
            breaks: [],
            startDate: '',
            endDate: '',
            types: ['Online', 'In-Person']
        });
        setEditingSchedule(null);
    };

    // Helper to generate hour options
    const hourOptions = Array.from({ length: 15 }, (_, i) => {
        const hour = 7 + i; // 7 to 21
        const label = new Date(0, 0, 0, hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const value = `${hour.toString().padStart(2, '0')}:00`;
        return { value, label };
    });

    // For breaks, allow 30-min increments if desired
    const breakOptions = Array.from({ length: 15 }, (_, i) => {
        const hour = 7 + i;
        return [
            { value: `${hour.toString().padStart(2, '0')}:00`, label: `${hour}:00` },
            { value: `${hour.toString().padStart(2, '0')}:30`, label: `${hour}:30` }
        ];
    }).flat();

    // Default breaks
    const defaultBreaks = [
        { label: 'Lunch Break', start: '12:00', end: '13:00' },
        { label: 'Tea Break', start: '15:00', end: '16:00' }
    ];

    function generatePreviewSlots(form) {
        // Only preview up to 7 days for performance
        if (!form.days.length || !form.startTime || !form.endTime || !form.startDate) return [];
        const dayNameToNum = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6
        };
        const daysNum = form.days.map(d => dayNameToNum[d]);
        const startDate = new Date(form.startDate);
        const endDate = form.endDate ? new Date(form.endDate) : new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 1 week preview
        const breaks = form.breaks || [];
        const slots = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (daysNum.includes(d.getDay())) {
                const dateStr = d.toISOString().split('T')[0];
                let [startHour, startMinute] = form.startTime.split(':').map(Number);
                let [endHour, endMinute] = form.endTime.split(':').map(Number);
                let current = startHour * 60 + startMinute;
                const end = endHour * 60 + endMinute;
                while (current < end) {
                    const hour = Math.floor(current / 60);
                    const minute = current % 60;
                    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    // Check if in break
                    const isBreak = breaks.some(b => {
                        const [bsh, bsm] = b.start.split(':').map(Number);
                        const [beh, bem] = b.end.split(':').map(Number);
                        const bstart = bsh * 60 + bsm;
                        const bend = beh * 60 + bem;
                        return current >= bstart && current < bend;
                    });
                    if (!isBreak) {
                        slots.push({
                            date: dateStr,
                            time: timeStr,
                            type: form.type === 'in-person' ? 'In-Person' : 'Online'
                        });
                    }
                    current += 60; // 1 hour interval
                }
            }
        }
        return slots;
    }

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-[#f7f8fa] rounded-3xl min-h-screen">
            {/* Existing Schedules */}
            {recurringSchedules && recurringSchedules.length > 0 && (
                <div className="p-2  mb-10">
                    <div className="flex items-center p-4 gap-2 mb-0 bg-[#f7f8fa] rounded-xl shadow-sm">
                        <h3 className="text-2xl font-bold text-primary">Existing Schedules</h3>
                        <button
                            className="ml-2 px-4 py-1 rounded-full bg-primary text-white font-semibold text-base flex items-center gap-1 shadow hover:bg-[#4C5AE3] transition-all"
                            onClick={() => setShowSchedules(v => !v)}
                        >
                            {showSchedules ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            {showSchedules ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <hr className="my-2 border-gray-200" />
                    {showSchedules && (
                        <div className="space-y-5 mt-2">
                            {recurringSchedules.map((schedule) => {
                                // Map days to names
                                const numToDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                const dayNames = (schedule.days || []).map(d => typeof d === 'number' ? numToDay[d] : d).join(', ');
                                // Calculate sessions per day (excluding breaks)
                                const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                                const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                                const interval = schedule.interval || 60;
                                const breaks = schedule.breaks || [];
                                let sessionCount = 0;
                                let current = startHour * 60 + startMinute;
                                const end = endHour * 60 + endMinute;
                                while (current < end) {
                                    // Check if in break
                                    const isBreak = breaks.some(b => {
                                        const [bsh, bsm] = b.start.split(':').map(Number);
                                        const [beh, bem] = b.end.split(':').map(Number);
                                        const bstart = bsh * 60 + bsm;
                                        const bend = beh * 60 + bem;
                                        return current >= bstart && current < bend;
                                    });
                                    if (!isBreak) sessionCount++;
                                    current += interval;
                                }
                                // Types as pill badges
                                const typesArr = schedule.types || [];
                                return (
                                    <div
                                        key={schedule._id}
                                        className="relative flex flex-col md:flex-row items-start md:items-center bg-white rounded-xl shadow border-l-4 border-primary/80 p-4 md:p-6 transition-all hover:shadow-lg group"
                                    >
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-extrabold text-lg md:text-xl text-primary leading-tight">{schedule.name || 'Untitled Schedule'}</span>
                </div>
                                            <div className="flex flex-wrap items-center gap-4 mb-1">
                                                <span className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-800">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    {dayNames}
                                                </span>
                                                <span className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-700">
                                                    <Clock className="w-5 h-5 text-primary/80" />
                                                    {schedule.startTime} - {schedule.endTime}
                                                </span>
                                </div>
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <span className="text-sm md:text-base text-gray-600 font-medium">
                                                    <span className="text-primary font-bold text-lg md:text-xl">{sessionCount}</span> sessions/day
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    {typesArr.map(type => (
                                                        <span key={type} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm md:text-base shadow-sm border border-primary/20">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                            {schedule.breaks && schedule.breaks.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {schedule.breaks.map((b, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-[#eaf0fa] text-primary font-medium text-xs md:text-sm border border-primary/10">
                                                            {b.label || 'Break'} <span className="mx-1">({b.start}-{b.end})</span>
                                                    </span>
                                                    ))}
                                                </div>
                                            )}
                                                </div>
                                                    <button
                                            onClick={() => handleEdit(schedule)}
                                            className="ml-auto mt-4 md:mt-0 px-5 py-2 rounded-full bg-primary text-white font-bold text-base shadow-md hover:bg-[#4C5AE3] transition-all focus:ring-2 focus:ring-primary focus:outline-none"
                                        >
                                            Edit
                                                    </button>
                                                </div>
                                );
                            })}
                                </div>
                            )}
                    </div>
                )}
            {/* Create Recurring Schedule Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto mt-10 mb-10">
                <h2 className="text-3xl font-bold mb-8 text-primary">{editingSchedule ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}</h2>
                <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Schedule Name */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Schedule Name
                        </label>
                                <input
                                    type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Morning Sessions, Weekend Only, etc."
                            className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            required
                        />
                    </div>
                    {/* Days Selection */}
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Select Days
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-5 py-2 rounded-xl transition text-lg font-semibold shadow-sm border ${formData.days.includes(day)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'} focus:outline-none`}
                                >
                                    {day}
                                            </button>
                                        ))}
                                    </div>
                    </div>
                    {/* Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">
                                Start Time
                            </label>
                                            <select
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="w-full px-5 py-3 border rounded-xl text-lg"
                                required
                            >
                                <option value="">Select start time</option>
                                {hourOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                                            </select>
                                    </div>
                                    <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">
                                End Time
                            </label>
                                        <select
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="w-full px-5 py-3 border rounded-xl text-lg"
                                required
                            >
                                <option value="">Select end time</option>
                                {hourOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                                        </select>
                                    </div>
                    </div>
                    {/* Session Types */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Session Types
                        </label>
                        <div className="flex gap-6">
                            {['Online', 'In-Person'].map(type => (
                                <label key={type} className="flex items-center gap-2 text-lg font-medium px-5 py-2 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all shadow-sm">
                                    <input
                                        type="checkbox"
                                        checked={formData.types?.includes(type)}
                                        onChange={e => {
                                            setFormData(prev => ({
                                                ...prev,
                                                types: e.target.checked
                                                    ? [...(prev.types || []), type]
                                                    : (prev.types || []).filter(t => t !== type)
                                            }));
                                        }}
                                        className="accent-primary w-6 h-6 rounded focus:ring-2 focus:ring-primary border-gray-300"
                                    />
                                    <span>{type}</span>
                                </label>
                                        ))}
                                    </div>
                    </div>
                                {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                                        <input
                                            type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                                                    />
                                                </div>
                                                <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">
                                End Date (Optional)
                            </label>
                                                    <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                    {/* Breaks */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-base font-medium text-gray-700">
                                Breaks
                            </label>
                                                <button
                                type="button"
                                onClick={() => setShowBreakForm(true)}
                                className="text-primary hover:text-[#4C5AE3] px-4 py-2 rounded-xl font-semibold text-base bg-primary/10 border border-primary/20 shadow-sm"
                                                >
                                + Add Break
                                                </button>
                                            </div>
                        {formData.breaks.map((break_, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-[#eaf0fa] text-primary font-medium text-sm md:text-base border border-primary/10 mr-2 mb-2">
                                {break_.label || 'Break'}: {break_.start} - {break_.end}
                                <button
                                    type="button"
                                    onClick={() => handleBreakRemove(index)}
                                    className="ml-2 text-red-500 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                                        </div>
                    {/* Default Breaks */}
                    <div className="flex gap-2 mb-2">
                        {defaultBreaks.map(b => (
                                                    <button
                                key={b.label}
                                type="button"
                                className="px-3 py-1 bg-[#eaf0fa] rounded-full hover:bg-primary/10 text-primary text-sm font-semibold border border-primary/10"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    breaks: [...prev.breaks, b]
                                }))}
                            >
                                + {b.label} ({b.start}-{b.end})
                                                    </button>
                                        ))}
                                    </div>
                    {/* Session Interval */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Session Interval
                        </label>
                                    <select
                            name="interval"
                            value={formData.interval || 60}
                            onChange={handleInputChange}
                            className="w-full px-5 py-3 border rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                            required
                        >
                            <option value={60}>60 minutes</option>
                            <option value={120}>120 minutes</option>
                                    </select>
                                </div>
                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        {editingSchedule && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold text-base border border-gray-300 bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                            <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-base shadow-md hover:bg-[#4C5AE3] focus:ring-2 focus:ring-primary"
                        >
                            {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                            </button>
                    </div>
                </form>
            </div>
            {/* Slot Preview */}
            <div className="mt-12 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-primary">Preview of Generated Schedule</h3>
                {formData.days.length > 0 && formData.startTime && formData.endTime && formData.startDate ? (() => {
                    // Calculate how many days this schedule applies to
                    const dayNameToNum = {
                        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
                        Thursday: 4, Friday: 5, Saturday: 6
                    };
                    const daysNum = formData.days.map(d => dayNameToNum[d]);
                    const startDate = new Date(formData.startDate);
                    const endDate = formData.endDate ? new Date(formData.endDate) : new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                    let count = 0;
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        if (daysNum.includes(d.getDay())) count++;
                    }

                    // Find the next applicable day for preview
                    let previewDate = null;
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        if (daysNum.includes(d.getDay())) {
                            previewDate = new Date(d);
                            break;
                        }
                    }
                    if (!previewDate) return <div className="text-gray-400">No applicable days in selected range.</div>;
                    const previewDateStr = previewDate.toISOString().split('T')[0];

                    // Generate slots and breaks for that day
                    let [startHour, startMinute] = formData.startTime.split(':').map(Number);
                    let [endHour, endMinute] = formData.endTime.split(':').map(Number);
                    let current = startHour * 60 + startMinute;
                    const end = endHour * 60 + endMinute;
                    const breaks = formData.breaks || [];
                    const timeline = [];
                    while (current < end) {
                        // Check if this time is a break start
                        const breakNow = breaks.find(b => {
                            const [bsh, bsm] = b.start.split(':').map(Number);
                            return current === bsh * 60 + bsm;
                        });
                        if (breakNow) {
                            timeline.push({
                                type: 'break',
                                start: breakNow.start,
                                end: breakNow.end,
                                label: breakNow.label || 'Break'
                            });
                            // Skip to end of break
                            const [beh, bem] = breakNow.end.split(':').map(Number);
                            current = beh * 60 + bem;
                            continue;
                        }
                        // Otherwise, it's a slot
                        const hour = Math.floor(current / 60);
                        const minute = current % 60;
                        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        // Check if in any break
                        const isInBreak = breaks.some(b => {
                            const [bsh, bsm] = b.start.split(':').map(Number);
                            const [beh, bem] = b.end.split(':').map(Number);
                            const bstart = bsh * 60 + bsm;
                            const bend = beh * 60 + bem;
                            return current >= bstart && current < bend;
                        });
                        if (!isInBreak) {
                            timeline.push({
                                type: 'slot',
                                time: timeStr,
                                label: formData.type === 'in-person' ? 'In-Person' : 'Online'
                            });
                        }
                        current += 60;
                    }

                    return (
                        <>
                            <div className="mb-4 text-gray-700">
                                <span className="font-semibold">{count}</span> day{count !== 1 ? 's' : ''} will have this schedule between <span className="font-semibold">{formData.startDate}</span> and <span className="font-semibold">{formData.endDate || previewDateStr}</span>.
                            </div>
                            <div className="font-bold text-primary mb-3 flex items-center gap-2 text-lg">
                                <Calendar className="w-5 h-5" /> {previewDateStr}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {timeline.map((item, idx) =>
                                    item.type === 'slot' ? (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-4 py-3 border border-gray-100 hover:shadow-md transition"
                                        >
                                            <Clock className="w-5 h-5 text-green-500" />
                                            <span className="font-semibold text-lg">{item.time}</span>
                                            <span className="text-gray-500 text-base">{item.label}</span>
                                        </div>
                                    ) : (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 bg-yellow-50 rounded-xl shadow-sm px-4 py-3 border border-yellow-200 hover:shadow-md transition"
                                        >
                                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                                            <span className="font-semibold text-base">{item.start} - {item.end}</span>
                                            <span className="text-yellow-700 text-base">{item.label}</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    );
                })() : (
                    <div className="text-gray-400">Select days, start/end time, and start date to preview slots.</div>
                )}
            </div>
        </div>
    );
};

export default RecurringSchedule; 