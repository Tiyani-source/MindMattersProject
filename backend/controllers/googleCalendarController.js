import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import doctorModel from '../models/doctorModel.js';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Sync with Google Calendar
export const syncGoogleCalendar = async (req, res) => {
    try {
        const { events } = req.body;
        const therapistId = req.body.userId;

        // Get therapist's Google Calendar credentials from database
        const therapist = await doctorModel.findById(therapistId);
        if (!therapist.googleCalendarToken) {
            return res.status(400).json({
                success: false,
                message: 'Google Calendar not connected. Please connect your Google Calendar first.'
            });
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: therapist.googleCalendarToken
        });

        // Create calendar instance
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Create events in Google Calendar
        const createdEvents = await Promise.all(
            events.map(async (event) => {
                try {
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        resource: event
                    });
                    return response.data;
                } catch (error) {
                    console.error('Error creating event:', error);
                    throw error;
                }
            })
        );

        res.status(200).json({
            success: true,
            message: 'Successfully synced with Google Calendar',
            events: createdEvents
        });
    } catch (error) {
        console.error('Error syncing with Google Calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync with Google Calendar',
            error: error.message
        });
    }
};

// Connect Google Calendar
export const connectGoogleCalendar = async (req, res) => {
    try {
        const therapistId = req.body.userId;

        // Generate OAuth URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ]
        });

        res.status(200).json({
            success: true,
            authUrl
        });
    } catch (error) {
        console.error('Error generating Google Calendar auth URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate Google Calendar auth URL',
            error: error.message
        });
    }
};

// Handle Google Calendar OAuth callback
export const handleGoogleCalendarCallback = async (req, res) => {
    try {
        const { code } = req.query;
        const therapistId = req.body.userId;

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Save tokens to therapist document
        await doctorModel.findByIdAndUpdate(therapistId, {
            googleCalendarToken: tokens.access_token,
            googleCalendarRefreshToken: tokens.refresh_token,
            googleCalendarConnected: true
        });

        res.status(200).json({
            success: true,
            message: 'Successfully connected Google Calendar'
        });
    } catch (error) {
        console.error('Error handling Google Calendar callback:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect Google Calendar',
            error: error.message
        });
    }
}; 