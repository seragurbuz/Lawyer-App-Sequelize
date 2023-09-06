import Offer from '../models/offerModel';
import RejectedOffer from '../models/rejectedOfferModel';
import Job from '../models/jobModel';
import Lawyer from '../models/lawyerModel';

// Function to make an offer
export async function makeOffer(fromLawyerId: number, toLawyerId: number, jobId: number): Promise<boolean | string> {
  try {
    // Fetch the creator lawyer's ID associated with the job
    const job = await Job.findByPk(jobId);

    if (!job) {
      return 'Job not found.';
    }

    const creatorLawyerId = job.creator_lawyer_id;

    // Check if the lawyer making the offer is the creator lawyer
    if (fromLawyerId !== creatorLawyerId) {
      return 'Only the creator lawyer can make offers for this job.';
    }

    // Check if the job has already been offered
    const offerExists = await Offer.findOne({
      where: {
        from_lawyer_id: fromLawyerId,
        job_id: jobId,
      },
    });

    if (offerExists) {
      return 'The same job has already been offered to someone else.';
    }

    // Insert the offer into the offers table
    await Offer.create({
      from_lawyer_id: fromLawyerId,
      to_lawyer_id: toLawyerId,
      job_id: jobId,
      state: 'waiting',
    });

    return true;
  } catch (error) {
    console.error('Error making offer:', error);
    return false;
  }
}

// Function to reject an offer
export async function rejectOffer(offerId: number, lawyerId: number): Promise<boolean | string> {
  try {
    // Get the offer details
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return 'Offer not found.';
    }

    const { from_lawyer_id, to_lawyer_id, job_id } = offer;

    if (to_lawyer_id !== lawyerId) {
      return 'This job is not offered to the current user.';
    }

    // Insert the rejected offer into the rejected_offers table
    await RejectedOffer.create({
      from_lawyer_id: from_lawyer_id,
      to_lawyer_id: to_lawyer_id,
      job_id: job_id,
    });

    // Delete the offer
    await Offer.destroy({
      where: {
        offer_id: offerId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error rejecting offer:', error);
    return false;
  }
}

// Function to accept an offer
export async function acceptOffer(offerId: number, lawyerId: number): Promise<boolean | string> {
  try {
    // Get the offer details
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return 'Offer not found.';
    }

    const { to_lawyer_id, job_id } = offer;

    if (to_lawyer_id !== lawyerId) {
      return 'This job is not offered to the current user.';
    }

    // Update the offer state to "accepted"
    await Offer.update(
      {
        state: 'accepted',
      },
      {
        where: {
          offer_id: offerId,
        },
      }
    );

    // Update the job's lawyer_id with the accepted lawyer
    await Job.update(
      {
        lawyer_id: to_lawyer_id,
        start_date: new Date(),
        job_state: 'started',
      },
      {
        where: {
          job_id: job_id,
        },
      }
    );

    // Set the associated lawyer's status back to "reserved"
    await Lawyer.update(
      {
        status: 'reserved',
      },
      {
        where: {
          lawyer_id: to_lawyer_id,
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Error accepting offer:', error);
    return false;
  }
}

// Function to list offers sent by a lawyer
export async function listSentOffers(fromLawyerId: number): Promise<Offer[]> {
  try {
    const offers = await Offer.findAll({
      where: {
        from_lawyer_id: fromLawyerId,
      },
      include: [
        {
          model: Job,
          attributes: ['description', 'end_date'],
        },
      ],    });

      return offers;
  } catch (error) {
    console.error('Error listing sent offers:', error);
    return [];
  }
}

// Function to list offers received by a lawyer
export async function listReceivedOffers(toLawyerId: number): Promise<Offer[]> {
  try {
    const offers = await Offer.findAll({
      where: {
        to_lawyer_id: toLawyerId,
      },
      include: [
        {
          model: Job,
          attributes: ['description', 'end_date'],
        },
      ],
    });

    return offers;
  } catch (error) {
    console.error('Error listing received offers:', error);
    return [];
  }
}

// Function to delete an offer
export async function deleteOffer(offerId: number, lawyerId: number): Promise<boolean | string> {
  try {
    // Fetch the offer details
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return 'Offer not found.';
    }

    const { from_lawyer_id } = offer;

    // Check if the lawyer trying to delete the offer is the creator
    if (from_lawyer_id !== lawyerId) {
      return 'Only the creator lawyer can delete this offer.';
    }

    // Delete the offer
    await Offer.destroy({
      where: {
        offer_id: offerId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting offer:', error);
    return false;
  }
}
