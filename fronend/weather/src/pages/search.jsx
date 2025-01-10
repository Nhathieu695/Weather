import { useState } from 'react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from 'react-router-dom';
import '../css/button.css';
import '../css/search.css';

export default function SearchPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleClick = () => {
        navigate('/result', { state: { query: query } });
    };

    const handleChange = (text) => {
        setQuery(text);
    };

    return (
        <div className="search-container mx-auto p-6 ">
            <h3 className="text-3xl font-bold mb-6 text-center text-gray-800">Search City</h3>

            <div className="flex justify-center items-center gap-4 mb-6 text-center">
                <Input
                    type="text"
                    onChange={(event) => handleChange(event.target.value)}
                    placeholder="Enter your search query"
                    value={query}
                    className="search-input"
                />
                <Button
                    className='button transition duration-200 ease-in-out transform hover:scale-105'
                    variant="destructive"
                    size="default"
                    onClick={handleClick}
                >
                    Search
                </Button>
            </div>
        </div>
    );
}
