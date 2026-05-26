-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2026-05-14 13:05:52.328

-- tables
-- Table: account
CREATE TABLE account (
    id text  NOT NULL,
    "accountId" text  NOT NULL,
    "providerId" text  NOT NULL,
    "userId" text  NOT NULL,
    "accessToken" text  NULL,
    "refreshToken" text  NULL,
    "idToken" text  NULL,
    "accessTokenExpiresAt" timestamptz  NULL,
    "refreshTokenExpiresAt" timestamptz  NULL,
    scope text  NULL,
    password text  NULL,
    "createdAt" timestamptz  NOT NULL DEFAULT now(),
    "updatedAt" timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT accounts_pk PRIMARY KEY (id)
);

-- Table: app_users
CREATE TABLE app_users (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    name text  NOT NULL,
    email text  NOT NULL,
    roles_id text  NOT NULL,
    availibility text  NULL,
    start_work_time time  NULL,
    end_work_time time  NULL,
    address text  NULL,
    profile_picture text  NULL,
    phone text  NULL,
    gender text  NULL,
    city text  NULL,
    region text  NULL,
    postal_code text  NULL,
    country text  NULL,
    created_at timestamptz  NOT NULL,
    updated_at timestamptz  NOT NULL,
    CONSTRAINT customer_email UNIQUE (email) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT app_users_pk PRIMARY KEY (id)
);

-- Table: comments
CREATE TABLE comments (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    projects_id text  NULL,
    tasks_id text  NULL,
    comments_id text  NULL,
    users_id text  NOT NULL,
    content text  NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT one_fk CHECK (num_nonnulls(tasks_id, projects_id, comments_id) = 1) NOT DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT comments_pk PRIMARY KEY (id)
);

-- Table: labels
CREATE TABLE labels (
    id serial  NOT NULL,
    name text  NOT NULL,
    description text  NULL,
    CONSTRAINT labels_pk PRIMARY KEY (id)
);

-- Table: milestones
CREATE TABLE milestones (
    id serial  NOT NULL,
    name text  NOT NULL,
    description text  NULL,
    start_date timestamptz  NOT NULL,
    end_date timestamptz  NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT milestones_pk PRIMARY KEY (id)
);

-- Table: priorities
CREATE TABLE priorities (
    id serial  NOT NULL,
    name text  NOT NULL,
    CONSTRAINT priorities_pk PRIMARY KEY (id)
);

-- Table: project_managers
CREATE TABLE project_managers (
    projects_id text  NOT NULL,
    users_id text  NOT NULL,
    CONSTRAINT project_managers_pk PRIMARY KEY (projects_id,users_id)
);

-- Table: projects
CREATE TABLE projects (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    status_id int  NOT NULL,
    title text  NOT NULL,
    description text  NOT NULL,
    start_date timestamptz  NOT NULL,
    end_date timestamptz  NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT projects_pk PRIMARY KEY (id)
);

-- Table: roles
CREATE TABLE roles (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    name text  NOT NULL,
    CONSTRAINT roles_pk PRIMARY KEY (id)
);

-- Table: session
CREATE TABLE session (
    id text  NOT NULL,
    "expiresAt" timestamptz  NOT NULL,
    token text  NOT NULL,
    "createdAt" timestamptz  NOT NULL DEFAULT now(),
    "updatedAt" timestamptz  NOT NULL DEFAULT now(),
    "ipAddress" text  NULL,
    "userAgent" text  NULL,
    "userId" text  NOT NULL,
    CONSTRAINT ak_sessions_token UNIQUE (token) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT sessions_pk PRIMARY KEY (id)
);

CREATE INDEX idx_sessions_user_id on session ("userId" ASC);

-- Table: status
CREATE TABLE status (
    id serial  NOT NULL,
    name text  NOT NULL,
    CONSTRAINT status_pk PRIMARY KEY (id)
);

-- Table: task_logs
CREATE TABLE task_logs (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    users_id text  NOT NULL,
    tasks_id text  NOT NULL,
    action text  NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT task_logs_pk PRIMARY KEY (id)
);

-- Table: tasks
CREATE TABLE tasks (
    id text  NOT NULL DEFAULT gen_random_uuid(),
    projects_id text  NOT NULL,
    priorities_id int  NOT NULL,
    status_id int  NOT NULL,
    title text  NOT NULL,
    description text  NOT NULL,
    due_date timestamptz  NOT NULL,
    weight int  NULL,
    dependent_on_tasks_id text  NULL,
    labels_id int  NULL,
    milestones_id int  NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT tasks_pk PRIMARY KEY (id)
);

