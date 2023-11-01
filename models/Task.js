const { Schema, model } = require('mongoose');

const taskSchema = new Schema({
    task: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: Schema.Types.ObjectId,
        refs: "users",
    }
}, {
    timestamps: true
});

taskSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

const taskModel = model("tasks", taskSchema);

module.exports = {
    taskModel
}