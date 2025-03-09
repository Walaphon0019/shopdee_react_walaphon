import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, custID, cart, setCart } = useAuth();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/products")
      .then((response) => {
        if (response.data.status) {
          setProducts(response.data.products);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productID === product.productID);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productID === product.productID ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productID) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          item.productID === productID ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (productID) => {
    navigate(`/product/${productID}`);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${custID}`);
    handleMenuClose();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/signin');
    handleMenuClose();
  };

  const handleConfirmCart = () => {
    if (!isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      navigate('/signin');
      return;
    }
    // Implement the logic for confirming the cart
    alert('ยืนยันการสั่งซื้อ');
    setCart([]); // Clear the cart
    handleCartClose();
  };

  return (
    <div>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <img src="logo.webp" alt="Shopdee Logo" style={{ height: 50, marginRight: 16 }} />
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              background: "white",
              borderRadius: 4,
              padding: "2px 10px",
            }}
          >
            <SearchIcon style={{ marginRight: 8, color: "gray" }} />
            <InputBase
              placeholder="ค้นหาสินค้า..."
              style={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <IconButton color="inherit" sx={{ marginLeft: 2 }} onClick={handleCartOpen}>
            <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" sx={{ marginLeft: 2 }} onClick={handleMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>ดูโปรไฟล์</MenuItem>
                <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/signin" color="inherit" sx={{ marginLeft: 2 }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Best Sellers Section */}
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          สินค้าขายดี
        </Typography>
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.productID}>
              <Card onClick={() => handleProductClick(product.productID)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:4000/api/product/image/${product.imageFile}`}
                  alt={product.productName}
                />
                <CardContent>
                  <Typography variant="h6">{product.productName}</Typography>
                  <Typography color="textSecondary">{product.productDetail}</Typography>
                  <Typography variant="body1" color="primary">
                    ราคา: {product.price} บาท
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    เพิ่มลงตะกร้า
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onClose={handleCartClose}>
        <DialogTitle>ตะกร้าสินค้า</DialogTitle>
        <DialogContent>
          <List>
            {cart.length === 0 ? (
              <Typography variant="body1" textAlign="center">ไม่มีสินค้าในตะกร้า</Typography>
            ) : (
              cart.map((item) => (
                <ListItem key={item.productID}>
                  <ListItemText primary={item.productName} secondary={`ราคา: ${item.price} บาท, จำนวน: ${item.quantity}`} />
                  <IconButton onClick={() => removeFromCart(item.productID)}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton onClick={() => addToCart(item)}>
                    <AddIcon />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCartClose} color="primary">
            ปิด
          </Button>
          <Button onClick={handleConfirmCart} color="primary" variant="contained">
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HomePage;