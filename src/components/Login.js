import React, {useState} from "react";
import axios from "axios";


function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await axios.post("http://localhost:4000/api/login",
            {
                username,
                password
            }
        )

        const result = response.data
        console.log(result)
        alert(result['message'])

        if (result['status'] === true) {
            //localStorage.setItem('token', result['token']);
            window.location.href = "/";
        }

    }

    return(
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input type="text"
             placeholder="ชื่อผู้ใช้"
             value={username}
             onChange={(e) => setUsername(e.target.value)}/>
             <br></br>
             <input type="password"
             placeholder="รหัสผ่าน"
             value={password}
             onChange={(e) => setPassword(e.target.value)}/>
             <br></br>
             <button type="submit">เข้าสู่ระบบ</button>
        </form>
    )

}
export default Login;