const mongoose = require('mongoose');

const maintenanceBillSchema = new mongoose.Schema({
    billSubject: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true, // This will add createdAt and updatedAt timestamps
});

const MaintenanceBill = mongoose.model('MaintenanceBill', maintenanceBillSchema);

module.exports = MaintenanceBill;
