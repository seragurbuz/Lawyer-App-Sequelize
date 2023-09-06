import Job from '../models/jobModel'; 
import { CreateJobInput } from '../schemas/jobSchema';
import Lawyer from '../models/lawyerModel';

// Function to create a new job
export async function createJob(input: CreateJobInput, creatorLawyerID: number): Promise<Job | null> {
  try {
    const { description, end_date } = input.body;
    const endDate = new Date(end_date);

    const job = await Job.create({
      description,
      end_date: endDate,
      creator_lawyer_id: creatorLawyerID,
    });

    return job.toJSON();
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

// Function to end a job
export async function endJob(jobId: number, lawyerId: number): Promise<boolean | string> {
  try {
    // Find the job by ID
    const job = await Job.findByPk(jobId);

    if (!job) {
      return 'Job not found.';
    }

    // Check if the lawyer trying to end the job is the lawyer responsible for the job
    if (job.lawyer_id !== lawyerId) {
      return "You don't have the permission to end this job.";
    }

    // Update the job's end_date and job_state to mark it as ended
    job.end_date = new Date();
    job.job_state = 'ended';
    await job.save();

    // Set the associated lawyer's status back to "available"
    const lawyer = await Lawyer.findByPk(lawyerId);

    if (!lawyer) {
      return 'Lawyer not found.';
    }

    lawyer.status = 'available';
    await lawyer.save();

    return true;
  } catch (error) {
    console.error('Error ending job:', error);
    return false;
  }
}

// Function to get a job by its ID
export async function getJobById(jobId: number): Promise<Job | null> {
  try {
    const job = await Job.findByPk(jobId);

    if (!job) {
      return null; // Job not found
    }

    return job.toJSON();
  } catch (error) {
    console.error('Error getting job by ID:', error);
    return null;
  }
}

// Function to list jobs created by a lawyer
export async function listCreatedJobs(lawyerId: number): Promise<Job[]> {
  try {
    const jobs = await Job.findAll({
      where: {
        creator_lawyer_id: lawyerId,
      },
    });

    return jobs.map((job) => job.toJSON() as Job);
  } catch (error) {
    console.error('Error listing created jobs:', error);
    return [];
  }
}
