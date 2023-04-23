const httpStatus = require('http-status');
const { classService } = require('../services')
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');

const createClassroom = catchAsync(async (req, res) => {
  const result = await classService.createClassroom({ ...req.body, ...{ user: req.user } });
  sendResponse(res, httpStatus.CREATED, result, 'Classroom created successfully!');
});

const updateClassroom = catchAsync(async (req, res) => {
  const result = await classService.updateClassroom({ ...req.body, ...req.params, ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'Classroom updated successfully!');
});

const deleteClassroom = catchAsync(async (req, res) => {
  const result = await classService.deleteClassroom({ ...req.params, ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'Classroom deleted successfully!');
});

const addStudentToClassroom = catchAsync(async (req, res) => {
  const result = await classService.addStudent({ ...req.params, ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'Student added to classroom successfully');
});

const getClassesFeed = catchAsync(async (req, res) => {
  const result = await classService.getClassFeed({ ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'Fetched class feed successfully!');
});

const uploadFile = catchAsync(async (req, res) => {
  const result = await classService.uploadFile({ ...req.params, ...{ user: req.user, fileData: req.file, host: req.get('host') }, ...req.body },);
  sendResponse(res, httpStatus.CREATED, result, 'File uploaded successfully');
});

const renameFile = catchAsync(async (req, res) => {
  const result = await classService.renameFile({ ...req.body, ...req.params, ...{ user: req.user, host: req.get('host') } });
  sendResponse(res, httpStatus.OK, result, 'File renamed successfully');
});

const deleteFile = catchAsync(async (req, res) => {
  const result = await classService.deleteFile({ ...req.body, ...req.params, ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'File deleted successfully');
});

const getFilesFeed = catchAsync(async (req, res) => {
  const result = await classService.getFilesFeed({ ...req.params, ...req.query, ...{ user: req.user } });
  sendResponse(res, httpStatus.OK, result, 'Files feed fetched successfully');
});

module.exports = {
  uploadFile,
  renameFile,
  deleteFile,
  getFilesFeed,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  addStudentToClassroom,
  getClassesFeed,
};