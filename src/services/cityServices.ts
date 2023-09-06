import City from '../models/cityModel'; 

export async function getCities(): Promise<City[] | null> {
  try {
    const cities = await City.findAll();

    if (cities.length === 0) {
      return null;
    }

    return cities;
  } catch (error) {
    console.error('Error getting cities:', error);
    return null;
  }
}
