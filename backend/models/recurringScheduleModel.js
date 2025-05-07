import mongoose from "mongoose";

const recurringScheduleSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    days: {
        type: [Number],
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    interval: {
        type: Number,
        default: 90, // 60 min session + 30 min break
    },
    types: {
        type: [String],
        enum: ["Online", "In-Person"],
        required: true,
    },
    breaks: [{
        start: String,
        end: String,
        label: String
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastGeneratedDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Add method to generate availability slots
recurringScheduleSchema.methods.generateAvailabilitySlots = async function () {
    const slots = [];
    const currentDate = new Date(this.startDate);
    const endDate = this.endDate || new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000));

    while (currentDate <= endDate) {
        if (this.days.includes(currentDate.getDay())) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const [startHour, startMinute] = this.startTime.split(':').map(Number);
            const [endHour, endMinute] = this.endTime.split(':').map(Number);

            let currentTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;

            while (currentTime < endTime) {
                const hour = Math.floor(currentTime / 60);
                const minute = currentTime % 60;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                // Check if time is within any break
                const isBreakTime = this.breaks.some(breakTime => {
                    const [breakStartHour, breakStartMinute] = breakTime.start.split(':').map(Number);
                    const [breakEndHour, breakEndMinute] = breakTime.end.split(':').map(Number);
                    const breakStart = breakStartHour * 60 + breakStartMinute;
                    const breakEnd = breakEndHour * 60 + breakEndMinute;
                    return currentTime >= breakStart && currentTime < breakEnd;
                });

                if (!isBreakTime) {
                    for (const type of this.types) {
                        slots.push({
                            therapistId: this.therapistId,
                            date: dateStr,
                            time: timeStr,
                            type,
                            isBooked: false,
                            recurringScheduleId: this._id,
                            isRecurring: true
                        });
                    }
                }
                currentTime += this.interval;
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
};

const RecurringScheduleModel = mongoose.models.recurringSchedule
    || mongoose.model("recurringSchedule", recurringScheduleSchema);

export default RecurringScheduleModel; 