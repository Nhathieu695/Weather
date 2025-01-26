import { useState, useEffect } from 'react';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from 'react-router-dom';
import '../css/button.css';
import '../css/search.css';
import axios from "axios";
import { useUser } from '../../usercontext.jsx';

export default function SearchPage() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [query, setQuery] = useState('');
    const [allCities, setAllCities] = useState([]); // Danh sách thành phố gốc
    const [filteredCities, setFilteredCities] = useState([]); // Danh sách thành phố được lọc
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({ current: 1, pageSize: 10, pages: 1, total: 0 });

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get("http://localhost:8080/listcities", {
                params: { CurrentPage: page, limit },
            });
            setAllCities(response.data.result); // Lưu danh sách thành phố gốc
            setFilteredCities(response.data.result); // Đặt danh sách thành phố được lọc bằng danh sách gốc
            setMeta(response.data.meta);
        } catch (error) {
            setError(error.response?.data || "Failed to fetch cities");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (query) {
            const filtered = allCities.filter(city =>
                city.city.toLowerCase().includes(query.toLowerCase()) ||
                city.admin_name.toLowerCase().includes(query.toLowerCase()) ||
                city.country.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities(allCities);
        }
    };

    const handleCityClick = (city) => {
        // Kiểm tra và lấy giá trị lat và lng đúng cách
        const latitude = city.lat?.$numberDecimal || city.lat;
        const longitude = city.lng?.$numberDecimal || city.lng;

        navigate('/weather', {
            state: {
                id: city.id,
                admin_name: city.admin_name,
                lat: latitude,
                lng: longitude
            }
        });
    };

    const handlePageChange = (newPage) => {
        fetchCities(newPage, meta.pageSize);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.get("http://localhost:8080/logout", { withCredentials: true });
            setUser(null);
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error.response?.data || error.message);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const totalPages = meta.pages;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= meta.current - 1 && i <= meta.current + 1)) {
                pages.push(
                    <span
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`pagination-number ${meta.current === i ? 'font-bold' : ''}`}
                    >
                        {i}
                    </span>
                );
            } else if (i === 2 || i === totalPages - 1) {
                pages.push(<span key={`dots-${i}`}>...</span>);
            }
        }

        return pages;
    };

    return (
        <div className="search-page">
            <header className="header">
                <nav className="nav-left">
                    <a href="/">Home</a>
                    <a href="/pricing">Pricing</a>
                </nav>
                <nav className="nav-right">
                    {user ? (
                        <span className="greeting">Xin chào, {user.email}</span>
                    ) : (
                        <a href="/login">Login</a>
                    )}
                    {user && <a onClick={handleLogout}>Logout</a>}
                </nav>
            </header>

            <div className="search-container mx-auto p-6">
                <h3 className="text-3xl font-bold mb-6 text-center text-gray-800">Search City</h3>

                <div className="search-box flex justify-center items-center gap-4 mb-6">
                    <Input
                        type="text"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Enter your search query"
                        value={query}
                        className="search-input"
                    />
                    <Button
                        className="button transition duration-200 ease-in-out transform hover:scale-105"
                        variant="destructive"
                        size="default"
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <table className="table-auto w-full mt-4 border-collapse border border-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">City</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Country</th>
                            <th className="border border-gray-300 px-4 py-2">Latitude</th>
                            <th className="border border-gray-300 px-4 py-2">Longitude</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                                <tr key={city.id} onClick={() => handleCityClick(city)} className="hover:bg-gray-100 cursor-pointer">
                                    <td className="border border-gray-300 px-4 py-2">{city.city}</td>
                                    <td className="border border-gray-300 px-4 py-2">{city.admin_name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{city.country}</td>
                                    <td className="border border-gray-300 px-4 py-2">{city.lat?.$numberDecimal || city.lat}</td>
                                    <td className="border border-gray-300 px-4 py-2">{city.lng?.$numberDecimal || city.lng}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center border border-gray-300 px-4 py-2">Không có kết quả nào phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="pagination mt-4 flex justify-center items-center gap-4">
                    {meta.current > 1 && (
                        <button
                            onClick={() => handlePageChange(meta.current - 1)}
                            className="pagination-button"
                        >
                            Previous
                        </button>
                    )}
                    {renderPagination()}
                    {meta.current < meta.pages && (
                        <button
                            onClick={() => handlePageChange(meta.current + 1)}
                            className="pagination-button"
                        >
                            Next
                        </button>
                    )}
                    <button
                        onClick={() => handlePageChange(meta.pages)}
                        disabled={meta.current >= meta.pages}
                        className="pagination-button"
                    >
                        Trang cuối
                    </button>
                </div>
            </div>
        </div>
    );
}
