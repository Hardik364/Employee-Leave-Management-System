-- ============================================================
--  Employee Leave Management System — Database Schema
--  Reference DDL (PostgreSQL dialect).
--
--  The application uses Sequelize and creates these tables
--  automatically. This file documents the normalized schema,
--  keys, constraints, and indexing strategy for reviewers.
-- ============================================================

-- ------------------------------------------------------------
--  employees
--  Stores both employees and managers, distinguished by `role`.
-- ------------------------------------------------------------
CREATE TABLE employees (
    id            SERIAL       PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,           -- bcrypt hash
    department    VARCHAR(100) NOT NULL DEFAULT 'General',
    role          VARCHAR(20)  NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('employee', 'manager')),
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_employees_role  ON employees (role);

-- ------------------------------------------------------------
--  leaves
--  A leave request belongs to one employee and may be reviewed
--  by a manager (self-referencing FK to employees).
-- ------------------------------------------------------------
CREATE TABLE leaves (
    id                SERIAL       PRIMARY KEY,
    employee_id       INTEGER      NOT NULL,
    leave_type        VARCHAR(20)  NOT NULL
                      CHECK (leave_type IN
                          ('casual','sick','earned','unpaid','maternity','paternity')),
    start_date        DATE         NOT NULL,
    end_date          DATE         NOT NULL,
    reason            VARCHAR(500) NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','cancelled')),
    manager_comments  VARCHAR(500),
    reviewed_by       INTEGER,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_leaves_employee
        FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_leaves_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES employees (id) ON DELETE SET NULL,
    CONSTRAINT chk_leaves_date_order
        CHECK (end_date >= start_date)
);

CREATE INDEX idx_leaves_employee_id ON leaves (employee_id);
CREATE INDEX idx_leaves_status      ON leaves (status);
CREATE INDEX idx_leaves_leave_type  ON leaves (leave_type);
