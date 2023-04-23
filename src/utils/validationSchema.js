const Joi = require('joi');

const loginSchema = Joi.object().keys({
    username: Joi.string().min(6).max(16).required().error(Error("Invalid Username | Minimum 6 characters | Maximum 16 characters")),
    password: Joi.string().trim().min(8).max(24).required().error(Error("Invalid Password | Minimum 8 characters | Maximum 24 characters")),
    role: Joi.string().required().valid("TUTOR", "STUDENT")
});

const createClassroomSchema = Joi.object().keys({
    name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .error(Error("Invalid Class name | Minimum 2 characters | Maximum 255 characters")),
    students: Joi.array()
        .items(Joi.string())
        .required()
        .error(Error("Invalid Students | Students must be an array of strings")),
});

const updateClassroomSchema = Joi.object().keys({
    name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .error(Error("Invalid Class name | Minimum 2 characters | Maximum 255 characters")),
});

const deleteClassroomSchema = Joi.object().keys({
    classroomId: Joi.number()
        .required()
        .error(Error("Invalid ClassroomId")),
});

const addStudentsToClassroomSchema = Joi.object().keys({
    classroomId: Joi.number()
        .required()
        .error(Error("Invalid Classroom ID")),
    studentId: Joi.string()
        .required()
        .error(Error("Invalid Student ID")),
});

module.exports = {
    loginSchema,
    createClassroomSchema,
    updateClassroomSchema,
    deleteClassroomSchema,
    addStudentsToClassroomSchema,
}