import LawyerProfile from '../models/lawyerProfileModel';
import StarRating from '../models/starRatingModel';

export async function giveStarRating(fromLawyerId: number, toLawyerId: number, rating: number) {
  try {
    const targetLawyerProfile = await LawyerProfile.findByPk(toLawyerId);

    if (!targetLawyerProfile) {
      return 'Target lawyer not found.';
    }

    // Check if the rating between the two lawyers already exists
    const existingRating = await StarRating.findOne({
      where: {
        from_lawyer_id: fromLawyerId,
        to_lawyer_id: toLawyerId,
      },
    });

    if (existingRating) {
      await updateRating(targetLawyerProfile, existingRating.rating, rating, fromLawyerId);
      return;
    }

    // Calculate the new total star rating and number of ratings for the target lawyer
    const newTotalStarRating = targetLawyerProfile.star_rating * targetLawyerProfile.rating_num + rating;
    const newRatingNum = targetLawyerProfile.rating_num + 1;
    const newAverageRating = newTotalStarRating / newRatingNum;

    // Insert the star rating into the StarRating table
    await StarRating.create({
      from_lawyer_id: fromLawyerId,
      to_lawyer_id: toLawyerId,
      rating: rating,
    });

    // Update the target lawyer's star_rating and rating_num in the database
    await targetLawyerProfile.update({
      star_rating: newAverageRating,
      rating_num: newRatingNum,
    });
  } catch (error) {
    console.error('Error giving star rating:', error);
    return null;
  }
}

export async function updateRating(targetLawyerProfile: LawyerProfile, oldRating: number, newRating: number, fromLawyerId: number) {
  try {
    const totalRating = targetLawyerProfile.star_rating * targetLawyerProfile.rating_num - oldRating + newRating;
    const newAverageRating = totalRating / targetLawyerProfile.rating_num;

    // Update the target lawyer's star_rating in the database
    await targetLawyerProfile.update({
      star_rating: newAverageRating,
    });

    // Update the corresponding StarRating record
    await StarRating.update(
      { rating: newRating },
      {
        where: {
          from_lawyer_id: fromLawyerId,
          to_lawyer_id: targetLawyerProfile.lawyer_id,
        },
      }
    );
  } catch (error) {
    console.error('Error updating star rating:', error);
  }
}
