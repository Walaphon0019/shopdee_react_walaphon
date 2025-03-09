import {React, useEffect, useState} from "react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ButtonGroup from '@mui/material/ButtonGroup';
import axios from 'axios';
import AppNavbar from '../components/AppNavbar';
import SideMenu from '../components/SideMenu';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';

const defaultTheme = createTheme();
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;


// Main component for rendering the order list
export default function Index() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // default rows per page

  useEffect(() => {
    OrdersGet(setOrders);
  }, []);

  // Function to fetch orders from the API
  const OrdersGet = () => {
    axios.get(`${url}/admin/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setOrders(response.data);
      setFilteredOrders(response.data);
    })
    .catch((error) => {
      console.error('Error fetching orders', error);
    });
  };

  // Function to filter orders based on the search query
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredOrders(orders.filter((order) =>      
      order.orderDate.toLowerCase().includes(query) ||      
      order.status.toLowerCase().includes(query)
    ));
  };
  
  // Function to handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page change
  };

  // Function to view a order's details
  const ViewOrder = (id) => {
    window.location = `/admin/order/view/${id}`;
  }

  const ViewPayment = (id) => {
    window.location = `/admin/payment/view/${id}`;
  }

  // Function to sort orders
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = filteredOrders.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box 
        id="order_index"
        name="order_index"
        sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />        

        {/* Start Main content */}
        <Container sx={{ marginTop: 2 }} maxWidth="lg">    
          <Paper sx={{ padding: 2, color: 'text.secondary' }}>               
            <Box display="flex">
              <Box flexGrow={1}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  รายการสั่งซื้อ
                </Typography>
              </Box>
            </Box>

            {/* Search Bar */}
            <Box display="flex" justifyContent="flex-end" mb={2}>        
              <Box>
                <TextField
                  id="search"
                  name="search"
                  label="ค้นหา"
                  variant="outlined"
                  size="small"                             
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="ค้นหาด้วยวันที่สั่งซื้อ, สถานะ"
                  sx={{ width: '260px' }} 
                />
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right" onClick={() => handleSort('orderID')}><strong>รหัส</strong></TableCell>
                    <TableCell align="center" onClick={() => handleSort('orderDate')}><strong>วันที่สั่งซื้อ</strong></TableCell>                    
                    <TableCell align="right"><strong>ราคารวม</strong></TableCell>
                    <TableCell align="center" onClick={() => handleSort('status')}><strong>สถานะ</strong></TableCell>                    
                    <TableCell align="center"><strong>จัดการข้อมูล</strong></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Pagination logic
                    .map((order) => (
                    <TableRow key={order.orderID}>
                      <TableCell align="center">{order.orderID}</TableCell> 
                      <TableCell align="center">{order.orderDate}</TableCell>                    
                      <TableCell align="right">฿{order.totalPrice.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                      <TableCell align="center">{order.status}</TableCell>                     
                      <TableCell align="center">
                        <ButtonGroup color="primary" aria-label="outlined primary button group"> 
                          <Button 
                              id="btnOrder"
                              name="btnOrder" 
                              onClick={() => ViewOrder(order.orderID)}
                              sx={{backgroundColor: 'info.light', color: 'white'}}
                          >
                              การสั่งซื้อ
                          </Button>
                          <Button 
                              id="btnPayment"
                              name="btnPayment" 
                              onClick={() => ViewPayment(order.orderID)}
                              sx={{backgroundColor: 'warning.light', color: 'white'}}
                          >
                              การชำระเงิน
                          </Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}            
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />              
          </Paper>
        </Container>
        {/* End Main content */}    
      </Box>
    </ThemeProvider>  
  );
}
