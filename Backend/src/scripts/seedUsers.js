// One-time bootstrap script. The API has no way to create an Admin or Guard
// account (onboardResident only ever creates residents, and there's no public
// registration endpoint yet) — so the very first users have to be inserted
// directly. Safe to re-run: it skips any user that already exists.
//
// Usage: npm run seed   (from Backend/)

import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Flat from "../models/Flat.js";

dotenv.config({ quiet: true });

const FLAT = {
  block_name: "Tower B",
  flat_number: "204",
  occupancy_type: "Owner",
  owner_name: "Aarav Mehta",
  owner_phone: "98204 41207",
  carpet_area: 950,
  is_occupied: true,
  number_of_members: 3,
  registered_vehicles: 2,
};

// Same usernames/passwords the frontend's demo-credentials list already shows,
// so the seeded backend lines up with what's on screen once it's wired in.
const USERS = [
  {
    username: "Admin",
    name: "S. Krishnan",
    email: "admin@greenvalley.pk",
    password: "admin123",
    role: "Admin",
  },
  {
    username: "guard.gate2",
    name: "Manoj Yadav",
    email: "guard.gate2@greenvalley.pk",
    password: "guard123",
    role: "Guard",
    gate: "Gate 2 · Main Entrance",
  },
  {
    username: "Resident",
    name: "Aarav Mehta",
    email: "resident@greenvalley.pk",
    password: "resident123",
    role: "Resident",
    phone_number: "98204 41207",
    // flat_id filled in below once the seed flat exists
  },
];

async function seed() {
  await connectDB();

  let flat = await Flat.findOne({ block_name: FLAT.block_name, flat_number: FLAT.flat_number });
  if (!flat) {
    flat = await Flat.create(FLAT);
    console.log(`Created flat ${flat.block_name}-${flat.flat_number} (${flat._id})`);
  } else {
    console.log(`Flat ${flat.block_name}-${flat.flat_number} already exists (${flat._id})`);
  }

  for (const u of USERS) {
    const exists = await User.findOne({ username: u.username });
    if (exists) {
      console.log(`Skipped ${u.username} — already exists.`);
      continue;
    }

    const payload = { ...u };
    if (u.role === "Resident") payload.flat_id = flat._id;

    // Password hashing happens in User's pre-save hook, not here.
    await User.create(payload);
    console.log(`Created ${u.role} user: ${u.username} / ${u.password}`);
  }

  console.log("\nSeed complete. Login with:");
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(9)} ${u.username} / ${u.password}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
