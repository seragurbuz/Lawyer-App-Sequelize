import { Request, Response } from 'express';
import { createLawyer, getLawyerProfileById, updateLawyerProfile, getAvailableLawyers, getLawyerLocation, updateLawyerLocation} from '../services/lawyerServices';
import { CreateLawyerInput, GetLawyerProfileInput, UpdateLawyerInput, UpdateLawyerLocationInput } from '../schemas/lawyerSchema';
import sendEmail from '../utils/mailer';

export interface GetAvailableLawyersQuery {
  city?: string;
  bar?: string;
  minRating?: string;
  maxRating?: string;
  sort?: 'asc' | 'desc';
}

// Controller function to create a new lawyer
export async function createLawyerHandler(req: Request<{}, {}, CreateLawyerInput["body"]>, res: Response) {
  try {

    const createdLawyer = await createLawyer(req);

    if (!createdLawyer) {
      return res.status(500).json({ error: 'Failed to create lawyer' });
    }

    // sending the verification code
    await sendEmail({
      to: createdLawyer.email,
      from: "test@example.com",
      subject: "Verify your email",
      text: `verification code: ${createdLawyer.verification_code}. Id: ${createdLawyer.lawyer_id}`,
    });

    // Extract only the desired fields
    const lawyerData = {
      verified: createdLawyer.verified,
      lawyer_id: createdLawyer.lawyer_id,
      first_name: createdLawyer.first_name,
      last_name: createdLawyer.last_name,
      email: createdLawyer.email,
      bar_id: createdLawyer.bar_id,
      status: createdLawyer.status,
    };

    return res.status(200).json(lawyerData);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create lawyer', message: error.message });
  }
}

// Controller func to get a lawyer's profile by id
export async function getLawyerProfileByIdHandler( req: Request<GetLawyerProfileInput["params"]>, res: Response ) {
  const lawyerId = Number(req.params.lawyer_id);

  if (isNaN(lawyerId)) {
    return res.status(400).send("Invalid lawyer_id");
  }
  try {
    const lawyer = await getLawyerProfileById(lawyerId);

    if (!lawyer) {
      return res.status(404).send("No lawyers found with the specified id");
    }
    // Extract only the desired fields
    const lawyerData = {
      verified: lawyer.verified,
      lawyer_id: lawyer.lawyer_id,
      first_name: lawyer.first_name,
      last_name: lawyer.last_name,
      email: lawyer.email,
      bar_id: lawyer.bar_id,
      status: lawyer.status,
      linkedin_url: lawyer.dataValues.LawyerProfile.linkedin_url,
      description: lawyer.dataValues.LawyerProfile.description,
      star_rating: lawyer.dataValues.LawyerProfile.star_rating,
    };
    

    return res.status(200).json(lawyerData);
  } catch (error) {
    console.error("Error getting lawyer:", error);
    return res.status(500).json({ error: "Failed to get lawyer" });
  }
}

// Controller function to get available lawyers
export async function getAvailableLawyersHandler(req: Request<{}, {}, {}, GetAvailableLawyersQuery>, res: Response) {
  const lawyerId = res.locals.user.lawyer_id;
  
  const { city, bar, minRating, maxRating, sort } = req.query;

  try {
    const lawyers = await getAvailableLawyers(lawyerId, {
      city: city ? Number(city) : undefined,
      bar: bar ? Number(bar) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      sort,
    });

    if (lawyers.length === 0) {
      return res.status(404).send('No available lawyers found for the specified criteria');
    }

    return res.status(200).json(lawyers);
  } catch (error) {
    console.error('Error getting available lawyers by bar ID:', error);
    return res.status(500).send('Failed to get available lawyers');
  }
}

// Controller function to update lawyer profile
export async function updateLawyerProfileHandler(req: Request<{}, {}, UpdateLawyerInput["body"]>, res: Response) {
  const lawyerId = res.locals.user.lawyer_id;

  const requestBodyFields = Object.keys(req.body);
  const allowedFields = ["first_name", "last_name", "bar_id", "status", "linkedin_url", "description"];

  // Check for invalid fields in the request body
  for (const field of requestBodyFields) {
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: "You entered a field that cannot be changed" });
    }
  }

  try {
    const updatedLawyerProfile = await updateLawyerProfile(lawyerId, req);

    if (!updatedLawyerProfile) {
      return res.status(404).json({ error: "Lawyer profile not found" });
    }

    // Extract only the desired fields
    const lawyerData = {
      verified: updatedLawyerProfile.verified,
      lawyer_id: updatedLawyerProfile.lawyer_id,
      first_name: updatedLawyerProfile.first_name,
      last_name: updatedLawyerProfile.last_name,
      email: updatedLawyerProfile.email,
      bar_id: updatedLawyerProfile.bar_id,
      status: updatedLawyerProfile.status,
      linkedin_url: updatedLawyerProfile.dataValues.LawyerProfile.linkedin_url,
      description: updatedLawyerProfile.dataValues.LawyerProfile.description,
      star_rating: updatedLawyerProfile.dataValues.LawyerProfile.star_rating,
    };

    return res.status(200).json(lawyerData);
  } catch (error) {
    console.error("Error updating lawyer profile:", error);
    return res.status(500).json({ error: "Failed to update lawyer profile" });
  }
}

// Controller function to get lawyer's location
export async function getLawyerLocationHandler(req: Request, res: Response) {
  const lawyerId = res.locals.user.lawyer_id;

  try {
    const lawyerLocation = await getLawyerLocation(lawyerId);

    if (!lawyerLocation) {
      return res.status(404).json({ error: "Lawyer location not found" });
    }

    return res.status(200).json(lawyerLocation);
  } catch (error) {
    console.error("Error getting lawyer's location:", error);
    return res.status(500).json({ error: "Failed to get lawyer's location" });
  }
}

// Controller function to update lawyer location
export async function updateLawyerLocationHandler(req: Request<{}, {}, UpdateLawyerLocationInput["body"]>, res: Response) {
  const lawyerId = res.locals.user.lawyer_id;
  const { bar_name } = req.body;

  try {
    const result = await updateLawyerLocation(lawyerId, bar_name);

    if (result === true) {
      return res.status(200).json({ message: "Lawyer location updated successfully." });
    } 
    if (typeof result === 'string'){
      return res.status(404).json({ error: result });
    }
    else {
      return res.status(500).json({ error: "Failed to update lawyer location." });
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update lawyer location.", message: error.message });
  }
}
