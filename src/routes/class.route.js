const express = require('express');
const router = express.Router();
const { classController } = require('../controllers');
const schemaValidator = require('../middleware/schemaValidator');
const { createClassroomSchema, updateClassroomSchema, deleteClassroomSchema, addStudentsToClassroomSchema } = require('../utils/validationSchema')
const store = require('../middleware/upload');

// Create a classroom
router.post('/', schemaValidator('body', createClassroomSchema), classController.createClassroom);

// Update a classroom
router.put('/:classroomId', schemaValidator('body', updateClassroomSchema), classController.updateClassroom);

// Delete a classroom
router.delete('/:classroomId', schemaValidator('params', deleteClassroomSchema), classController.deleteClassroom);

// Add a student to a classroom
router.post('/:classroomId/students/:studentId', schemaValidator('params', addStudentsToClassroomSchema), classController.addStudentToClassroom);

// Get classrooms feed
router.get('/', classController.getClassesFeed);

// Route for uploading a file to a specific classroom, accessible by the classroom's tutor
router.post('/:classroomId/files', store.single('file'), classController.uploadFile);

// Route for renaming a file in a specific classroom, accessible by the classroom's tutor
router.put('/:classroomId/files/:fileId', classController.renameFile);

// Route for deleting a file in a specific classroom, accessible by the classroom's tutor
router.delete('/:classroomId/files/:fileId', classController.deleteFile);

// Route for fetching the files feed of a specific classroom, accessible by the classroom's students and tutor
router.get('/:classroomId/files', classController.getFilesFeed);

module.exports = router;
