import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from 'axios';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import { Box, Pagination, Button, Modal, Typography, TextField, Skeleton } from '@mui/material';

// Lazy load the modal component
const DetailsModal = lazy(() => import('../Components/DetailsModal'));

const SuperAdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/requests', { params: { page: currentPage }, withCredentials: true });
                setRequests(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    const handleApprove = async (id) => {
        try {
            await axios.patch(`/api/requests/${id}/approve`, {}, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== id));
            handleCloseModal(); // Close the modal after approval
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async () => {
        try {
            await axios.patch(`/api/requests/${selectedRequest._id}/reject`, { reason: rejectReason }, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== selectedRequest._id));
            setRejectModalOpen(false);
            setRejectReason("");
            handleCloseModal(); // Close the modal after rejection
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };
    
    const handleOpenRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectModalOpen(true);
    };

    const handleCloseRejectModal = () => {
        setRejectModalOpen(false);
        setRejectReason("");
    };

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRequest(null);
    };

    return (
        <div className="flex">
            <SuperAdminSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <Typography variant="h5" gutterBottom>Applications</Typography>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, index) => (
                                <Skeleton key={index} variant="rect" height={100} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <div key={request._id} className="p-4 bg-white shadow-md">
                                            <div className="text-gray-600">
                                                <strong>Requestor:</strong> {request.firstName} {request.lastName}
                                            </div>
                                            <div className="text-gray-600">
                                                <strong>Requesting College/Office:</strong> {request.reqOffice}
                                            </div>

                                            <div className="mt-2 flex space-x-2">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOpenModal(request)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center">No requests found.</div>
                                )}
                            </div>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
                                <Pagination count={totalPages} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
                            </Box>
                        </>
                    )}

                    {/* Reject Reason Modal */}
                    <Modal
                        open={rejectModalOpen}
                        onClose={handleCloseRejectModal}
                        aria-labelledby="reject-reason-modal-title"
                        aria-describedby="reject-reason-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: 400,
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 2,
                            overflowY: 'auto'
                        }}>
                            <Typography id="reject-reason-modal-title" variant="h6" component="h2">
                                Reject Reason
                            </Typography>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Reason for Rejection"
                                multiline
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button onClick={handleCloseRejectModal} variant="outlined" color="error" sx={{ mr: 2 }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleReject} variant="contained" color="primary">
                                    Reject
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Details Modal */}
                    <Suspense fallback={<Skeleton variant="rect" height={400} />}>
                        <DetailsModal
                            open={modalOpen}  // Ensure this is the correct prop
                            onClose={handleCloseModal}  // Ensure this is the correct prop
                            request={selectedRequest}  // Ensure this is the correct prop
                            onApprove={handleApprove}
                            onReject={handleOpenRejectModal}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminRequests;
