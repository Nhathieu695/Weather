import { useState, useEffect } from 'react';
import WeatherDisplay from '../components/ui/weather.tsx';
import axios from 'axios';
import { useLocation } from "react-router-dom";

export default function WeatherPage() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();


    const { id, admin_name, lat, lng } = location.state || {};
    const key = "35661687a52442b09db154609250301"

    console.log("Latitude:", lat);
    console.log("Longitude:", lng);
    console.log("API Key:", import.meta.env.VITE_WEATHER_KEY);

    useEffect(() => {
        if (!lat || !lng || !key) {
            setError("Invalid query parameters");
            setLoading(false);
            return;
        }


        const fetchWeather = async () => {
            try {
                setLoading(true);
                const weatherApi = await axios.get(`http://api.weatherapi.com/v1/current.json?q=${lat},${lng}&key=${key}`);

                console.log("weatherApi", weatherApi.data);
                setWeather(weatherApi.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch weather data");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lng, key]);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-8">Weather Forecast</h1>
                {loading && <p className="text-center mt-4">Loading...</p>}
                {!loading && error && <p className="text-center text-red-500 mt-4">{error}</p>}
                {!loading && weather && (
                    <div className="flex flex-col items-center">
                        <WeatherDisplay data={weather} />
                    </div>
                )}
            </div>
        </div>
    );
}
