import Bar from '../models/barModel';
import Lawyer from '../models/lawyerModel';
import LawyerProfile from '../models/lawyerProfileModel';
import { CreateLawyerInput, UpdateLawyerInput } from '../schemas/lawyerSchema';
import argon2 from "argon2";
import { sequelize } from '../utils/connectToDb';
import { v4 as uuidv4 } from "uuid";
import { Op } from 'sequelize';
import { QueryTypes } from 'sequelize';

export interface GetAvailableLawyersFilters {
  city?: number;
  bar?: number;
  minRating?: number;
  maxRating?: number;
  sort?: 'asc' | 'desc';
}

// Function to hash the password using argon2
async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

// Function to compare the provided password with the hashed password
export async function comparePasswords(hashedPassword: string, candidatePassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, candidatePassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

// Function to create a new lawyer
export async function createLawyer(input: CreateLawyerInput): Promise<Lawyer | null> {
  try {
    const { first_name, last_name, email, password, bar_id } = input.body;
    
    // Hash the password using argon2
    const hashedPassword = await hashPassword(password);

    // Start a transaction to ensure data consistency
    const createdLawyer = await sequelize.transaction(async (t) => {
      const lawyer = await Lawyer.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        bar_id,
        status: 'available',
        verification_code: uuidv4(),
      }, { transaction: t });

      // Create a lawyer profile for the new lawyer
      await LawyerProfile.create({
        lawyer_id: lawyer.lawyer_id,
        linkedin_url: null,
        description: null,
        star_rating: 0,
        rating_num: 0,
      }, { transaction: t });

      return lawyer.toJSON();
    });

    return createdLawyer;
  } catch (error) {
    console.error('Error creating lawyer:', error);
    return null;
  }
}

// Function to get a lawyer's profile by ID
export async function getLawyerProfileById(id: number): Promise<Lawyer | null> {
  try {
    const lawyerProfile = await Lawyer.findOne({
      where: { lawyer_id: id },
      include: LawyerProfile,
    });

    if (!lawyerProfile) {
      return null;
    }

    return lawyerProfile;
  } catch (error) {
    console.error("Error getting lawyer by ID:", error);
    return null;
  }
}

export async function getAvailableLawyers(searchingLawyerId: number, filters: GetAvailableLawyersFilters): Promise<Lawyer[]> {
  try {
    const filterOptions: any = {
      status: 'available',
      lawyer_id: {
        [Op.not]: searchingLawyerId,
      },
    };

    // Apply filters
    if (filters.city !== undefined) {
      filterOptions.bar_id = {
        [Op.in]: sequelize.literal(`(SELECT bar_id FROM "Bars" WHERE city_id = ${filters.city})`),
      };
    }

    if (filters.bar !== undefined) {
      filterOptions.bar_id = filters.bar;
    }

    const ratingConditions = [];

    if (filters.minRating !== undefined) {
      ratingConditions.push({
        '$LawyerProfile.star_rating$': {
          [Op.gte]: filters.minRating,
        },
      });
    }
    
    if (filters.maxRating !== undefined) {
      ratingConditions.push({
        '$LawyerProfile.star_rating$': {
          [Op.lte]: filters.maxRating,
        },
      });
    }
    
    // Add rating conditions to the filter options
    if (ratingConditions.length > 0) {
      filterOptions[Op.and] = ratingConditions;
    }

    const queryOptions: any = {
      where: filterOptions,
      attributes: [
        'lawyer_id',
        'first_name',
        'last_name',
        'email',
        'bar_id',
        'status',
        'verified',
      ],
      include: [
        {
          model: LawyerProfile,
          attributes: [
            'linkedin_url',
            'description',
            'star_rating',
          ],
        },
      ],
    };

    // Conditionally add sorting
    if (filters.sort !== undefined) {
      const sortOption = filters.sort === 'desc' ? 'DESC' : 'ASC';
      queryOptions.order = [['LawyerProfile', 'star_rating', sortOption]];
    }

    const lawyers = await Lawyer.findAll(queryOptions);

    return lawyers;
  } catch (error) {
    console.error('Error getting available lawyers by filters:', error);
    return [];
  }
}

// Function to update a lawyer profile
export async function updateLawyerProfile(lawyerId: number, updatedProfile: UpdateLawyerInput): Promise<Lawyer | null> {
  try {
    // Destructure the fields from the updatedProfile
    const { first_name, last_name, bar_id, status, linkedin_url, description } = updatedProfile.body;

    // Find the lawyer by ID
    const lawyer = await Lawyer.findByPk(lawyerId);

    if (!lawyer) {
      return null; // Lawyer not found
    }

    // Update Lawyer fields
    if (first_name !== undefined) {
      lawyer.first_name = first_name;
    }
    if (last_name !== undefined) {
      lawyer.last_name = last_name;
    }
    if (bar_id !== undefined) {
      lawyer.bar_id = bar_id;
    }
    if (status !== undefined) {
      lawyer.status = status;
    }
    
    // Save the updated Lawyer
    await lawyer.save();

    // Find the associated LawyerProfile
    const lawyerProfile = await LawyerProfile.findOne({
      where: { lawyer_id: lawyerId },
    });

    if (!lawyerProfile) {
      return null;
    }

    // Update LawyerProfile fields
    if (linkedin_url !== undefined) {
      lawyerProfile.linkedin_url = linkedin_url;
    }
    if (description !== undefined) {
      lawyerProfile.description = description;
    }

    // Save the updated LawyerProfile
    await lawyerProfile.save();

    // Return the updated LawyerProfile
    return await getLawyerProfileById(lawyerId);
  } catch (error) {
    console.error("Error updating lawyer profile:", error);
    return null;
  }
}

// Function to get lawyer by email
export async function getLawyerByEmail(email: string): Promise<Lawyer | null> {
  try {
    const lawyer = await Lawyer.findOne({ where: { email } });
    return lawyer;
  } catch (error) {
    console.error('Error getting lawyer by email:', error);
    return null;
  }
}

// Function to get lawyer's location information
export async function getLawyerLocation(lawyerId: number) {
  try {
    const query = `
      SELECT c.city_id, c.city_name, b.bar_id, b.bar_name
      FROM "Lawyers" l
      INNER JOIN "Bars" b ON l.bar_id = b.bar_id
      INNER JOIN "Cities" c ON b.city_id = c.city_id
      WHERE l.lawyer_id = :lawyerId;
    `;

    const results = await sequelize.query(query, {
      replacements: { lawyerId },
      type: QueryTypes.SELECT,
    });

    if (results.length === 0) {
      return null;
    }

    return results;
  } catch (error) {
    console.error("Error getting lawyer's location:", error);
    return null;
  }
}

// Function to update lawyer location
export async function updateLawyerLocation(lawyerId: number, barName: string): Promise<boolean | string> {
  try {
    const bar = await Bar.findOne({ where: { bar_name: barName } });

    if (!bar) {
      return "Bar not found.";
    }

    const updatedLawyer = await Lawyer.update(
      { bar_id: bar.bar_id },
      { where: { lawyer_id: lawyerId } }
    );

    if (updatedLawyer[0] === 0) {
      return "Lawyer not found.";
    }

    return true;
  } catch (error) {
    console.error("Error updating lawyer location:", error);
    return false;
  }
}
