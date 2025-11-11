import { Client, Databases, ID, Query } from 'node-appwrite';

// This function is triggered when a new job is created
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Parse the event data (new job document)
    const eventData = JSON.parse(req.variables.APPWRITE_FUNCTION_EVENT_DATA || '{}');
    
    log('📢 New job posted!');
    log(`Job: ${eventData.title} at ${eventData.companyName}`);
    log(`Deadline: ${eventData.applicationDeadline}`);

    // Extract job eligibility criteria
    const minCGPA = parseFloat(eventData.minCGPA) || 0;
    const noBacklogs = eventData.noBacklogs || false;
    const eligibleDepartments = Array.isArray(eventData.departments) ? eventData.departments : [];
    
    log(`Criteria: minCGPA=${minCGPA}, noBacklogs=${noBacklogs}, departments=${eligibleDepartments.join(', ')}`);

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const usersCollectionId = process.env.APPWRITE_USERS_COLLECTION_ID;
    const notificationsCollectionId = process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID;

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

    log(`Found ${allStudents.length} total students`);

    // Filter students based on eligibility criteria
    const eligibleStudents = allStudents.filter(student => {
      // Check department eligibility
      if (eligibleDepartments.length > 0 && !eligibleDepartments.includes(student.department)) {
        return false;
      }

      // Check CGPA eligibility
      const studentCGPA = parseFloat(student.currentCgpa) || 0;
      if (studentCGPA < minCGPA) {
        return false;
      }

      // Check backlog eligibility
      if (noBacklogs) {
        const hasActiveBacklog = student.activeBacklog === 'Yes';
        const hasHistoryOfArrear = student.historyOfArrear === 'Yes';
        if (hasActiveBacklog || hasHistoryOfArrear) {
          return false;
        }
      }

      return true;
    });

    log(`Found ${eligibleStudents.length} eligible students to notify`);

    // Create notifications for all eligible students in batches
    const batchSize = 50;
    let successCount = 0;

    for (let i = 0; i < eligibleStudents.length; i += batchSize) {
      const batch = eligibleStudents.slice(i, i + batchSize);
      
      const notificationPromises = batch.map(student =>
        databases.createDocument(
          databaseId,
          notificationsCollectionId,
          ID.unique(),
          {
            userId: student.$id,
            title: '🎉 New Job Posted!',
            message: `A new job opportunity at ${eventData.companyName} for ${eventData.title} is now available. Apply before ${new Date(eventData.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}!`,
            type: 'new_job',
            jobId: eventData.$id,
            read: false,
            createdAt: new Date().toISOString(),
          }
        ).then(() => {
          successCount++;
        }).catch((err) => {
          error(`Failed for user ${student.$id}: ${err.message}`);
        })
      );

      await Promise.all(notificationPromises);
    }

    log(`✅ Successfully sent ${successCount} notifications to eligible students`);

    return res.json({
      success: true,
      notificationsSent: successCount,
      totalStudents: allStudents.length,
      eligibleStudents: eligibleStudents.length,
      jobTitle: eventData.title,
      criteria: {
        minCGPA,
        noBacklogs,
        departments: eligibleDepartments
      }
    });

  } catch (err) {
    error('Error sending job notifications: ' + err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
