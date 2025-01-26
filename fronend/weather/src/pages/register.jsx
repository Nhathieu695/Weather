import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import '../css/RegisterPage.css'; // Import the CSS file

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {

        document.body.classList.add("register-body");


        return () => {
            document.body.classList.remove("register-body");
        };
    }, []);

    const registerUser = async (e) => {
        e.preventDefault();

        if (password !== confirmpassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/register", {
                email: username,
                password,
                confirmpassword
            });
            console.log("Registration successful:", response.data);
            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error.response.data);
            setError(error.response.data.message || "Đăng ký không thành công.");
        } finally {
            setIsLoading(false); // End loading
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="text-center">
                    <h2 className="register-title">Đăng ký</h2>
                </div>
                <form className="register-form" onSubmit={registerUser}>
                    <div className="form-group">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Label htmlFor="password">Mật khẩu</Label>
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
                    <div className="form-group">
                        <Label htmlFor="confirmpassword">Xác nhận mật khẩu</Label>
                        <Input
                            id="confirmpassword"
                            name="confirmpassword"
                            type="password"
                            required
                            className="input"
                            value={confirmpassword}
                            onChange={(e) => setConfirmpassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <div>
                        <Button type="submit" className="submit-button">
                            {isLoading ? "Đang tải..." : "Đăng ký"}
                        </Button>
                    </div>
                </form>
                <p className="text-center">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="link">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}