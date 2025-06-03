
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

// Set up database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

// User data from MySQL export
const usersToImport = [
  {
    username: "musyoka",
    password: "$2b$10$.xZwkfo7xDPIYbFQJq7xsu./7docv3G.pbRoPDlUHAbBDPd8x1Uv2",
    email: "musyoka66666@gmail.com",
    firstName: "musyoka",
    lastName: "mueke",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MUSYOKAnx1ahc",
    referredBy: null,
    country: null,
    phoneNumber: null
  },
  {
    username: "marie",
    password: "$2b$10$XAeX9Wqhl44Wdq78ldkOj.VNsJwImw2ZJVmUFyDL9PisHmfukp8u6",
    email: "marie7868@gmail.com",
    firstName: "marie",
    lastName: "Marie",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MARIEgy083o",
    referredBy: null,
    country: "kenya",
    phoneNumber: "7809786757"
  },
  {
    username: "jose",
    password: "$2b$10$xf2LV6fbRJnqC5tpErbw1e4dq9/8wWAvyJRjgB6RDJS9xQeKu.6rm",
    email: "jose@webexpertsolutions.co.ke",
    firstName: "jose",
    lastName: "jose",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "JOSEhp330r",
    referredBy: null,
    country: "kenya",
    phoneNumber: "076565665"
  },
  {
    username: "tea",
    password: "$2b$10$oPC4/DlG4supjcPbx396Q.OJn9xD1ZAz7a3u71EVBBW/VIzvPD58u",
    email: "tea78765@gmail.com",
    firstName: "tea",
    lastName: "Kivu",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "TEAs9w536",
    referredBy: null,
    country: "Kenya",
    phoneNumber: "0786544543"
  },
  {
    username: "testuser",
    password: "$2b$10$60MHohtrScyPh6q8UHkC4OkE3QbumyxdpYgTFcGB4IcagYHD3tNGO",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "TESTUSERhkjknm",
    referredBy: 1, // This will need to be mapped
    country: null,
    phoneNumber: null
  },
  {
    username: "mikepaul",
    password: "$2b$10$RaINHef57rVP0d7bFVqzGOYQ3f/QfcKrtVh7OMRnQAzQZjt4zCHVK",
    email: "mikepaul620@gmail.com",
    firstName: "Mike",
    lastName: "Paul",
    walletBalance: "0",
    active: true,
    role: "user", // Changed from "member" to "user"
    referralCode: "MIKEPAUL1bpilc",
    referredBy: 2, // This will need to be mapped
    country: null,
    phoneNumber: null
  },
  {
    username: "mikekivu3",
    password: "$2b$10$DsDNjBwIqrTWLN1.Y5qdVOOrotdVUSdgFN9xWoKEoLwdViqpnCnry",
    email: "mikekivu3@gmail.com",
    firstName: "mike2",
    lastName: "Kivu",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MIKEKIVU37td72g",
    referredBy: 3, // This will need to be mapped
    country: null,
    phoneNumber: null
  },
  {
    username: "webexpertkenya@gmail.com",
    password: "$2b$10$lCQBFEXlvAnkNjcW8TSpeOshshqMsVPjSO8HlMOjYmd3DrJQAOcmS",
    email: "webexpertkenya@gmail.com",
    firstName: "mutua",
    lastName: "jj",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "WEBEXPERTKENYA@GMAIL.COM81ekjw",
    referredBy: 3, // This will need to be mapped
    country: null,
    phoneNumber: null
  },
  {
    username: "mutuadoe@gmail.com",
    password: "$2b$10$y623VyfEkfcY3znlcXPUeugMKoby6GyIMcwiPo/WaHlNi2MIBlu0O",
    email: "mutuadoe@gmail.com",
    firstName: "mutua",
    lastName: "Doe",
    walletBalance: "0",
    active: false,
    role: "user",
    referralCode: "MUTUADOE@GMAIL.COMu0gpoz",
    referredBy: null,
    country: null,
    phoneNumber: null
  },
  {
    username: "makoha",
    password: "$2b$10$KxYFMJyJlyVAojBbFBTTBuT8hwX5sK6A./jLBzLSjZDEgn2M/pEvy",
    email: "makohadenis564@gmail.com",
    firstName: "makaha",
    lastName: "denis",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MAKOHAfncfod",
    referredBy: null,
    country: "kenya",
    phoneNumber: "0745536445"
  },
  {
    username: "peter",
    password: "$2b$10$/EqT3ZLOS0UJbMw4CpGZieebb7O4wSwzWyNdoLSYkEarHUOrX8Iby",
    email: "petermkyu@gmail.com",
    firstName: "peter",
    lastName: "mk",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "PETERmovnfn",
    referredBy: null,
    country: "kenya",
    phoneNumber: "1234567"
  },
  {
    username: "mativo",
    password: "$2b$10$5DfidvcbnbBRhH25JufdUOGoN5.PCtDdGPy7axxh6pX1ZdU2fBZA.",
    email: "mativo6768@gmail.com",
    firstName: "mativo",
    lastName: "mativo",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MATIVO0k8x2w",
    referredBy: 22, // This will need to be mapped
    country: "kenya",
    phoneNumber: "07868645776"
  },
  {
    username: "mainamaina",
    password: "$2b$10$bwMWV.drHG8LBZkcI6R2Ve/HVTfSKvwpvsN.j8X00ng0ndJx2G7dC",
    email: "mainamaina@gmail.com",
    firstName: "maina",
    lastName: "maina",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MAINAMAINAenmrb1",
    referredBy: 3, // This will need to be mapped
    country: "Kenya",
    phoneNumber: "7868645776"
  },
  {
    username: "jacobjacob",
    password: "$2b$10$oXErcA59P42QGATrNGn4GeGEEJ7Ywt4xymXfQZ4vCrZQXEJbk.vjm",
    email: "jacobjacob@gmail.com",
    firstName: "jacob",
    lastName: "jacob",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "JACOBJACOBfqhec0",
    referredBy: 25, // This will need to be mapped
    country: "kenya",
    phoneNumber: "5623784878"
  },
  {
    username: "janetjanet@",
    password: "$2b$10$hvfDjL4iFRRWHPNp84C/COg5d7nGhpGz6KspkQbxacP89B3NPJ9l2",
    email: "janetjanet@gmail.com",
    firstName: "janet",
    lastName: "janet",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "JANETJANET@yailwt",
    referredBy: 26, // This will need to be mapped
    country: "kenya",
    phoneNumber: "5675283993"
  },
  {
    username: "webexpertkenya",
    password: "$2b$10$zA6jg8.uQ94eKn/v9J1vluZNgCjpLMQMIGezLWIneCjHykva/L2Q6",
    email: "webexperkenya@gmail.com",
    firstName: "Web",
    lastName: "Expert",
    walletBalance: "0",
    active: true,
    role: "admin",
    referralCode: "WEBEXPERTefCiJV",
    referredBy: null,
    country: null,
    phoneNumber: null
  }
];

async function main() {
  console.log('Importing users from MySQL export...');
  
  // Create a mapping of old IDs to new IDs for referral relationships
  const idMapping: { [oldId: number]: number } = {};
  
  // First pass: Create all users without referral relationships
  for (const userData of usersToImport) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(schema.users).where(
        schema.eq(schema.users.email, userData.email)
      );
      
      if (existingUser.length > 0) {
        console.log(`User ${userData.username} already exists, skipping...`);
        continue;
      }
      
      // Create user without referredBy first
      const userToCreate = {
        ...userData,
        referredBy: null // We'll update this in the second pass
      };
      
      const [newUser] = await db.insert(schema.users).values(userToCreate).returning();
      console.log(`Created user: ${newUser.username} with ID: ${newUser.id}`);
      
    } catch (error) {
      console.error(`Error creating user ${userData.username}:`, error);
    }
  }
  
  console.log('User import completed!');
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (e) => {
    console.error('Error during user import:', e);
    await pool.end();
    process.exit(1);
  });
