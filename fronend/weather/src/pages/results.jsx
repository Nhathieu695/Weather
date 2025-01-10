import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useLocation } from "react-router-dom";
import '../css/result.css';
import { useNavigate } from 'react-router-dom';

const columns = [
    { id: "city", label: "City" },
    { id: "admin_name", label: "Admin Name" },
    { id: "country", label: "Country" },
    { id: "lat", label: "Latitude" },
    { id: "lng", label: "Longitude" },
];

export default function UserResultsTable() {
    const location = useLocation();
    const [data, setData] = useState([]);
    const query = location.state?.query;
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            if (query) {
                try {
                    const response = await axios.get(`http://localhost:8080/location?queries=${query}`);
                    console.log("Data received from API:", response.data);

                    if (response.data && Array.isArray(response.data.data)) {
                        setData(response.data.data);
                    } else {
                        console.error("Expected data to be an array, but got:", response.data);
                        setData([]);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, [query]);

    const handleItem = (id, admin_name, lat, lng) => {
        console.log("Navigating to weather with:", { id, admin_name, lat, lng });
        navigate('/weather', {
            state: {
                id,
                admin_name,
                lat,
                lng
            }
        });
    };

    return (
        <div className="table_container mx-auto py-10">
            <Table>
                <TableCaption>A list of cities and their details.</TableCaption>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.id}>{column.label}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(data) && data.length > 0 ? (
                        data.map((item) => (
                            <TableRow onClick={() => { handleItem(item.id, item.admin_name, item.lat, item.lng) }} key={item._id}>
                                <TableCell className="font-medium">{item.city}</TableCell>
                                <TableCell>{item.admin_name}</TableCell>
                                <TableCell>{item.country}</TableCell>
                                <TableCell>{item.lat}</TableCell>
                                <TableCell>{item.lng}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">No data available</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
