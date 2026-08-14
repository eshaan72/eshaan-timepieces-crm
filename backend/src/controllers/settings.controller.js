import { getAllSettings, setSetting } from '../utils/settings.js';

export async function getSettings(req, res) {
  const settings = await getAllSettings();
  res.json(settings);
}

export async function updateSettings(req, res) {
  const updates = req.body;
  const keys = Object.keys(updates);
  for (let i = 0; i < keys.length; i++) {
    await setSetting(keys[i], updates[keys[i]]);
  }
  const settings = await getAllSettings();
  res.json(settings);
}
