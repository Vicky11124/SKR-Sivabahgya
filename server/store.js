import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  A tiny JSON-file database: { reviews: [], bookings: [] }.
  Everything is kept in memory and written to disk after each change (via a temp file + rename,
  so a crash mid-write never leaves a half-written file). Fine for a hotel site's volume.
*/
export function openStore(dir) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'db.json');

  let data = { reviews: [], bookings: [] };
  try {
    const saved = JSON.parse(readFileSync(file, 'utf8'));
    data = {
      reviews: Array.isArray(saved.reviews) ? saved.reviews : [],
      bookings: Array.isArray(saved.bookings) ? saved.bookings : []
    };
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error(`Could not read ${file}: ${err.message}`);
  }

  const save = () => {
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(data, null, 2));
    renameSync(tmp, file);
  };

  const collection = name => ({
    all: () => data[name],
    add(item) {
      data[name].unshift(item); // newest first
      save();
      return item;
    },
    update(id, changes) {
      const item = data[name].find(x => x.id === id);
      if (!item) return null;
      Object.assign(item, changes);
      save();
      return item;
    },
    remove(id) {
      const before = data[name].length;
      data[name] = data[name].filter(x => x.id !== id);
      if (data[name].length === before) return false;
      save();
      return true;
    }
  });

  return { file, reviews: collection('reviews'), bookings: collection('bookings') };
}
