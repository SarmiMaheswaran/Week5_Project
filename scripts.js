const doctors = [
    { id: 1, name: "Dr. Smith", totalSlots: 10, availableSlots: 10, bookedSlots: 0, bookedTimes: [] },
    { id: 2, name: "Dr. Johnson", totalSlots: 10, availableSlots: 10, bookedSlots: 0, bookedTimes: [] }
];

let appointments = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDoctors();
    loadTimeSlots();
    document.getElementById("booking-form").addEventListener("submit", bookAppointment);
    document.getElementById("cancellation-form").addEventListener("submit", cancelAppointment);
    document.getElementById("view-appointments-btn").addEventListener("click", viewAppointments);
    document.getElementById("appointment-date").setAttribute("min", new Date().toISOString().split("T")[0]);
});

function loadDoctors() {
    const doctorSelection = document.getElementById("doctor-selection");
    const doctorsList = document.getElementById("doctors-list");

    doctorSelection.innerHTML = '<option value="">Select a doctor</option>';
    doctorsList.innerHTML = '';

    doctors.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelection.appendChild(option);

        const doctorCard = document.createElement("div");
        doctorCard.className = "doctor-card";
        doctorCard.innerHTML = `
            <h3>${doctor.name}</h3>
            <p>Total Slots: ${doctor.totalSlots}</p>
            <p>Available Slots: ${doctor.availableSlots}</p>
            <p>Booked Slots: ${doctor.bookedSlots}</p>
            <div class="slots">${generateSlots(doctor.totalSlots, doctor.bookedSlots, doctor.bookedTimes)}</div>
        `;
        doctorsList.appendChild(doctorCard);
    });
}

function generateSlots(total, booked, bookedTimes) {
    let slots = '';
    for (let i = 0; i < total; i++) {
        const slotTime = `${String(9 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`;
        const isBooked = bookedTimes.includes(slotTime);
        slots += `<div class="slot ${isBooked ? 'booked' : ''}" data-message="${isBooked ? 'Booked' : 'Available'}">${formatTime(slotTime)}</div>`;
    }
    return slots;
}

function formatTime(time) {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
}

function loadTimeSlots() {
    const appointmentTime = document.getElementById("appointment-time");
    appointmentTime.innerHTML = '';

    for (let h = 9; h <= 11; h++) {
        for (let m = 0; m < 60; m += 15) {
            if (h === 11 && m > 15) break; // Stop at 11:15 AM
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const option = document.createElement("option");
            option.value = time;
            option.textContent = formatTime(time);
            appointmentTime.appendChild(option);
        }
    }
}

function bookAppointment(event) {
    event.preventDefault();

    const patientName = document.getElementById("patient-name").value;
    const doctorId = parseInt(document.getElementById("doctor-selection").value);
    const appointmentDate = document.getElementById("appointment-date").value;
    const appointmentTime = document.getElementById("appointment-time").value;

    if (!patientName || !doctorId || !appointmentDate || !appointmentTime) {
        alert("Please fill out all fields");
        return;
    }

    const selectedDate = new Date(appointmentDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (selectedDate < currentDate) {
        alert("Appointment date cannot be in the past");
        return;
    }

    const [hour, minute] = appointmentTime.split(':').map(Number);
    if (hour > 11 || (hour === 11 && minute > 15)) {
        alert("Doctor not available beyond 11:15");
        return;
    }

    const doctor = doctors.find(doc => doc.id === doctorId);

    if (isSlotBooked(doctorId, appointmentDate, appointmentTime)) {
        alert("This time slot is already booked");
        return;
    }

    const appointmentId = `app-${appointments.length + 1}`;
    const newAppointment = { id: appointmentId, patientName, doctorId, doctorName: doctor.name, date: appointmentDate, time: appointmentTime };
    appointments.push(newAppointment);
    doctor.availableSlots--;
    doctor.bookedSlots++;
    doctor.bookedTimes.push(appointmentTime);

    document.getElementById("booking-form").reset();
    loadDoctors();
    alert("Appointment booked successfully");
}

function isSlotBooked(doctorId, date, time) {
    return appointments.some(app => app.doctorId === doctorId && app.date === date && app.time === time);
}

function cancelAppointment(event) {
    event.preventDefault();

    const appointmentId = document.getElementById("appointment-id").value;
    const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);

    if (appointmentIndex === -1) {
        alert("Appointment ID not found");
        return;
    }

    const appointment = appointments[appointmentIndex];
    const doctor = doctors.find(doc => doc.id === appointment.doctorId);

    doctor.availableSlots++;
    doctor.bookedSlots--;
    const bookedTimeIndex = doctor.bookedTimes.indexOf(appointment.time);
    if (bookedTimeIndex > -1) {
        doctor.bookedTimes.splice(bookedTimeIndex, 1);
    }

    appointments.splice(appointmentIndex, 1);
    loadDoctors();
    document.getElementById("cancellation-form").reset();
    alert("Appointment canceled successfully");
}

function viewAppointments() {
    const appointmentsList = document.getElementById("appointments-list");
    appointmentsList.innerHTML = '';

    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments available</p>';
        return;
    }

    appointments.forEach(app => {
        const appointmentItem = document.createElement("div");
        appointmentItem.className = "appointment-item";
        appointmentItem.innerHTML = `
            <p><strong>Appointment ID:</strong> ${app.id}</p>
            <p><strong>Patient Name:</strong> ${app.patientName}</p>
            <p><strong>Doctor Name:</strong> ${app.doctorName}</p>
            <p><strong>Date:</strong> ${app.date}</p>
            <p><strong>Time:</strong> ${formatTime(app.time)}</p>
        `;
        appointmentsList.appendChild(appointmentItem);
    });
}

