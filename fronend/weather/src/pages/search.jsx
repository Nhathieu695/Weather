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
    const [subscriptions, setSubscriptions] = useState(new Set());

    useEffect(() => {
        fetchCities();
        if (user) {
            // Lấy subscriptions từ localStorage khi người dùng đăng nhập
            const storedSubscriptions = localStorage.getItem('subscriptions');
            if (storedSubscriptions) {
                setSubscriptions(new Set(JSON.parse(storedSubscriptions)));
            } else {
                fetchSubscriptions(); // Lấy subscriptions từ API nếu không có trong localStorage
            }
        }
    }, [user]);

    const fetchCities = async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get("http://localhost:8080/listcities", {
                params: { CurrentPage: page, limit },
            });
            setAllCities(response.data.result);
            setFilteredCities(response.data.result);
            setMeta(response.data.meta);
        } catch (error) {
            setError(error.response?.data || "Failed to fetch cities");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscriptions = async () => {
        if (user) {
            try {
                const response = await axios.get(`http://localhost:8080/subscriptions/${user._id}`);
                const subscribedCities = response.data.map(city => city._id);
                localStorage.setItem('subscriptions', JSON.stringify(subscribedCities)); // Lưu subscriptions vào localStorage
                setSubscriptions(new Set(subscribedCities));
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đăng ký:", error.response?.data || error.message);
            }
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

    const handleSubscribe = async (city, event) => {
        event.stopPropagation();

        try {
            const response = await axios.post("http://localhost:8080/subscribe", {
                userId: user._id,
                cityId: city._id
            });

            console.log(response.data.message);
            setSubscriptions((prev) => {
                const updated = new Set(prev).add(city._id);
                localStorage.setItem('subscriptions', JSON.stringify(Array.from(updated))); // Lưu subscriptions vào localStorage
                return updated;
            });

            await axios.post("http://localhost:8080/send-weather-notifications");
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error.response?.data || error.message);
        }
    };

    const handleUnsubscribe = async (city, event) => {
        event.stopPropagation();

        try {
            await axios.post("http://localhost:8080/unsubscribe", {
                userId: user._id,
                cityId: city._id
            });

            console.log("Hủy đăng ký thành công");
            setSubscriptions((prev) => {
                const updated = new Set(prev);
                updated.delete(city._id);
                localStorage.setItem('subscriptions', JSON.stringify(Array.from(updated))); // Cập nhật subscriptions vào localStorage
                return updated;
            });
        } catch (error) {
            console.error("Lỗi khi hủy đăng ký:", error.response?.data || error.message);
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

                <table className="border border-gray-300 px-4 py-2 text-blue-500 shadow">
                    <thead className="bg-white">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">City</th>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">Country</th>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">Latitude</th>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">Longitude</th>
                            <th className="border border-gray-300 px-4 py-2 text-blue-500">Subscribe</th>
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
                                    <td className="border border-gray-300 px-4 py-2 subscribe-table-cell-center">
                                        {subscriptions.has(city._id) ? (
                                            <Button className="subscribe-button" onClick={(event) => handleUnsubscribe(city, event)}>
                                                Hủy đăng ký
                                            </Button>
                                        ) : (
                                            <Button className="subscribe-button" onClick={(event) => handleSubscribe(city, event)}>
                                                Đăng ký
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="border border-gray-300 px-4 py-2 text-center">Không có thành phố nào được tìm thấy.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="pagination flex justify-center mt-4">
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
}
