import { Op } from 'sequelize';
import Bar from '../models/barModel';

export async function getBarsByCityId(city_id: number): Promise<Bar[] | null> {
  try {
    const bars = await Bar.findAll({
      where: {
        city_id: {
          [Op.eq]: city_id,
        },
      },
    });

    if (bars.length === 0) {
      return null;
    }

    return bars;
  } catch (error) {
    console.error('Error getting bars by city ID:', error);
    return null;
  }
}
