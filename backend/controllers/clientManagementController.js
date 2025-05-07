import ClientNote from '../models/clientNoteModel.js';
import NoteTemplate from '../models/noteTemplateModel.js';
import ClientGoal from '../models/clientGoalModel.js';
import ClientProgress from '../models/clientProgressModel.js';
import ClientSession from '../models/clientSessionModel.js';
import appointmentsModel from '../models/appointmentsModel.js';

// Get all clients for a therapist
export const getTherapistClients = async (req, res) => {
    try {
        const therapistId = req.body.userId;

        // Get all appointments for the therapist
        const appointments = await appointmentsModel.find({ therapistID: therapistId })
            .populate('clientID', 'firstName lastName universityName email phone')
            .sort({ date: -1 });

        // Get all client goals
        const goals = await ClientGoal.find({ therapistId })
            .select('clientId title status');

        // Group appointments by client
        const clientsMap = new Map();

        appointments.forEach(appointment => {
            const client = appointment.clientID;
            const clientId = client._id.toString();

            if (!clientsMap.has(clientId)) {
                clientsMap.set(clientId, {
                    id: client._id,
                    name: `${client.firstName} ${client.lastName}`,
                    university: client.universityName,
                    status: 'Ongoing',
                    lastSession: appointment.date,
                    totalSessions: 1,
                    upcomingSessions: appointment.statusOfAppointment === 'upcoming' ? 1 : 0,
                    goals: goals.filter(g => g.clientId.toString() === clientId)
                        .map(g => g.title),
                    notes: []
                });
            } else {
                const clientData = clientsMap.get(clientId);
                clientData.totalSessions++;
                if (appointment.statusOfAppointment === 'upcoming') {
                    clientData.upcomingSessions++;
                }
            }
        });

        res.json({
            success: true,
            clients: Array.from(clientsMap.values())
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get client details with notes and sessions
export const getClientDetails = async (req, res) => {
    try {
        const { clientId } = req.params;
        const therapistId = req.body.userId;

        // Get client info from appointments
        const client = await appointmentsModel.findOne({ clientID: clientId })
            .populate('clientID', 'firstName lastName universityName email phone');

        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        // Get all sessions
        const appointments = await appointmentsModel.find({
            clientID: clientId,
            therapistID: therapistId
        }).sort({ date: 1 });

        // Map appointments to a session-like structure for the frontend
        const sessions = appointments.map(app => ({
            _id: app._id,
            date: app.date,
            time: app.timeSlot?.startTime || '',
            type: app.typeOfAppointment,
            status: app.statusOfAppointment,
            notes: null
        }));

        // Get all notes with proper population
        const notes = await ClientNote.find({
            clientId,
            therapistId
        })
            .sort({ createdAt: -1 })
            .lean();

        // Get all goals
        const goals = await ClientGoal.find({
            clientId,
            therapistId
        }).sort({ createdAt: -1 });

        // Get all progress records
        const progress = await ClientProgress.find({
            clientId,
            therapistId
        }).sort({ date: -1 });

        // Get all templates
        const templates = await NoteTemplate.find({
            createdBy: therapistId,
            status: 'active'
        });

        res.json({
            success: true,
            client: {
                id: client.clientID._id,
                name: `${client.clientID.firstName} ${client.clientID.lastName}`,
                university: client.clientID.universityName,
                email: client.clientID.email,
                phone: client.clientID.phone,
                status: 'Ongoing',
                sessions: sessions,
                notes: notes,
                goals: goals,
                progress: progress,
                templates: templates
            }
        });
    } catch (error) {
        console.error('Error in getClientDetails:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add/Update client note
export const manageClientNote = async (req, res) => {
    try {
        const therapistId = req.user?._id || req.user?.id || req.body.userId;
        const {
            clientId,
            content,
            templateUsed,
            fields,
            appointmentId,
            date,
            title,
            type,
            tags,
            templateId,
            templateName
        } = req.body;

        if (!clientId || !therapistId) {
            return res.status(400).json({ success: false, message: "clientId and therapistId are required" });
        }

        // For template-based notes, content is not required
        if (!templateId && !content) {
            return res.status(400).json({ success: false, message: "Content is required for non-template notes" });
        }

        // Create note content from template fields if using a template
        let noteContent = content;
        if (templateId && fields) {
            noteContent = Object.entries(fields)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n\n');
        }

        const note = new ClientNote({
            clientId,
            therapistId,
            content: noteContent,
            templateUsed: templateName || templateUsed || "General",
            fields: fields || {},
            appointmentId,
            date: date || new Date(),
            title,
            type,
            tags
        });

        await note.save();
        res.json({ success: true, note });
    } catch (error) {
        console.error('Error in manageClientNote:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manage note templates
export const manageNoteTemplate = async (req, res) => {
    try {
        const therapistId = req.user?._id || req.body.userId;
        const { name, type, fields, description } = req.body;

        if (!name || !type || !fields || !Array.isArray(fields) || !therapistId) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, type, fields, or therapistId" });
        }

        const template = new NoteTemplate({
            name,
            type,
            fields,
            description,
            createdBy: therapistId
        });

        await template.save();
        res.json({ success: true, template });
    } catch (error) {
        console.error('Error in manageNoteTemplate:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manage client goals
export const manageClientGoal = async (req, res) => {
    try {
        const { clientId, title, description, targetDate, milestones } = req.body;
        const therapistId = req.body.userId;

        const goal = new ClientGoal({
            clientId,
            therapistId,
            title,
            description,
            targetDate,
            milestones
        });

        await goal.save();
        res.json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add client progress
export const addClientProgress = async (req, res) => {
    try {
        const { clientId, date, metrics, notes, assessmentType, scores } = req.body;
        const therapistId = req.body.userId;

        const progress = new ClientProgress({
            clientId,
            therapistId,
            date,
            metrics,
            notes,
            assessmentType,
            scores
        });

        await progress.save();
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
