const { taskModel } = require('../models/Task');
const { userModel } = require('../models/User');
const { asyncErrorHandler } = require('./asyncErrorHandler');

const getAllTasks = asyncErrorHandler(async (req, res) => {
    let { _id } = req.user
    // console.log(_id)
    let allTasks = await taskModel.find({ userId: _id });
    res.status(200).json(
        {
            status: "success",
            count: allTasks.length,
            tasks: [...allTasks],
            message: "Finished setting up the tasks page. "
        });
})

const createTask = asyncErrorHandler(async (req, res) => {
    let { task } = req.body;
    let { _id } = req.user
    // console.log(req.user)
    // FIXME save unique tasks or save incomplete tasks

    let data = await taskModel.create({ userId: _id, task: task });
    await userModel.findOneAndUpdate({ _id: _id }, { $push: { tasks: data._id } })
    // console.log(data)
    res.status(200).json({
        status: "success",
        message: "new task added"
    })
})

const getTask = asyncErrorHandler(async (req, res) => {
    let id = req.params.id
    let { _id } = req.user
    let data = await taskModel.findById({ userId: _id, _id: id });
    res.status(200).json({
        status: "success",
        task: data
    });

})


const updateTask = asyncErrorHandler(async (req, res) => {
    let id = req.params.id
    let { _id } = req.user
    let { updateTask } = req.body;
    let data = await taskModel.findOneAndUpdate({ userId: _id, _id: id }, { $set: { ...updateTask } }, { new: true })
    res.status(200).json({
        status: "success",
        message: "task updated successfully"
    });
})

const deleteTask = asyncErrorHandler(async (req, res) => {
    let id = req.params.id
    //delete the id of task from user document
    //delete the task 
    let data = await taskModel.findOneAndDelete({ _id: id });
    await userModel.findByIdAndUpdate({ _id: data.userId }, { $pull: { tasks: data._id } })
    res.status(200).json({
        status: "success",
        message: "task deleted"
    });
})

module.exports = {
    getAllTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
}
