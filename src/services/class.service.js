const httpStatus = require('http-status');
const { classModel, userModel } = require('../models');
const { ApiError } = require('../utils/error');
const { STUDENT, TUTOR } = require('../utils/constants');
const path = require('path');
const { rename } = require('fs/promises');
const fs = require('fs')

const createClassroom = async ({ name, user, students }) => {
  const tutorId = user.id;
  const userRole = user.role;

  if (userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to create this classroom');
  }

  const studentsPromises = students.map((id) =>
    userModel.getUserByUsername(id)
  );
  const studentsWithId = await Promise.all(studentsPromises);

  if (studentsWithId.some((student) => (!student || student.role !== STUDENT))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Some students were invalid');
  }

  const studentIds = studentsWithId.map((student) => student.id);

  const newClassroom = await classModel.createClassroom(
    name,
    tutorId,
    studentIds
  );

  if (!newClassroom) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error creating classroom'
    );
  }

  return newClassroom;
};

const updateClassroom = async ({ name, classroomId, user }) => {
  const { id: tutorId } = user;
  const userRole = user.role;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== tutorId || userRole !== TUTOR) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this classroom'
    );
  }

  const updatedClassroom = await classModel.updateClassroom(classroomId, name);

  if (!updatedClassroom) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating classroom'
    );
  }

  return updatedClassroom;
};

const deleteClassroom = async ({ classroomId, user }) => {
  const { id: tutorId } = user;
  const userRole = user.role;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== tutorId || userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  const deleteStatus = await classModel.deleteClassroom(classroomId);

  if (!deleteStatus) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting classroom'
    );
  }

  return {};
};

const addStudent = async ({ classroomId, studentId, user }) => {
  const { id: tutorId } = user;
  const userRole = user.role;


  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== tutorId || userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  const student = await userModel.getUserByUsername(studentId);
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  if (student.role !== STUDENT) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'The specified user is not a student'
    );
  }

  const isStudentExistInClassroom = await classModel.checkStudentExistInClassroom(
    classroomId,
    student.id
  );
  if (isStudentExistInClassroom) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The student is already in the classroom.'
    );
  }

  const addStatus = await classModel.addStudentToClassroom(
    classroomId,
    student.id
  );

  if (!addStatus) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error adding student to classroom'
    );
  }

  return {};
};

const getClassFeed = async ({ user }) => {
  const { id: userId, role: userRole } = user;

  let classrooms;
  if (userRole === TUTOR) {
    classrooms = await classModel.getClassroomsByTutorId(userId);
  } else if (userRole === STUDENT) {
    classrooms = await classModel.getClassroomsByStudentId(userId);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user role');
  }

  if (!classrooms) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching classrooms'
    );
  }

  return { classrooms };
};

const uploadFile = async ({
  classroomId,
  user,
  fileData,
  name,
  description,
  url,
  host,
}) => {
  if (!fileData && !url) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'File type not accepted'
    );
  }

  const { id: userId, role: userRole } = user;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== userId || userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  let mimetype;
  if (fileData) {
    mimetype = fileData.mimetype;
    url = host + '/uploads/' + fileData.filename;
  } else {
    mimetype = 'url';
  }

  const file = await classModel.createFile(
    name,
    description,
    mimetype,
    fileData,
    userId,
    classroomId,
    url
  );

  return file;
};

const renameFile = async ({
  classroomId,
  fileId,
  user,
  name,
  fileName,
  description,
  url,
  host,
}) => {
  const { id: userId, role: userRole } = user;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== userId || userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  const file = await classModel.getFileById(fileId);

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  if (file.classroom_id !== Number(classroomId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'File does not belong to the specified classroom'
    );
  }



  if (file.file_details) {
    const oldPath = path.join(
      `${__dirname}/../../static/assets/uploads/`,
      file.file_details.filename
    );

    const fileExtension = path.extname(file.file_details.filename);
    const newFileName = `${fileName}${fileExtension}`;
    const newPath = path.join(
      `${__dirname}/../../static/assets/uploads/`,
      newFileName
    );

    // Check if a file with the new name already exists
    if (fs.existsSync(newPath)) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'File already exist with the name'
      );
    }

    try {
      await rename(oldPath, newPath);
      url = host + '/uploads/' + newFileName;
      file.file_details.path = newPath;
      file.file_details.filename = newFileName;
    } catch (err) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error renaming file'
      );
    }
  }

  const updatedFile = await classModel.updateFile(
    fileId,
    name,
    description,
    url,
    file.file_details
  );

  if (!updatedFile) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error renaming file'
    );
  }

  return updatedFile;
};

const deleteFile = async ({ classroomId, fileId, user }) => {
  const { id: userId, role: userRole } = user;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found');
  }

  if (classroom.tutor_id !== userId || userRole !== TUTOR) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  const file = await classModel.getFileById(fileId);

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  if (file.classroom_id !== Number(classroomId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'File does not belong to the specified classroom'
    );
  }

  if (file.file_details) {
    const filePath = path.join(
      `${__dirname}/../../static/assets/uploads/`,
      file.file_details.filename
    );

    try {
      await fs.unlinkSync(filePath);
    } catch (err) {
      logger.error(err)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error deleting the actual file'
      );
    }
  }

  const deletedFile = await classModel.deleteFile(fileId);

  if (!deletedFile) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting file');
  }

  return { deletedFile };
};


const getFilesFeed = async ({ classroomId, user, fileType, search }) => {
  const userId = user.id;
  const userRole = user.role;

  const classroom = await classModel.getClassroomById(classroomId);

  if (!classroom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Classroom not found')
  }

  if (userRole === TUTOR && classroom.tutor_id !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access')
  }

  if (userRole === STUDENT && !await classModel.isStudentInClassroom(userId, classroomId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access')
  }

  const files = await classModel.getFilesFeed(classroomId, fileType, search);

  if (!files) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error fetching files feed')
  }

  return { files }
};

module.exports = { uploadFile, renameFile, deleteFile, getClassFeed, createClassroom, updateClassroom, deleteClassroom, addStudent, getFilesFeed }