import { signJwt, verifyJwt } from '../utils/jwt';
import { sequelize } from '../utils/connectToDb';
import { QueryTypes } from 'sequelize';
import argon2 from 'argon2';
import config from 'config';
import { v4 as uuidv4 } from "uuid";
import Lawyer from '../models/lawyerModel'; 
import LawyerProfile from '../models/lawyerProfileModel'; 

// Function to check whether the email and password match
export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const lawyer = await Lawyer.findOne({
      where: { email },
    });

    if (!lawyer) return false;

    const isValid = await argon2.verify(lawyer.password, password);

    if (!isValid) return false;

    // Return the lawyer object without the password field
    const lawyerWithoutPassword = lawyer.toJSON();
    delete lawyerWithoutPassword.password;
    return lawyerWithoutPassword;
  } catch (error) {
    console.error('Error validating password:', error);
    return null;
  }
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<string | null> {
  try {
    // Verify the refresh token and get the decoded data
    const { decoded } = verifyJwt(refreshToken, "refreshTokenPublicKey");

    // Check if the refresh token is valid and contains necessary data
    if (!decoded || !decoded.lawyer_id) {
      return null;
    }

    const lawyer = await LawyerProfile.findOne({
      where: { lawyer_id: decoded.lawyer_id },
    });

    if (!lawyer) {
      return null;
    }

    // Reissue the access token
    const accessToken = signJwt(
      { lawyer_id: lawyer.lawyer_id },
      'accessTokenPrivateKey',
      { expiresIn: config.get('accessTokenTtl') }
    );

    return accessToken;
  } catch (error) {
    console.error('Error reissuing access token:', error);
    return null;
  }
}

// Function to verify lawyer's email
export async function verifyEmail(lawyerId: number): Promise<boolean> {
  try {
    const [updatedRows] = await Lawyer.update(
      { verified: true },
      {
        where: { lawyer_id: lawyerId },
      }
    );
    
    return updatedRows > 0;
  } catch (error) {
    console.error('Error verifying email:', error);
    return false;
  }
}

// Function to send password reset code
export async function forgotPassword(lawyerId: number): Promise<string | null> {
  try {
    const passwordResetCode = uuidv4();

    const [updatedRows] = await Lawyer.update(
      { password_reset_code: passwordResetCode },
      {
        where: { lawyer_id: lawyerId },
      }
    );

    return updatedRows > 0 ? passwordResetCode : null;
  } catch (error) {
    console.error('Error sending password reset code:', error);
    return null;
  }
}

// Function to reset password
export async function resetPassword(
  lawyerId: number,
  password: string
): Promise<boolean> {
  try {
    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    const [updatedRows] = await Lawyer.update(
      {
        password: hashedPassword,
        password_reset_code: null,
      },
      {
        where: { lawyer_id: lawyerId },
      }
    );

    return updatedRows > 0;
  } catch (error) {
    console.error('Could not reset lawyer password:', error);
    return false;
  }
}
