const pool = require('../db');
const logger = require('../utils/logger');

const createClassroom = async (name, tutorId, students) => {
    try {
        const query = 'INSERT INTO classrooms (name, tutor_id) VALUES ($1, $2) RETURNING *';
        const values = [name, tutorId];
        const { rows } = await pool.query(query, values);

        if (rows.length > 0) {
            // Get the created classroom object
            const classroom = rows[0];

            // Add students to the classroom concurrently
            const addStudentPromises = students.map(studentId => {
                addStudentToClassroom(classroom.id, studentId)
            }
            );
            await Promise.all(addStudentPromises);
            return classroom;
        } else {
            throw new Error('Failed to create classroom');
        }
    } catch (error) {
        // Handle database errors or other exceptions
        logger.error(error);
        throw new Error('Failed to create classroom');
    }
};

const updateClassroom = async (classroomId, name) => {
    try {
        const query = 'UPDATE classrooms SET name = $1 WHERE id = $2 RETURNING *';
        const values = [name, classroomId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to update classroom');
    }
};

const deleteClassroom = async (classroomId) => {
    try {
        const query = 'DELETE FROM classrooms WHERE id = $1';
        const values = [classroomId];
        const { rowCount } = await pool.query(query, values);
        return rowCount > 0;
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to delete classroom');
    }
};

const getClassroomById = async (classroomId) => {
    try {
        const query = 'SELECT * FROM classrooms WHERE id = $1';
        const values = [classroomId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to fetch classroom');
    }
};

const getClassroomsByTutorId = async (tutorId) => {
    try {
        const query = `
        SELECT c.*, json_agg(json_build_object('id', u.id, 'username', u.username)) AS students
        FROM classrooms c
        LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
        LEFT JOIN users u ON cs.student_id = u.id
        WHERE c.tutor_id = $1
        GROUP BY c.id
      `;
        const values = [tutorId];
        const { rows } = await pool.query(query, values);

        // If there are no students in a classroom, set students to an empty array
        rows.forEach(row => {
            if (row.students.length === 1 && row.students[0].id === null) {
                row.students = [];
            }
        });

        return rows;
    } catch (error) {
        logger.error('Error in getClassroomsByTutorId:', error);
        throw new Error('Failed to fetch classroom');
    }
};


const getClassroomsByStudentId = async (studentId) => {
    try {
        const query = `
        SELECT c.* FROM classrooms c
        JOIN classroom_students cs ON cs.classroom_id = c.id
        WHERE cs.student_id = $1
      `;
        const values = [studentId];
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to fetch classroom');
    }
};

const addStudentToClassroom = async (classroomId, studentId) => {
    try {
        const query = 'INSERT INTO classroom_students (classroom_id, student_id) VALUES ($1, $2)';
        const values = [classroomId, studentId];
        const { rowCount } = await pool.query(query, values);
        return rowCount > 0;
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to add student to classroom');
    }
};

const checkStudentExistInClassroom = async (classroomId, studentId) => {
    try {
        const query = 'SELECT * FROM classroom_students WHERE classroom_id = $1 AND student_id = $2';
        const values = [classroomId, studentId];
        const { rowCount } = await pool.query(query, values);
        return rowCount > 0;
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to check student in classroom');
    }
};

const createFile = async (name, description, mimetype, fileData, userId, classroomId, url) => {
    try {
        const query = `
        INSERT INTO files (name, description, file_type, file_details, uploaded_by, classroom_id, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
        const values = [name, description, mimetype, fileData, userId, classroomId, url];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in createFile:', error);
        throw new Error('Failed to create file in classroom');
    }
};

const getFileById = async (fileId) => {
    try {
        const query = `SELECT * FROM files WHERE id = $1;`;
        const values = [fileId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in getFileById:', error);
        throw new Error('Failed to get file');
    }
};

const updateFile = async (fileId, newName, newDescription, newUrl, newFileDetails) => {
    try {
        const query = `
        UPDATE files
        SET name = $1,
            description = $2,
            url = $3,
            file_details = $4
        WHERE id = $5
        RETURNING *;
      `;
        const values = [newName, newDescription, newUrl, newFileDetails, fileId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in updateFile:', error);
        throw new Error('Failed to update file');
    }
};


const deleteFile = async (fileId) => {
    try {
        const query = `
        UPDATE files
        SET is_deleted = true
        WHERE id = $1
        RETURNING *;
      `;
        const values = [fileId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error in deleteFile:', error);
        throw new Error('Failed to delete file');
    }
};

const getFilesFeed = async (classroomId, fileType, search) => {
    try {
        let query = `
        SELECT * FROM files
        WHERE classroom_id = $1 AND is_deleted = false
      `;

        const values = [classroomId];
        let parameterIndex = 2;

        if (fileType) {
            query += ` AND file_type ILIKE $${parameterIndex}`;
            values.push(fileType + '%');
            parameterIndex++;
        }

        if (search) {
            query += ` AND name ILIKE $${parameterIndex}`;
            values.push('%' + search + '%');
            parameterIndex++;
        }

        query += ';';

        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        logger.error('Error in getFilesFeed:', error);
        throw new Error('Failed to fetch file');
    }
};

const isStudentInClassroom = async (studentId, classroomId) => {
    try {
        const query = `
        SELECT * FROM classroom_students
        WHERE student_id = $1 AND classroom_id = $2
      `;
        const values = [studentId, classroomId];
        const { rows } = await pool.query(query, values);

        // If the query returns a result, the student is in the classroom
        if (rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logger.error('Error in isStudentInClassroom:', error);
        throw new Error('Failed to check if student is in the classroom');
    }
};

module.exports = {
    createFile,
    getFileById,
    updateFile,
    deleteFile,
    getFilesFeed,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    getClassroomById,
    getClassroomsByTutorId,
    getClassroomsByStudentId,
    addStudentToClassroom,
    checkStudentExistInClassroom,
    isStudentInClassroom
};
