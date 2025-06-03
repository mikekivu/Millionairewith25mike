
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import ws from 'ws';

// Set WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

// Set up database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

// Complete user data from all MySQL exports
const allUsersToImport = [
  // Original users
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
    referredBy: null, // Will be updated after initial import
    country: null,
    phoneNumber: null,
    oldId: 5
  },
  {
    username: "mikepaul",
    password: "$2b$10$RaINHef57rVP0d7bFVqzGOYQ3f/QfcKrtVh7OMRnQAzQZjt4zCHVK",
    email: "mikepaul620@gmail.com",
    firstName: "Mike",
    lastName: "Paul",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MIKEPAUL1bpilc",
    referredBy: null, // Will be updated after initial import
    country: null,
    phoneNumber: null,
    oldId: 6
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
    referredBy: null, // Will be updated after initial import
    country: null,
    phoneNumber: null,
    oldId: 7
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
    referredBy: null, // Will be updated after initial import
    country: null,
    phoneNumber: null,
    oldId: 8
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
    phoneNumber: null,
    oldId: 9
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
    phoneNumber: "0745536445",
    oldId: 10
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
    phoneNumber: "1234567",
    oldId: 11
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
    referredBy: null, // Will be updated after initial import
    country: "kenya",
    phoneNumber: "07868645776",
    oldId: 12
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
    referredBy: null, // Will be updated after initial import
    country: "Kenya",
    phoneNumber: "7868645776",
    oldId: 13
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
    referredBy: null, // Will be updated after initial import
    country: "kenya",
    phoneNumber: "5623784878",
    oldId: 14
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
    referredBy: null, // Will be updated after initial import
    country: "kenya",
    phoneNumber: "5675283993",
    oldId: 15
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
    phoneNumber: null,
    oldId: 16
  },
  // Additional users from MySQL exports
  {
    username: "musyokawa",
    password: "$2b$10$7XAyKJXZJGRscIhWo/2kNuOpo8audgtQ8UmzBxREJe72HBhwUWfLW",
    email: "musyoka@gmail.com",
    firstName: "musyoka",
    lastName: "mmm",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MUSYOKAWAhjhtr4",
    referredBy: null,
    country: "kenya",
    phoneNumber: "1435237717",
    oldId: 18
  },
  {
    username: "dkdenniskorir",
    password: "$2b$10$AH614FOSpSQJWSff1EUft.PDiuqYtOtbeta6pZ8o45SZWq6B//X/W",
    email: "dkdenniskorir66@gmail.com",
    firstName: "michael",
    lastName: "paul",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "DKDENNISKORIReo4e8u",
    referredBy: null,
    country: "Kenya",
    phoneNumber: "0746942707",
    oldId: 19
  },
  {
    username: "mutetidavid45632",
    password: "$2b$10$n.GxeNX/HxWXSHvFv3L71e9t5SxyLhMO8iXtvMFO.sgd7Ml2rKMCW",
    email: "mutetidavid45632@gmail.com",
    firstName: "muteti",
    lastName: "david",
    walletBalance: "0",
    active: true,
    role: "user",
    referralCode: "MUTETIDAVID4563262t3h8",
    referredBy: null,
    country: "kenya",
    phoneNumber: "564785656",
    oldId: 20
  }
];

// Referral mapping based on old MySQL IDs
const referralMapping = {
  5: 1,   // testuser referred by user with old ID 1
  6: 2,   // mikepaul referred by user with old ID 2  
  7: 3,   // mikekivu3 referred by user with old ID 3
  8: 3,   // webexpertkenya@gmail.com referred by user with old ID 3
  12: 22, // mativo referred by user with old ID 22 (not in our list)
  13: 3,  // mainamaina referred by user with old ID 3
  14: 25, // jacobjacob referred by user with old ID 25 (not in our list)  
  15: 26, // janetjanet@ referred by user with old ID 26 (not in our list)
};

async function main() {
  console.log('Importing all users from MySQL exports...');
  
  // Create a mapping of old IDs to new IDs for referral relationships
  const idMapping: { [oldId: number]: number } = {};
  
  // First pass: Create all users without referral relationships
  for (const userData of allUsersToImport) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(schema.users).where(
        eq(schema.users.email, userData.email)
      );
      
      if (existingUser.length > 0) {
        console.log(`User ${userData.username} already exists, storing ID mapping...`);
        if (userData.oldId) {
          idMapping[userData.oldId] = existingUser[0].id;
        }
        continue;
      }
      
      // Create user without referredBy first
      const userToCreate = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        walletBalance: userData.walletBalance,
        active: userData.active,
        role: userData.role as "user" | "admin",
        referralCode: userData.referralCode,
        referredBy: null, // We'll update this in the second pass
        country: userData.country,
        phoneNumber: userData.phoneNumber
      };
      
      const [newUser] = await db.insert(schema.users).values(userToCreate).returning();
      console.log(`Created user: ${newUser.username} with ID: ${newUser.id}`);
      
      // Store the mapping if this user had an old ID
      if (userData.oldId) {
        idMapping[userData.oldId] = newUser.id;
      }
      
    } catch (error) {
      console.error(`Error creating user ${userData.username}:`, error);
    }
  }
  
  // Second pass: Update referral relationships
  console.log('Updating referral relationships...');
  for (const userData of allUsersToImport) {
    if (userData.oldId && referralMapping[userData.oldId]) {
      const referredByOldId = referralMapping[userData.oldId];
      const referredByNewId = idMapping[referredByOldId];
      
      if (referredByNewId) {
        try {
          await db.update(schema.users)
            .set({ referredBy: referredByNewId })
            .where(eq(schema.users.email, userData.email));
          
          console.log(`Updated referral for ${userData.username}: referred by user ID ${referredByNewId}`);
        } catch (error) {
          console.error(`Error updating referral for ${userData.username}:`, error);
        }
      } else {
        console.log(`Warning: Could not find referrer for ${userData.username} (old referrer ID: ${referredByOldId})`);
      }
    }
  }
  
  console.log('All user import completed!');
  
  // Display final statistics
  const totalUsers = await db.select().from(schema.users);
  console.log(`Total users in database: ${totalUsers.length}`);
  
  const activeUsers = totalUsers.filter(user => user.active);
  console.log(`Active users: ${activeUsers.length}`);
  
  const adminUsers = totalUsers.filter(user => user.role === 'admin');
  console.log(`Admin users: ${adminUsers.length}`);
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