-- Table: user
CREATE TABLE "user" (
    id text  NOT NULL,
    name text  NOT NULL,
    email text  NOT NULL,
    "emailVerified" boolean  NOT NULL DEFAULT false,
    image text  NULL,
    "createdAt" timestamptz  NOT NULL DEFAULT now(),
    "updatedAt" timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ak_users_email UNIQUE (email) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

-- Table: users_projects
CREATE TABLE users_projects (
    projects_id text  NOT NULL,
    users_id text  NOT NULL,
    CONSTRAINT users_projects_pk PRIMARY KEY (users_id,projects_id)
);

-- Table: users_tasks
CREATE TABLE users_tasks (
    tasks_id text  NOT NULL,
    users_id text  NOT NULL,
    CONSTRAINT users_tasks_pk PRIMARY KEY (tasks_id,users_id)
);

-- Table: verification
CREATE TABLE verification (
    id text  NOT NULL,
    identifier text  NOT NULL,
    value text  NOT NULL,
    "expiresAt" timestamptz  NOT NULL,
    "createdAt" timestamptz  NOT NULL DEFAULT now(),
    "updatedAt" timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT verifications_pk PRIMARY KEY (id)
);

CREATE INDEX idx_verifications_identifier on verification (identifier ASC);

-- foreign keys
-- Reference: Table_35_tasks (table: users_tasks)
ALTER TABLE users_tasks ADD CONSTRAINT Table_35_tasks
    FOREIGN KEY (tasks_id)
    REFERENCES tasks (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: Table_35_users (table: users_tasks)
ALTER TABLE users_tasks ADD CONSTRAINT Table_35_users
    FOREIGN KEY (users_id)
    REFERENCES app_users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: accounts_users (table: account)
ALTER TABLE account ADD CONSTRAINT accounts_users
    FOREIGN KEY ("userId")
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_comments (table: comments)
ALTER TABLE comments ADD CONSTRAINT comments_comments
    FOREIGN KEY (comments_id)
    REFERENCES comments (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_projects (table: comments)
ALTER TABLE comments ADD CONSTRAINT comments_projects
    FOREIGN KEY (projects_id)
    REFERENCES projects (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_tasks (table: comments)
ALTER TABLE comments ADD CONSTRAINT comments_tasks
    FOREIGN KEY (tasks_id)
    REFERENCES tasks (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_users (table: comments)
ALTER TABLE comments ADD CONSTRAINT comments_users
    FOREIGN KEY (users_id)
    REFERENCES app_users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: project_managers_projects (table: project_managers)
ALTER TABLE project_managers ADD CONSTRAINT project_managers_projects
    FOREIGN KEY (projects_id)
    REFERENCES projects (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: project_managers_users (table: project_managers)
ALTER TABLE project_managers ADD CONSTRAINT project_managers_users
    FOREIGN KEY (users_id)
    REFERENCES app_users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: projects_status (table: projects)
ALTER TABLE projects ADD CONSTRAINT projects_status
    FOREIGN KEY (status_id)
    REFERENCES status (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: sessions_users (table: session)
ALTER TABLE session ADD CONSTRAINT sessions_users
    FOREIGN KEY ("userId")
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: task_dependents_on (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT task_dependents_on
    FOREIGN KEY (dependent_on_tasks_id)
    REFERENCES tasks (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: task_logs_tasks (table: task_logs)
ALTER TABLE task_logs ADD CONSTRAINT task_logs_tasks
    FOREIGN KEY (tasks_id)
    REFERENCES tasks (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: task_logs_users (table: task_logs)
ALTER TABLE task_logs ADD CONSTRAINT task_logs_users
    FOREIGN KEY (users_id)
    REFERENCES app_users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tasks_labels (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT tasks_labels
    FOREIGN KEY (labels_id)
    REFERENCES labels (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tasks_milestones (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT tasks_milestones
    FOREIGN KEY (milestones_id)
    REFERENCES milestones (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tasks_priorities (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT tasks_priorities
    FOREIGN KEY (priorities_id)
    REFERENCES priorities (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tasks_projects (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT tasks_projects
    FOREIGN KEY (projects_id)
    REFERENCES projects (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tasks_status (table: tasks)
ALTER TABLE tasks ADD CONSTRAINT tasks_status
    FOREIGN KEY (status_id)
    REFERENCES status (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: teams_projects_projects (table: users_projects)
ALTER TABLE users_projects ADD CONSTRAINT teams_projects_projects
    FOREIGN KEY (projects_id)
    REFERENCES projects (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_projects_users (table: users_projects)
ALTER TABLE users_projects ADD CONSTRAINT users_projects_users
    FOREIGN KEY (users_id)
    REFERENCES app_users (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_roles (table: app_users)
ALTER TABLE app_users ADD CONSTRAINT users_roles
    FOREIGN KEY (roles_id)
    REFERENCES roles (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_user (table: app_users)
ALTER TABLE app_users ADD CONSTRAINT users_user
    FOREIGN KEY (id)
    REFERENCES "user" (id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;
-- End of file.

INSERT INTO roles (id, name)
VALUES
  (gen_random_uuid(), 'admin'),
  (gen_random_uuid(), 'user');

INSERT INTO status (name)
VALUES
  ('Planning'),
  ('Pending'),
  ('In Progress'),
  ('On Hold'),
  ('In Review'),
  ('Testing'),
  ('Completed'),
  ('Cancelled');