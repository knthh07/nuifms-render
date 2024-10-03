import React, { useState } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Snackbar, Button } from '@mui/material';
import { Alert } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import the plugin here
import SideNav from '../Components/sidenav/SideNav';

const CreateReport = () => {
    const [reportType, setReportType] = useState('day');
    const [specificTicket, setSpecificTicket] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userId, setUserId] = useState('');
    const [noResults, setNoResults] = useState(false);

    const handleGenerateReport = async () => {
        try {
            const dateRange = startDate && endDate
                ? `${startDate.toISODate()}:${endDate.toISODate()}`
                : '';

            const response = await axios.get('/api/report', {
                params: { reportType, specificTicket, status, dateRange, userId }
            });
            const requests = response.data.requests;

            if (requests.length === 0) {
                setNoResults(true);
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text('Job Order Report', 10, 10);

            doc.setFontSize(14);
            doc.text(`Report Type: ${reportType}`, 10, 20);
            doc.text(`Status: ${status || 'All'}`, 10, 30);
            doc.text(`Date Range: ${dateRange || 'N/A'}`, 10, 40);
            doc.text(`User ID: ${userId || 'N/A'}`, 10, 50);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 60);

            doc.autoTable({
                startY: 70,
                head: [['ID', 'Name', 'Status', 'Date']],
                body: requests.map(req => [
                    req._id,
                    `${req.firstName} ${req.lastName}`,
                    req.status,
                    new Date(req.createdAt).toLocaleDateString()
                ])
            });

            doc.text('________________________', 180, doc.autoTable.previous.finalY + 10, { align: 'right' });
            doc.text('Signature', 180, doc.autoTable.previous.finalY + 20, { align: 'right' });

            doc.save('Job_Order_Report.pdf');
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    const handleResetFilters = () => {
        setReportType('day');
        setSpecificTicket('');
        setStatus('');
        setStartDate(null);
        setEndDate(null);
        setUserId('');
        setNoResults(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="flex">
                <div className="w-full">
                    <div className="w-[80%] ml-[20%] p-6">
                        <h2 className="text-2xl mb-4">Report</h2>
                        <div className="mb-6">
                            <label htmlFor="reportType" className="block text-gray-700 font-semibold mb-2">Report Type:</label>
                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                            </select>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="specificTicket" className="block text-gray-700 font-semibold mb-2">Specific Ticket:</label>
                            <input
                                type="text"
                                id="specificTicket"
                                value={specificTicket}
                                onChange={(e) => setSpecificTicket(e.target.value)}
                                placeholder="Enter Ticket ID"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">Status:</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="dateRange" className="block text-gray-700 font-semibold mb-2">Date Range:</label>
                            <div className="flex space-x-4">
                                <DesktopDatePicker
                                    label="Start Date"
                                    inputFormat="yyyy-MM-dd"
                                    value={startDate}
                                    onChange={(newDate) => setStartDate(newDate)}
                                    slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
                                />
                                <DesktopDatePicker
                                    label="End Date"
                                    inputFormat="yyyy-MM-dd"
                                    value={endDate}
                                    onChange={(newDate) => setEndDate(newDate)}
                                    slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2">User ID:</label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter User ID"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="text-center">
                            <button
                                onClick={handleGenerateReport}
                                className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150"
                            >
                                Generate Report
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="ml-4 bg-gray-300 text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150"
                            >
                                Reset Filters
                            </button>
                        </div>
                        <Snackbar open={noResults} autoHideDuration={6000} onClose={() => setNoResults(false)}>
                            <Alert onClose={() => setNoResults(false)} severity="info">
                                No job orders found for the selected filters!
                            </Alert>
                        </Snackbar>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default CreateReport;
