import pool from "../config/db.js";

let settingsSchemaEnsured = false;

export const ensureBusinessSettingsSchema = async () => {
  if (settingsSchemaEnsured) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS BusinessSettings (
      settings_id INT PRIMARY KEY,
      ordering_enabled BOOLEAN DEFAULT TRUE,
      payments_enabled BOOLEAN DEFAULT TRUE,
      open_hour_start INT DEFAULT 8,
      open_hour_end INT DEFAULT 22,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(
    `INSERT INTO BusinessSettings (settings_id, ordering_enabled, payments_enabled, open_hour_start, open_hour_end)
     VALUES (1, TRUE, TRUE, 8, 22)
     ON DUPLICATE KEY UPDATE settings_id = settings_id`
  );

  settingsSchemaEnsured = true;
};

export const getBusinessSettings = async () => {
  await ensureBusinessSettingsSchema();
  const [rows] = await pool.query("SELECT * FROM BusinessSettings WHERE settings_id = 1");
  return rows[0];
};
