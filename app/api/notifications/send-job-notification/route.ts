import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query, ID } from 'node-appwrite';
import { EmailService } from '@/lib/email';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, companyName, applicationDeadline } = body;

    if (!jobId || !jobTitle || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: jobId, jobTitle, companyName' },
        { status: 400 }
      );
    }

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
    const notificationsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '';

    // Get the job details to get the deadline
    let deadline = applicationDeadline;
    if (!deadline) {
      try {
        const job = await databases.getDocument(
          databaseId,
          process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID || '',
          jobId
        );
        deadline = job.applicationDeadline;
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    }

    // Get all students with their email addresses
    let allStudents: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const students = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        [
          Query.equal('role', 'student'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allStudents = allStudents.concat(students.documents);

      if (students.documents.length < limit) {
        break;
      }
      offset += limit;
    }

    console.log(`Found ${allStudents.length} students to notify`);

    // Create notifications and prepare email data in batches
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    let emailCount = 0;

    for (let i = 0; i < allStudents.length; i += batchSize) {
      const batch = allStudents.slice(i, i + batchSize);
      
      const promises = batch.map(async (student) => {
        try {
          // Create in-app notification
          await databases.createDocument(
            databaseId,
            notificationsCollectionId,
            ID.unique(),
            {
              userId: student.$id,
              title: `New Job Opening: ${jobTitle}`,
              message: `${companyName} is now hiring! Check out this new opportunity and apply before the deadline.`,
              type: 'new_job',
              jobId: jobId,
              read: false,
              createdAt: new Date().toISOString(),
            }
          );

          // Log email notification (Appwrite will handle actual sending if configured)
          const studentEmail = student.collegeEmail || student.personalEmail;
          if (studentEmail && deadline) {
            await EmailService.logEmail({
              to: studentEmail,
              subject: `New Job Opening: ${jobTitle} at ${companyName}`,
              jobTitle,
              companyName,
              jobId,
              deadline,
              type: 'new_job',
            });
            emailCount++;
          }

          return true;
        } catch (error) {
          console.error(`Failed to notify user ${student.$id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      successCount += results.filter(r => r !== null).length;
      errorCount += results.filter(r => r === null).length;
    }

    console.log(`Notifications sent: ${successCount} successful, ${errorCount} failed, ${emailCount} emails prepared`);

    return NextResponse.json({
      success: true,
      message: `Notifications sent to ${successCount} students`,
      stats: {
        total: allStudents.length,
        success: successCount,
        errors: errorCount,
        emailsPrepared: emailCount
      }
    });

  } catch (error: any) {
    console.error('Send job notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
