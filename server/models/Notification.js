import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 1000 },
    sent_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    created_at: { type: Date, default: Date.now },
});

const notificationReadSchema = new mongoose.Schema({
    notification_id: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read_at: { type: Date, default: Date.now },
});
notificationReadSchema.index({ notification_id: 1, user_id: 1 }, { unique: true });

const Notification = mongoose.model("Notification", notificationSchema);
const NotificationRead = mongoose.model("NotificationRead", notificationReadSchema);

export { Notification, NotificationRead };
