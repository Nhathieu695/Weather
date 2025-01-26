import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../../usercontext.jsx'
import '../css/LoginPage.css';

export default function LoginPage() {
    const { setUser } = useUser(); // Lấy hàm setUser từ context
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {

        document.body.classList.add("login-body");


        return () => {
            document.body.classList.remove("login-body");
        };
    }, []);

    const loginUser = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8080/login", {
                username,
                password,
            }, { withCredentials: true });

            console.log("Login successful:", response.data);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error.response.data);
            setError(error.response.data.message || "Đăng nhập không thành công.");
        }
    };


    return (
        <div className="login-container">
            <div className="login-header">
                <h2 className="login-title">Đăng nhập</h2>
            </div>
            <form onSubmit={loginUser} className="login-form">
                <div className="form-group">
                    <Label htmlFor="username" className="label">Tên đăng nhập</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <Label htmlFor="password" className="label">Mật khẩu</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <Button type="submit" className="button">Đăng nhập</Button>
            </form>
            <div className="login-footer">
                <p className="text-center">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </div>
        </div>
    );
}
