import add_icon from './add_icon.svg'
import admin_logo from './admin_logo.svg'
import appointment_icon from './appointment_icon.svg'
import cancel_icon from './cancel_icon.svg'
import doctor_icon from './doctor_icon.svg'
import home_icon from './home_icon.svg'
import people_icon from './people_icon.svg'
import upload_area from './upload_area.svg'
import list_icon from './list_icon.svg'
import tick_icon from './tick_icon.svg'
import appointments_icon from './appointments_icon.svg'
import earning_icon from './earning_icon.svg'
import patients_icon from './patients_icon.svg'
import student from './student.png'
import university from './uni.png'
import logo11 from './logo11.png'
import order_icon from './order_icon.png'

export const assets = {
    add_icon,
    admin_logo,
    appointment_icon,
    cancel_icon,
    doctor_icon,
    upload_area,
    home_icon,
    patients_icon,
    student,
    order_icon,
    people_icon,
    list_icon,
    tick_icon,
    appointments_icon,
    earning_icon,
    university,
    logo11
}
// Dummy Dashboard Data
export const dummyDashData = {
    doctors: 12,
    appointments: 45,
    patients: 230,
    latestAppointments: [
        {
            _id: '1',
            docData: {
                name: 'Dr. John Doe',
                image: doctor_icon
            },
            slotDate: new Date(),
            cancelled: false,
            isCompleted: true
        },
        {
            _id: '2',
            docData: {
                name: 'Dr. Sarah Smith',
                image: doctor_icon
            },
            slotDate: new Date(),
            cancelled: true,
            isCompleted: false
        },
        {
            _id: '3',
            docData: {
                name: 'Dr. Robert Brown',
                image: doctor_icon
            },
            slotDate: new Date(),
            cancelled: false,
            isCompleted: false
        },
        {
            _id: '4',
            docData: {
                name: 'Dr. Emma White',
                image: doctor_icon
            },
            slotDate: new Date(),
            cancelled: false,
            isCompleted: true
        },
        {
            _id: '5',
            docData: {
                name: 'Dr. William Black',
                image: doctor_icon
            },
            slotDate: new Date(),
            cancelled: true,
            isCompleted: false
        }
    ]
};

// Dummy Doctors Data
export const dummyDoctors = [
    {
        _id: '1',
        name: 'Dr. John Doe',
        speciality: 'Cardiologist',
        available: true,
        image: doctor_icon
    },
    {
        _id: '2',
        name: 'Dr. Sarah Smith',
        speciality: 'Dermatologist',
        available: false,
        image: doctor_icon
    },
    {
        _id: '3',
        name: 'Dr. Robert Brown',
        speciality: 'Neurologist',
        available: true,
        image: doctor_icon
    }
];

// Dummy Appointments Data
export const dummyAppointments = [
    {
        _id: '1',
        userData: {
            name: 'Alice Johnson',
            image: people_icon,
            dob: '1995-04-23'
        },
        slotDate: new Date(),
        slotTime: '10:30 AM',
        docData: {
            name: 'Dr. John Doe',
            image: doctor_icon
        },
        amount: 50,
        cancelled: false,
        isCompleted: true
    },
    {
        _id: '2',
        userData: {
            name: 'Bob Williams',
            image: people_icon,
            dob: '1988-11-15'
        },
        slotDate: new Date(),
        slotTime: '2:00 PM',
        docData: {
            name: 'Dr. Sarah Smith',
            image: doctor_icon
        },
        amount: 60,
        cancelled: true,
        isCompleted: false
    }
];