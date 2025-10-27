/**
 * Database Seeding Script for GCT Placement Portal
 * 
 * This script populates the database with test data for development and testing.
 * 
 * Usage:
 *   node scripts/seed-database.js
 * 
 * Requirements:
 *   - Appwrite project must be set up
 *   - All collections must be created
 *   - APPWRITE_API_KEY must be set in .env.local
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection IDs
const COLLECTIONS = {
  users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  jobs: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID,
  applications: process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID,
  placements: process.env.NEXT_PUBLIC_APPWRITE_PLACEMENTS_COLLECTION_ID,
  adminRoles: process.env.NEXT_PUBLIC_APPWRITE_ADMIN_ROLES_COLLECTION_ID,
  forumPosts: process.env.NEXT_PUBLIC_APPWRITE_FORUM_POSTS_COLLECTION_ID,
  forumComments: process.env.NEXT_PUBLIC_APPWRITE_FORUM_COMMENTS_COLLECTION_ID,
};

// Test data
const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const COMPANIES = [
  { name: 'Google', location: 'Bangalore', minCGPA: '8.0', salary: [2000000, 2500000] },
  { name: 'Microsoft', location: 'Hyderabad', minCGPA: '7.5', salary: [1800000, 2200000] },
  { name: 'Amazon', location: 'Bangalore', minCGPA: '7.0', salary: [1500000, 2000000] },
  { name: 'TCS', location: 'Chennai', minCGPA: '6.0', salary: [350000, 600000] },
  { name: 'Infosys', location: 'Bangalore', minCGPA: '6.5', salary: [450000, 700000] },
  { name: 'Wipro', location: 'Chennai', minCGPA: '6.0', salary: [400000, 650000] },
  { name: 'Zoho', location: 'Chennai', minCGPA: '7.0', salary: [600000, 1200000] },
  { name: 'Freshworks', location: 'Chennai', minCGPA: '7.5', salary: [800000, 1500000] },
];

const STUDENT_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Arun Prasad', 'Divya Lakshmi',
  'Karthik Rajan', 'Meera Bala', 'Suresh Babu', 'Lakshmi Devi',
  'Venkat Ramanan', 'Anitha Reddy', 'Harish Kannan', 'Sneha Menon',
  'Balaji Srinivasan', 'Deepika Iyer', 'Ganesh Murthy', 'Kavitha Nair',
];

// Utility functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCGPA(min = 6.0, max = 10.0) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateRollNumber(year, dept, index) {
  const deptCode = {
    'Computer Science and Engineering': 'CS',
    'Information Technology': 'IT',
    'Electronics and Communication Engineering': 'EC',
    'Electrical and Electronics Engineering': 'EE',
    'Mechanical Engineering': 'ME',
    'Civil Engineering': 'CE',
  };
  return `${year}${deptCode[dept]}${String(index).padStart(3, '0')}`;
}

function generateEmail(name, rollNo) {
  const username = name.toLowerCase().replace(/\s+/g, '.') + '.' + rollNo.toLowerCase();
  return `${username}@gct.ac.in`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Seeding functions
async function clearCollections() {
  console.log('🗑️  Clearing existing test data...\n');
  
  try {
    // Clear forum comments first (has foreign key to posts)
    const comments = await databases.listDocuments(databaseId, COLLECTIONS.forumComments);
    for (const comment of comments.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.forumComments, comment.$id);
    }
    console.log(`   ✓ Cleared ${comments.documents.length} forum comments`);

    // Clear forum posts
    const posts = await databases.listDocuments(databaseId, COLLECTIONS.forumPosts);
    for (const post of posts.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.forumPosts, post.$id);
    }
    console.log(`   ✓ Cleared ${posts.documents.length} forum posts`);

    // Clear applications
    const applications = await databases.listDocuments(databaseId, COLLECTIONS.applications);
    for (const app of applications.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.applications, app.$id);
    }
    console.log(`   ✓ Cleared ${applications.documents.length} applications`);

    // Clear placements
    const placements = await databases.listDocuments(databaseId, COLLECTIONS.placements);
    for (const placement of placements.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.placements, placement.$id);
    }
    console.log(`   ✓ Cleared ${placements.documents.length} placements`);

    // Clear jobs
    const jobs = await databases.listDocuments(databaseId, COLLECTIONS.jobs);
    for (const job of jobs.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.jobs, job.$id);
    }
    console.log(`   ✓ Cleared ${jobs.documents.length} jobs`);

    // Clear user profiles (documents)
    const userDocs = await databases.listDocuments(databaseId, COLLECTIONS.users);
    for (const userDoc of userDocs.documents) {
      await databases.deleteDocument(databaseId, COLLECTIONS.users, userDoc.$id);
    }
    console.log(`   ✓ Cleared ${userDocs.documents.length} user profiles`);

    console.log('\n✅ All collections cleared!\n');
  } catch (error) {
    console.error('❌ Error clearing collections:', error.message);
  }
}

async function seedAdminRoles() {
  console.log('👤 Creating admin roles...\n');
  
  const admins = [
    {
      email: 'coordinator@gct.ac.in',
      name: 'Dr. Placement Coordinator',
      role: 'placement_coordinator',
      department: 'Computer Science and Engineering',
      isActive: true,
    },
    {
      email: 'rep1@gct.ac.in',
      name: 'Rajesh Kumar - Placement Rep',
      role: 'placement_rep',
      department: 'Computer Science and Engineering',
      isActive: true,
    },
    {
      email: 'rep2@gct.ac.in',
      name: 'Priya Sharma - Placement Rep',
      role: 'placement_rep',
      department: 'Information Technology',
      isActive: true,
    },
  ];

  for (const admin of admins) {
    try {
      await databases.createDocument(
        databaseId,
        COLLECTIONS.adminRoles,
        sdk.ID.unique(),
        admin
      );
      console.log(`   ✓ Created admin: ${admin.name} (${admin.role})`);
    } catch (error) {
      console.error(`   ✗ Failed to create admin ${admin.email}:`, error.message);
    }
  }
  
  console.log('\n✅ Admin roles created!\n');
}

async function seedStudents() {
  console.log('🎓 Creating student profiles...\n');
  
  const createdUsers = [];
  
  for (let i = 0; i < 16; i++) {
    const name = STUDENT_NAMES[i];
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const batch = i < 8 ? '2021-2025' : '2022-2026';
    const year = i < 8 ? '21' : '22';
    const rollNo = generateRollNumber(year, department, i + 1);
    const email = generateEmail(name, rollNo);
    const cgpa = randomCGPA(6.5, 9.5);
    
    try {
      // Create auth user
      const password = 'Test@123'; // Default password for all test users
      const authUser = await users.create(
        sdk.ID.unique(),
        email,
        undefined, // phone
        password,
        name
      );

      // Create user profile document
      const profile = {
        userId: authUser.$id,
        fullName: name,
        email: email,
        collegeEmail: email,
        personalEmail: email.replace('@gct.ac.in', '@gmail.com'),
        phoneNo: `98${randomInt(10000000, 99999999)}`,
        rollNo: rollNo,
        batch: batch,
        department: department,
        currentCgpa: cgpa,
        
        // Academic details
        tenthMarkPercent: String(randomInt(80, 95)),
        tenthBoard: 'State Board',
        tenthYearOfPassing: String(parseInt(year) + 2000 - 8),
        
        twelthMarkPercent: String(randomInt(75, 95)),
        twelthBoard: 'State Board',
        twelthYearOfPassing: String(parseInt(year) + 2000 - 6),
        
        activeBacklog: Math.random() > 0.8 ? 'Yes' : 'No',
        historyOfArrear: Math.random() > 0.7 ? 'Yes' : 'No',
        noOfBacklogs: Math.random() > 0.8 ? String(randomInt(1, 3)) : '0',
        
        // Optional fields
        dateOfBirth: `200${randomInt(0, 5)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        currentAddress: `${randomInt(1, 100)}, Main Street, Coimbatore`,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641013',
        
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        
        isPlacementRep: i === 0, // First student is placement rep
        repDepartment: i === 0 ? department : undefined,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const userDoc = await databases.createDocument(
        databaseId,
        COLLECTIONS.users,
        authUser.$id,
        profile
      );
      
      createdUsers.push({ authUser, profile: userDoc });
      console.log(`   ✓ Created student: ${name} (${rollNo}) - CGPA: ${cgpa}`);
    } catch (error) {
      console.error(`   ✗ Failed to create student ${name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${createdUsers.length} students!\n`);
  return createdUsers;
}

async function seedJobs(studentUsers) {
  console.log('💼 Creating job postings...\n');
  
  const createdJobs = [];
  const today = new Date();
  
  for (const company of COMPANIES) {
    try {
      const eligibleDepts = DEPARTMENTS.slice(0, randomInt(2, 6));
      const deadline = new Date(today.getTime() + randomInt(7, 30) * 24 * 60 * 60 * 1000);
      const driveDate = new Date(deadline.getTime() + randomInt(3, 10) * 24 * 60 * 60 * 1000);
      
      const job = {
        company: company.name,
        title: randomElement(['Software Engineer', 'Software Developer', 'Full Stack Developer', 'Backend Developer']),
        role: randomElement(['Developer', 'Engineer', 'Analyst', 'Consultant']),
        description: `${company.name} is hiring talented graduates for ${company.location} office. Great opportunity to work with cutting-edge technologies.`,
        requirements: 'Strong problem-solving skills, Good communication, Team player',
        responsibilities: 'Develop and maintain software applications, Collaborate with team members, Write clean code',
        
        salaryMin: company.salary[0],
        salaryMax: company.salary[1],
        salaryCurrency: 'INR',
        jobType: randomElement(['Full-time', 'Full-time', 'Full-time', 'Internship']),
        
        departments: eligibleDepts,
        minCGPA: company.minCGPA,
        noBacklogs: Math.random() > 0.5,
        eligibleBatches: ['2021-2025', '2022-2026'],
        
        applicationDeadline: deadline.toISOString(),
        placementDriveDate: driveDate.toISOString(),
        location: company.location,
        workMode: randomElement(['On-site', 'Hybrid', 'Remote']),
        
        status: 'open',
        postedBy: 'admin',
        totalApplications: 0,
        shortlistedCount: 0,
        selectedCount: 0,
        
        createdAt: randomDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), today).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const jobDoc = await databases.createDocument(
        databaseId,
        COLLECTIONS.jobs,
        sdk.ID.unique(),
        job
      );
      
      createdJobs.push(jobDoc);
      console.log(`   ✓ Created job: ${job.title} at ${company.name}`);
    } catch (error) {
      console.error(`   ✗ Failed to create job for ${company.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${createdJobs.length} jobs!\n`);
  return createdJobs;
}

async function seedApplications(studentUsers, jobs) {
  console.log('📋 Creating job applications...\n');
  
  const statuses = ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected'];
  let applicationCount = 0;
  
  for (const job of jobs) {
    // Each job gets 3-8 applications
    const numApplications = randomInt(3, 8);
    const eligibleStudents = studentUsers.filter(s => 
      job.departments.includes(s.profile.department) &&
      parseFloat(s.profile.currentCgpa) >= parseFloat(job.minCGPA)
    );
    
    const selectedStudents = eligibleStudents
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numApplications, eligibleStudents.length));
    
    for (const student of selectedStudents) {
      try {
        const status = randomElement(statuses);
        const appliedDate = randomDate(
          new Date(job.createdAt),
          new Date()
        );
        
        const application = {
          jobId: job.$id,
          userId: student.authUser.$id,
          jobTitle: job.title,
          company: job.company,
          status: status,
          appliedAt: appliedDate,
          createdAt: appliedDate,
          updatedAt: new Date().toISOString(),
        };
        
        await databases.createDocument(
          databaseId,
          COLLECTIONS.applications,
          sdk.ID.unique(),
          application
        );
        
        applicationCount++;
        
        // If shortlisted, create placement record
        if (status === 'shortlisted') {
          await createPlacementRecord(student, job);
        }
      } catch (error) {
        console.error(`   ✗ Failed to create application:`, error.message);
      }
    }
  }
  
  console.log(`   ✓ Created ${applicationCount} applications across all jobs`);
  console.log('\n✅ Applications created!\n');
}

async function createPlacementRecord(student, job) {
  try {
    const placement = {
      studentId: student.authUser.$id,
      studentName: student.profile.fullName,
      studentRollNo: student.profile.rollNo,
      studentDepartment: student.profile.department,
      studentBatch: student.profile.batch,
      
      company: job.company,
      role: job.title,
      package: randomInt(job.salaryMin, job.salaryMax),
      packageCurrency: 'INR',
      jobType: job.jobType,
      location: job.location,
      
      placementDate: new Date().toISOString(),
      joiningDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days later
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await databases.createDocument(
      databaseId,
      COLLECTIONS.placements,
      sdk.ID.unique(),
      placement
    );
  } catch (error) {
    console.error(`   ✗ Failed to create placement record:`, error.message);
  }
}

async function seedForumPosts(studentUsers) {
  console.log('💬 Creating forum posts...\n');
  
  const categories = [
    'General',
    'Interview Experiences',
    'Company Reviews',
    'Placement Tips',
    'Technical Doubts',
    'Resume Review',
  ];
  
  const postTemplates = [
    {
      title: 'Google Interview Experience - Software Engineer Role',
      content: 'Just finished my Google interview rounds. The process was intense but amazing. Here\'s my experience:\n\nRound 1: Online coding test on HackerRank (2 DSA problems)\nRound 2: Technical round (System Design)\nRound 3: Technical round (Data Structures)\nRound 4: HR round\n\nOverall, focus on LeetCode medium-hard problems!',
      category: 'Interview Experiences',
      tags: ['Google', 'Interview', 'Software Engineer'],
    },
    {
      title: 'How to prepare for placements in final year?',
      content: 'I\'m in my pre-final year and want to start preparing for placements. What should I focus on? DSA? Development? Both?',
      category: 'Placement Tips',
      tags: ['Preparation', 'Advice', 'DSA'],
    },
    {
      title: 'TCS Digital vs TCS Ninja - Which is better?',
      content: 'I have offers from both TCS Digital and TCS Ninja. Can someone explain the key differences and which one should I choose?',
      category: 'Company Reviews',
      tags: ['TCS', 'Job Offer', 'Comparison'],
    },
    {
      title: 'Resume review needed - Applying for SDE roles',
      content: 'Hi everyone! I\'m applying for SDE roles and would appreciate feedback on my resume. I have projects in React, Node.js, and MongoDB. Is that enough?',
      category: 'Resume Review',
      tags: ['Resume', 'Feedback', 'SDE'],
    },
    {
      title: 'Best resources for System Design preparation',
      content: 'Can someone share good resources for system design? I have interviews coming up and want to prepare well.',
      category: 'Technical Doubts',
      tags: ['System Design', 'Resources', 'Learning'],
    },
  ];
  
  const createdPosts = [];
  
  for (let i = 0; i < postTemplates.length; i++) {
    const template = postTemplates[i];
    const author = studentUsers[i % studentUsers.length];
    
    try {
      const post = {
        title: template.title,
        content: template.content,
        authorId: author.authUser.$id,
        authorName: author.profile.fullName,
        category: template.category,
        tags: template.tags,
        viewCount: randomInt(10, 200),
        commentCount: 0, // Will be updated when we add comments
        isPinned: i === 0, // Pin first post
        isClosed: false,
      };
      
      const postDoc = await databases.createDocument(
        databaseId,
        COLLECTIONS.forumPosts,
        sdk.ID.unique(),
        post
      );
      
      createdPosts.push(postDoc);
      console.log(`   ✓ Created post: "${template.title}"`);
    } catch (error) {
      console.error(`   ✗ Failed to create post:`, error.message);
    }
  }
  
  console.log(`\n✅ Created ${createdPosts.length} forum posts!\n`);
  return createdPosts;
}

async function seedForumComments(studentUsers, posts) {
  console.log('💬 Creating forum comments...\n');
  
  const commentTemplates = [
    'Great post! Thanks for sharing your experience.',
    'This is very helpful. I was looking for exactly this information.',
    'Can you elaborate more on this point?',
    'I had a similar experience! Totally agree with you.',
    'Thanks for the detailed explanation!',
    'Very insightful. Saved this for future reference.',
  ];
  
  let commentCount = 0;
  
  for (const post of posts) {
    // Each post gets 2-5 comments
    const numComments = randomInt(2, 5);
    
    for (let i = 0; i < numComments; i++) {
      const commenter = randomElement(studentUsers);
      
      try {
        const comment = {
          postId: post.$id,
          content: randomElement(commentTemplates),
          authorId: commenter.authUser.$id,
          authorName: commenter.profile.fullName,
          parentCommentId: null, // No nested comments for now
        };
        
        await databases.createDocument(
          databaseId,
          COLLECTIONS.forumComments,
          sdk.ID.unique(),
          comment
        );
        
        commentCount++;
      } catch (error) {
        console.error(`   ✗ Failed to create comment:`, error.message);
      }
    }
    
    // Update post comment count
    try {
      await databases.updateDocument(
        databaseId,
        COLLECTIONS.forumPosts,
        post.$id,
        { commentCount: numComments }
      );
    } catch (error) {
      console.error(`   ✗ Failed to update comment count:`, error.message);
    }
  }
  
  console.log(`   ✓ Created ${commentCount} comments across all posts`);
  console.log('\n✅ Forum comments created!\n');
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    // Clear existing data (optional - comment out if you want to keep data)
    await clearCollections();
    
    // Seed in order (respecting foreign key constraints)
    await seedAdminRoles();
    const studentUsers = await seedStudents();
    const jobs = await seedJobs(studentUsers);
    await seedApplications(studentUsers, jobs);
    const posts = await seedForumPosts(studentUsers);
    await seedForumComments(studentUsers, posts);
    
    console.log('═══════════════════════════════════════════════');
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Coordinators: 1`);
    console.log(`   • Placement Reps: 2`);
    console.log(`   • Students: ${studentUsers.length}`);
    console.log(`   • Jobs: ${jobs.length}`);
    console.log(`   • Forum posts: ${posts.length}`);
    console.log('\n📝 Test Login Credentials:');
    console.log('   👤 Students:');
    console.log('      Email: rajesh.kumar.21cs001@gct.ac.in (or any student email)');
    console.log('      Password: Test@123');
    console.log('\n   👨‍💼 Placement Coordinators/Reps:');
    console.log('      Email: coordinator@gct.ac.in / rep1@gct.ac.in / rep2@gct.ac.in');
    console.log('      Password: Create these users manually in Appwrite console');
    console.log('\n💡 Tip: First create admin auth accounts in Appwrite, then run this script\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
