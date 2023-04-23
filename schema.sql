CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username VARCHAR(255) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   role VARCHAR(255) NOT NULL
);

-- Create the classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tutor_id INTEGER NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES users (id)
);

-- Create the classroom_students table
CREATE TABLE IF NOT EXISTS classroom_students (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms (id) ON DELETE CASCADE
);

CREATE TABLE files (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   url VARCHAR(2048) NOT NULL,
   uploaded_at TIMESTAMPTZ DEFAULT NOW(),
   uploaded_by INTEGER REFERENCES users(id),
   file_details JSONB,
   classroom_id INTEGER REFERENCES classrooms(id),
   file_type VARCHAR(255) NOT NULL,
   is_deleted BOOLEAN DEFAULT false
);
