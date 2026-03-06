-- ============================================================
--  FormApp — Database Schema (SQLite)
--  Generated from EF Core InitialCreate migration
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
-- Stores both admin and regular user accounts.
-- Passwords are stored as BCrypt hashes (never plaintext).
-- Role defaults to 'user'; seed data creates one 'admin' account.
CREATE TABLE IF NOT EXISTS Users (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    Email        TEXT    NOT NULL,
    PasswordHash TEXT    NOT NULL,
    Role         TEXT    NOT NULL DEFAULT 'user',   -- 'admin' | 'user'
    CreatedAt    TEXT    NOT NULL                   -- ISO-8601 UTC datetime
);

CREATE UNIQUE INDEX IF NOT EXISTS IX_Users_Email
    ON Users (Email);


-- ── Forms ────────────────────────────────────────────────────
-- A form is created by an admin and made available to all users.
-- Deleting the creator (User) is RESTRICTED while forms exist.
CREATE TABLE IF NOT EXISTS Forms (
    Id              INTEGER PRIMARY KEY AUTOINCREMENT,
    Title           TEXT    NOT NULL,               -- max 200 chars
    Description     TEXT    NOT NULL DEFAULT '',    -- max 1000 chars
    CreatedAt       TEXT    NOT NULL,               -- ISO-8601 UTC datetime
    CreatedByUserId INTEGER NOT NULL,
    FOREIGN KEY (CreatedByUserId)
        REFERENCES Users (Id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS IX_Forms_CreatedByUserId
    ON Forms (CreatedByUserId);


-- ── FormFields ───────────────────────────────────────────────
-- Each row is one field (question) belonging to a form.
-- Deleting the parent Form cascades to all its fields.
-- FieldType is one of: 'text' | 'number' | 'textarea' | 'select' | 'checkbox'
-- Options is a JSON array string (e.g. '["Yes","No","Maybe"]') used only
-- when FieldType = 'select'; NULL for all other types.
CREATE TABLE IF NOT EXISTS FormFields (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    FormId     INTEGER NOT NULL,
    Label      TEXT    NOT NULL,                    -- max 300 chars
    FieldType  TEXT    NOT NULL DEFAULT 'text',
    IsRequired INTEGER NOT NULL DEFAULT 0,          -- 0 = false, 1 = true
    [Order]    INTEGER NOT NULL DEFAULT 0,          -- display order (0-based index)
    Options    TEXT,                                -- JSON array, nullable
    FOREIGN KEY (FormId)
        REFERENCES Forms (Id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IX_FormFields_FormId
    ON FormFields (FormId);


-- ── FormEntries ──────────────────────────────────────────────
-- One row per form submission. A user can submit the same form
-- multiple times. Deleting the form cascades to its entries.
-- Deleting the submitting user is RESTRICTED while entries exist.
CREATE TABLE IF NOT EXISTS FormEntries (
    Id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    FormId             INTEGER NOT NULL,
    SubmittedByUserId  INTEGER NOT NULL,
    SubmittedAt        TEXT    NOT NULL,            -- ISO-8601 UTC datetime
    FOREIGN KEY (FormId)
        REFERENCES Forms (Id) ON DELETE CASCADE,
    FOREIGN KEY (SubmittedByUserId)
        REFERENCES Users (Id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS IX_FormEntries_FormId
    ON FormEntries (FormId);

CREATE INDEX IF NOT EXISTS IX_FormEntries_SubmittedByUserId
    ON FormEntries (SubmittedByUserId);


-- ── EntryValues ──────────────────────────────────────────────
-- One row per answered field within a submission.
-- Deleting the parent FormEntry cascades to all its values.
-- Deleting the FormField is RESTRICTED while values reference it.
CREATE TABLE IF NOT EXISTS EntryValues (
    Id           INTEGER PRIMARY KEY AUTOINCREMENT,
    FormEntryId  INTEGER NOT NULL,
    FormFieldId  INTEGER NOT NULL,
    Value        TEXT    NOT NULL,                  -- raw string; 'true'/'false' for checkboxes
    FOREIGN KEY (FormEntryId)
        REFERENCES FormEntries (Id) ON DELETE CASCADE,
    FOREIGN KEY (FormFieldId)
        REFERENCES FormFields (Id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS IX_EntryValues_FormEntryId
    ON EntryValues (FormEntryId);

CREATE INDEX IF NOT EXISTS IX_EntryValues_FormFieldId
    ON EntryValues (FormFieldId);


-- ============================================================
--  Relationship Summary
--
--  Users  ──< Forms          (one admin creates many forms)
--  Forms  ──< FormFields     (one form has many fields)      CASCADE
--  Forms  ──< FormEntries    (one form has many submissions)  CASCADE
--  Users  ──< FormEntries    (one user submits many entries)
--  FormEntries ──< EntryValues (one entry has many answers)  CASCADE
--  FormFields  ──< EntryValues (one field referenced by many answers)
-- ============================================================
