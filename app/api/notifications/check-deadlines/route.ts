import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases, ID, Query } from 'node-appwrite'
import { EmailService } from '@/lib/email'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  jobsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID || '',
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
  applicationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID || '',
  notificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
}

export async function POST(request: NextRequest) {
  try {
    console.log('⏰ Starting deadline check...')

    // Calculate tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    console.log(`📅 Checking for deadlines on: ${tomorrow.toDateString()}`)

    // Get all active jobs
    const jobs = await databases.listDocuments(
      config.databaseId,
      config.jobsCollectionId,
      [Query.equal('status', 'active'), Query.limit(1000)]
    )

    console.log(`📊 Found ${jobs.documents.length} active jobs`)

    let notificationCount = 0
    let jobsWithDeadlines = 0

    for (const job of jobs.documents) {
      const deadline = new Date(job.applicationDeadline)
      
      // Check if deadline is tomorrow
      if (deadline >= tomorrow && deadline < dayAfterTomorrow) {
        jobsWithDeadlines++
        console.log(`⏰ Found job with deadline tomorrow: "${job.title}" at ${job.companyName}`)
        
        // Extract job eligibility criteria
        const minCGPA = parseFloat(job.minCGPA) || 0;
        const noBacklogs = job.noBacklogs || false;
        const eligibleDepartments = Array.isArray(job.departments) ? job.departments : [];
        
        console.log(`  📋 Job criteria: minCGPA=${minCGPA}, noBacklogs=${noBacklogs}, departments=${eligibleDepartments.join(', ')}`);
        
        // Get all applications for this job
        const applications = await databases.listDocuments(
          config.databaseId,
          config.applicationsCollectionId,
          [Query.equal('jobId', job.$id), Query.limit(1000)]
        )

        const appliedUserIds = applications.documents.map((app: any) => app.userId)
        console.log(`  📝 ${applications.documents.length} students already applied`)
        
        // Get all students
        let allStudents: any[] = []
        let offset = 0
        const limit = 100
        
        while (true) {
          const users = await databases.listDocuments(
            config.databaseId,
            config.usersCollectionId,
            [
              Query.limit(limit),
              Query.offset(offset)
            ]
          )
          
          const students = users.documents.filter((user: any) => 
            user.role === 'student' || !user.role
          )
          
          allStudents.push(...students)
          
          if (users.documents.length < limit) break
          offset += limit
        }

        // Filter students who haven't applied AND meet eligibility criteria
        const studentsToNotify = allStudents.filter(student => {
          // Skip if already applied
          if (appliedUserIds.includes(student.$id)) {
            return false;
          }

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

        console.log(`  📤 Sending deadline reminder to ${studentsToNotify.length} eligible students who haven't applied`)

        // Create deadline reminder notifications and emails in batches
        const batchSize = 50
        let emailCount = 0
        
        for (let i = 0; i < studentsToNotify.length; i += batchSize) {
          const batch = studentsToNotify.slice(i, i + batchSize)
          
          const notificationPromises = batch.map(async (student) => {
            try {
              // Create in-app notification
              await databases.createDocument(
                config.databaseId,
                config.notificationsCollectionId,
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
              );

              // Send email reminder (only to students who haven't applied)
              const studentEmail = student.collegeEmail || student.personalEmail;
              if (studentEmail) {
                await EmailService.logEmail({
                  to: studentEmail,
                  subject: `⏰ Deadline Tomorrow: ${job.title} at ${job.companyName}`,
                  jobTitle: job.title,
                  companyName: job.companyName,
                  jobId: job.$id,
                  deadline: job.applicationDeadline,
                  type: 'deadline_reminder',
                });
                emailCount++;
              }
            } catch (error: any) {
              console.error(`    ❌ Failed to notify user ${student.$id}:`, error.message);
            }
          });

          await Promise.all(notificationPromises)
        }
        
        console.log(`  📧 ${emailCount} emails prepared for deadline reminders`);
        
        notificationCount += studentsToNotify.length
      }
    }

    console.log(`✅ Deadline check complete: ${jobsWithDeadlines} jobs with deadlines tomorrow`)
    console.log(`📤 Sent ${notificationCount} deadline reminder notifications`)

    return NextResponse.json({
      success: true,
      message: `Deadline check complete`,
      stats: {
        totalJobs: jobs.documents.length,
        jobsWithDeadlines,
        notificationsSent: notificationCount
      }
    })
  } catch (error: any) {
    console.error('❌ Check deadlines error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check deadlines' },
      { status: 500 }
    )
  }
}
