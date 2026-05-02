/**
 * Existing schema baseline.
 *
 * B-10 and B-11 use existing database tables:
 * - patient_profiles
 * - appointment_types
 *
 * This migration intentionally does not create or drop those tables, because
 * the project database already owns the schema.
 */
exports.up = async () => {};

exports.down = async () => {};
