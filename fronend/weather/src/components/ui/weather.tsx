import React, { useEffect, useState } from "react";
import '../../css/weather.css'
interface WeatherData {
    location: {
        name: string;
        region: string;
        country: string;
        localtime: string;
    };
    current: {
        temp_c: number;
        condition: {
            text: string;
            icon: string;
        };
        wind_kph: number;
        wind_dir: string;
        humidity: number;
        feelslike_c: number;
    };
}

interface WeatherDisplayProps {
    data: WeatherData;
}

const WindIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
);

const DropletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export default function WeatherDisplay({ data }: WeatherDisplayProps) {
    const { location, current } = data;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const weatherInfo = [
        { icon: <WindIcon />, label: "Wind", value: `${current.wind_kph} km/h ${current.wind_dir}` },
        { icon: <DropletIcon />, label: "Humidity", value: `${current.humidity}%` },
        { icon: <WindIcon />, label: "Feels like", value: `${current.feelslike_c}°C` },
        { icon: <ClockIcon />, label: "Local time", value: location.localtime },
    ];

    return (
        <div className="container">
            <div className="card">
                <div className="backdrop">
                    <div className={`transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex justify-between items-center mb-6 text-center">
                            <div>
                                <h2 className={`title transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                    {location.name}
                                </h2>
                                <p className={`subtitle transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
                                    {`${location.region}, ${location.country}`}
                                </p>
                            </div>
                            <img
                                src={current.condition.icon}
                                alt={current.condition.text}
                                className={`w-24 h-24 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                                style={{ transitionDelay: '200ms' }}
                            />
                        </div>
                        <div className="mb-8 text-center">
                            <p className={`temp transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
                                {current.temp_c}°C
                            </p>
                            <p className={`condition transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                                {current.condition.text}
                            </p>
                        </div>
                        <div className="weather-info">
                            {weatherInfo.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`info-item transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                    style={{ transitionDelay: `${500 + index * 100}ms` }}
                                >
                                    {item.icon}
                                    <div>
                                        <p className="info-label">{item.label}</p>
                                        <p className="info-value">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
