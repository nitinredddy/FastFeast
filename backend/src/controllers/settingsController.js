import pool from "../config/db.js";
import { ensureBusinessSettingsSchema, getBusinessSettings } from "../lib/appSettings.js";

export const fetchBusinessSettings = async (req, res) => {
  try {
    const settings = await getBusinessSettings();
    res.json(settings);
  } catch (err) {
    console.error("Settings fetch error:", err);
    res.status(500).json({ message: "Failed to fetch business settings" });
  }
};

export const updateBusinessSettings = async (req, res) => {
  try {
    await ensureBusinessSettingsSchema();
    const {
      ordering_enabled,
      payments_enabled,
      open_hour_start,
      open_hour_end,
    } = req.body;

    if (
      typeof ordering_enabled !== "boolean" ||
      typeof payments_enabled !== "boolean" ||
      !Number.isInteger(Number(open_hour_start)) ||
      !Number.isInteger(Number(open_hour_end))
    ) {
      return res.status(400).json({ message: "Invalid settings payload" });
    }

    const start = Number(open_hour_start);
    const end = Number(open_hour_end);

    if (start < 0 || start > 23 || end < 0 || end > 24) {
      return res.status(400).json({ message: "Open and close hours must be within 0-24" });
    }

    await pool.query(
      `UPDATE BusinessSettings
       SET ordering_enabled = ?,
           payments_enabled = ?,
           open_hour_start = ?,
           open_hour_end = ?
       WHERE settings_id = 1`,
      [ordering_enabled, payments_enabled, start, end]
    );

    const settings = await getBusinessSettings();
    res.json({ message: "Business settings updated successfully", settings });
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ message: "Failed to update business settings" });
  }
};
