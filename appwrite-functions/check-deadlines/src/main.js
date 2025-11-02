import { Client, Databases, ID, Query } from 'node-appwrite';

// This function is triggered daily by schedule
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    log('⏰ Starting deadline check...');

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const jobsCollectionId = process.env.APPWRITE_JOBS_COLLECTION_ID;
    const usersCollectionId = process.env.APPWRITE_USERS_COLLECTION_ID;
    const applicationsCollectionId = process.env.APPWRITE_APPLICATIONS_COLLECTION_ID;
    const notificationsCollectionId = process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID;

    // Calculate tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    log(`Checking for deadlines on: ${tomorrow.toDateString()}`);

    // Get all active jobs
    const jobs = await databases.listDocuments(
      databaseId,
      jobsCollectionId,
      [Query.equal('status', 'active'), Query.limit(1000)]
    );

    log(`Found ${jobs.documents.length} active jobs`);

    let notificationCount = 0;
    let jobsWithDeadlines = 0;

    for (const job of jobs.documents) {
      const deadline = new Date(job.applicationDeadline);
      
      // Check if deadline is tomorrow
      if (deadline >= tomorrow && deadline < dayAfterTomorrow) {
        jobsWithDeadlines++;
        log(`Found job with deadline tomorrow: "${job.title}"`);
        
        // Get all applications for this job
        const applications = await databases.listDocuments(
          databaseId,
          applicationsCollectionId,
          [Query.equal('jobId', job.$id), Query.limit(1000)]
        );

        const appliedUserIds = applications.documents.map(app => app.userId);
        log(`  ${applications.documents.length} students already applied`);
        
        // Get all students
        let allStudents = [];
        let offset = 0;
        const limit = 100;
        
        while (true) {
          const users = await databases.listDocuments(
            databaseId,
            usersCollectionId,
            [
              Query.limit(limit),
              Query.offset(offset)
            ]
          );
          
          const students = users.documents.filter(user => 
            user.role === 'student' || !user.role
          );
          
          allStudents.push(...students);
          
          if (users.documents.length < limit) break;
          offset += limit;
        }

        // Filter students who haven't applied
        const studentsToNotify = allStudents.filter(
          student => !appliedUserIds.includes(student.$id)
        );

        log(`  Sending reminder to ${studentsToNotify.length} students`);

        // Create notifications in batches
        const batchSize = 50;
        for (let i = 0; i < studentsToNotify.length; i += batchSize) {
          const batch = studentsToNotify.slice(i, i + batchSize);
          
          const notificationPromises = batch.map(student =>
            databases.createDocument(
              databaseId,
              notificationsCollectionId,
              ID.unique(),
              {
                userId: student.$id,
                title: '⏰ Application Deadline Tomorrow!',
                message: `The application deadline for "${job.title}" at ${job.companyName} is tomorrow (${new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}). Don't miss out!`,
                type: 'deadline_reminder',
                jobId: job.$id,
                read: false,
                createdAt: new Date().toISOString(),
              }
            ).catch(err => {
              error(`Failed for user ${student.$id}: ${err.message}`);
            })
          );

          await Promise.all(notificationPromises);
        }
        
        notificationCount += studentsToNotify.length;
      }
    }

    log(`✅ Deadline check complete`);
    log(`Jobs with deadlines tomorrow: ${jobsWithDeadlines}`);
    log(`Notifications sent: ${notificationCount}`);

    return res.json({
      success: true,
      jobsWithDeadlines,
      notificationsSent: notificationCount
    });

  } catch (err) {
    error('Error checking deadlines: ' + err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
