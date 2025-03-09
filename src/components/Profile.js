import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  Grid,
  TextField,
  Button,
} from "@mui/material";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobilePhone: "",
  });

  useEffect(() => {
    console.log(`Fetching data from API: http://localhost:4000/api/profile/${id}`);

    axios
      .get(`http://localhost:4000/api/profile/${id}`)
      .then((response) => {
        console.log("📌 API Response:", response.data);
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          mobilePhone: response.data.mobilePhone,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ API Error:", err);
        setError(err.response ? err.response.data.message : "เกิดข้อผิดพลาด");
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:4000/api/profile/${id}`, formData)
      .then((response) => {
        console.log("📌 Update Response:", response.data);
        setProfile(response.data);
        setIsEditing(false);
      })
      .catch((err) => {
        console.error("❌ Update Error:", err);
        setError(err.response ? err.response.data.message : "เกิดข้อผิดพลาด");
      });
  };

  const handleBackClick = () => {
    navigate('/homepage');
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Alert severity="warning">ไม่พบข้อมูล</Alert>;

  const profileImage = `http://localhost:4000/api/profile/image/${profile.imageFile}`;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={profileImage} sx={{ m: 1, width: 100, height: 100 }} />
            <Typography variant="h5" component="div" gutterBottom>
              โปรไฟล์ลูกค้า
            </Typography>
          </Box>
          {isEditing ? (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ชื่อ"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="นามสกุล"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="เบอร์โทรศัพท์"
                    name="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    บันทึก
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ ml: 2 }}
                    onClick={handleEditToggle}
                  >
                    ยกเลิก
                  </Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  <strong>รหัสลูกค้า:</strong> {profile.custID}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  <strong>ชื่อ:</strong> {profile.firstName} {profile.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  <strong>Email:</strong> {profile.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  <strong>เบอร์โทรศัพท์:</strong> {profile.mobilePhone}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="green">
                  {profile.message}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleEditToggle}>
                  แก้ไขโปรไฟล์
                </Button>
              </Grid>
            </Grid>
          )}
          <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleBackClick}>
            ย้อนกลับ
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;