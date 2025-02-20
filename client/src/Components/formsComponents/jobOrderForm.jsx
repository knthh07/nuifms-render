import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, TextField, MenuItem, Button, Tooltip, FormHelperText } from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Loader from '../../hooks/Loader';

const data = {
    "National University Manila": {
        "MAIN BUILDING": {
            "GROUND": [
                "HEALTH SERVICES",
                "LOGISTICS/PURCHASING",
                "NATIONAL UNIVERSITY ALUMNI FOUNDATION INC",
                "MOTORPOOL",
                "ASSET MANAGEMENT OFFICE",
                "PHYSICAL FACILITIES MANAGEMENT OFFICE",
                "BULLDOGS EXCHANGE"
            ],
            "SECOND": [
                "TREASURY OFFICE",
                "ADMISSIONS",
                "REGISTRAR"
            ],
            "THIRD": [
                "COLLEGE OF ALLIED HEALTH",
            ],
            "FOURTH": [
                "RESEARCH AND DEVELOPMENT",
                "IT SYSTEMS OFFICE",
                "FACULTY AND ADMINISTRATION OFFICE",
                "QMO MANILA",
                "SAFETY OFFICE",
                "AVP-ACADEMIC SERVICES",
                "AVP-ADMINISTRATION",
                "VP-OPERATIONS"
            ],
            "FIFTH": [
                "ACADEME INTERNSHIP AND PLACEMENT OFFICE",
                "DATA PRIVACY OFFICE",
                "EDUCATION TECHNOLOGY",
                "CCIT",
            ],
            "SIXTH": ["ROOMS"],
            "SEVENTH": ["COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT"],
            "EIGHTH": ["ATHLETICS OFFICE"],
        },
        "JMB": {
            "GROUND": ["SECURITY OFFICE"],
            "SECOND": ["ROOMS"],
            "THIRD": ["DISCIPLINE OFFICE"],
            "FOURTH": ["ROOMS"],
            "FIFTH": ["LEARNING RESOURCE CENTER"],
        },
        "ANNEX": {
            "GROUND": [
                "ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA"
            ],
            "SECOND": [
                "LEARNING RESOURCE CENTER"
            ],
            "THIRD": [
                "COMEX/NSTP",
                "NUCSG OFFICE",
                "STUDENT DEVELOPMENT AND ACTIVITIES OFFICE",
                "ATHLETE ACADEMIC DEVELOPMENT OFFICE",
                "COLLEGE OF ENGINEERING",
            ],
            "FOURTH": [
                "GENERAL ACCOUNTING AND BUDGETING - MANILA",
                "HUMAN RESOURCES - MANILA",
                "GUIDANCE SERVICES OFFICE",
                "CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT",
                "INTERNATIONAL STUDENT SERVICES OFFICE",
            ],
            "FIFTH": [
                "ROOMS"
            ],
            "SIXTH": ["ROOMS"],
            "SEVENTH": ["CEAS"],
            "EIGHTH": ["ROOMS"],
            "NINTH": ["ROOMS"],
            "TENTH": ["ROOMS"],
            "ELEVENTH": ["ROOMS"],
            "TWELFTH": ["GYM"],
        },
        "ANNEX II": {
            "GROUND": [
                "FACULTY OFFICE",
                "HEALTH SERVICES",
                "GYM",
                "STUDENT SERVICES",
                "CANTEEN",

            ],
            "SECOND": [
                "ROOMS"
            ],
            "THIRD": [
                "ROOMS",
            ],
            "FOURTH": [
                "LEARNING RESOURCE CENTER",
            ],
        },
        "OSIAS": {
            "GROUND": [
                "CORPORATE MARKETING AND COMMUNICATION OFFICE",
                "ALUMNI OFFICE",
                "LEGACY OFFICE",
                "SAFETY AND SECURITY",
            ],
            "SECOND": [
                "QUALITY MANAGEMENT OFFICE",
                "CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE",
                "OFFICE OF THE PRESIDENT",
                "BUSINESS DEVELOPMENT AND LINKAGES",
                "VP-CORPORATE AFFAIRS",
                "CFO",
                "AVP-ADMINISTRATIVE SERVICES",
                "VP-ADMINISTRATIVE SERVICES",
            ],
            "THIRD": [
                "PAYROLL OFFICE",
                "HUMAN RESOURCES - SHARED SERVICES",
                "FINANCE SHARED",
                "TECHNOLOGY SERVICES OFFICE",
                "GAO/CIO",
                "ACADEMIC TECHNOLOGY OFFICE",
            ],
        },
    },
};

const jobOrderTypes = ['Maintenance', 'Borrowing', 'Repair', 'Installation']; // Dropdown for Job Order Types
const scenarios = ['Broken', 'Busted', 'Slippery', 'Leaking']; // Dropdown for Scenario
const objects = ['Computer', 'Floor', 'Door', 'Chair', 'Window']; // Dropdown for Object

const scenarioToObjects = {
    Broken: ['Computer', 'Projector', 'Air conditioner', 'Light switch', 'Desk', 'Elevator', 'Whiteboard', 'Printer'],
    Busted: ['Fuse', 'Light bulb', 'Monitor', 'Electric outlet', 'Security camera', 'Speaker system', 'Router', 'Refrigerator'],
    Slippery: ['Floor', 'Stairs', 'Entrance', 'Bathroom tiles', 'Balcony'],
    Leaking: ['Faucet', 'Pipes', 'Roof', 'Water dispenser', 'Sink', 'Ceiling'],
    Clogged: ['Toilet', 'Drain', 'Sink', 'Gutter', 'AC Vent'],
    Noisy: ['Fan', 'Door', 'Ventilation system', 'Generator', 'AC unit'],
    'Not Working': ['Printer', 'Photocopier', 'Door lock', 'Smartboard', 'Projector', 'Microphone', 'Intercom system'],
    Cracked: ['Window', 'Door', 'Floor tile', 'Wall', 'Whiteboard'],
    'Burnt Out': ['Light bulb', 'Electric wiring', 'Fuse box', 'Outlet', 'Extension cord'],
    Loose: ['Door knob', 'Cabinet handle', 'Table leg', 'Chair screws', 'Window lock'],
};

const JobOrderForm = () => {
    const [jobOrder, setJobOrder] = useState({
        firstName: '',
        lastName: '',
        reqOffice: '',
        campus: '',
        building: '',
        floor: '',
        position: '',
        jobDesc: '',
        file: null,
        jobType: '', // New State for Job Order Type
        scenario: '', // New State for Scenario
        object: '', // New State for Object
        dateOfRequest: new Date().toISOString().split('T')[0], // Set current date
    });

    const [isLoading, setIsLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [fileName, setFileName] = useState('');
    const [objects, setObjects] = useState([]); // Dynamic objects based on scenario
    const [otherScenario, setOtherScenario] = useState('');
    const [otherObject, setOtherObject] = useState('');

    const handleCampusChange = useCallback((e) => {
        const campus = e.target.value;
        setJobOrder((prev) => ({ ...prev, campus, building: '', floor: '', reqOffice: '' }));
        setBuildings(Object.keys(data[campus] || {}));
        setFloors([]);
        setRooms([]);
    }, []);

    const handleBuildingChange = useCallback((e) => {
        const building = e.target.value;
        setJobOrder((prev) => ({ ...prev, building, floor: '', reqOffice: '' }));
        const selectedCampusData = data[jobOrder.campus];
        setFloors(Object.keys(selectedCampusData[building] || {}));
        setRooms([]);
    }, [jobOrder.campus]);

    const handleFloorChange = useCallback((e) => {
        const floor = e.target.value;
        setJobOrder((prev) => ({ ...prev, floor, reqOffice: '' }));
        const selectedCampusData = data[jobOrder.campus];
        setRooms(selectedCampusData[jobOrder.building][floor] || []);
    }, [jobOrder.campus, jobOrder.building]);

    const handleRoomChange = useCallback((e) => {
        setJobOrder((prev) => ({ ...prev, reqOffice: e.target.value }));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setJobOrder(prev => ({ ...prev, file }));
        setFileName(file ? file.name : '');
    };

    const handleScenarioChange = (e) => {
        const selectedScenario = e.target.value;
        setJobOrder(prev => ({ ...prev, scenario: selectedScenario, object: '' }));
        setObjects(scenarioToObjects[selectedScenario] || []);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/profile', { withCredentials: true });
                const userData = response.data;
                setJobOrder((prevJobOrder) => ({ ...prevJobOrder, firstName: userData.firstName, lastName: userData.lastName, position: userData.position }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Error fetching user profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const submitJobOrder = useCallback(async (e) => {
        e.preventDefault();

        // Determine the requesting office to submit
        const reqOfficeToSubmit = jobOrder.reqOffice === 'Other' ? jobOrder.otherReqOffice : jobOrder.reqOffice;

        // Determine scenario and object to submit
        const scenarioToSubmit = jobOrder.scenario === 'Other' ? otherScenario : jobOrder.scenario;
        const objectToSubmit = jobOrder.object === 'Other' ? otherObject : jobOrder.object;

        const { firstName, lastName, campus, building, floor, position, jobDesc, file, jobType, dateOfRequest } = jobOrder;

        // Sanitize job description
        const sanitizedJobDesc = DOMPurify.sanitize(jobDesc);

        // Validate required fields
        if (!firstName || !lastName || !reqOfficeToSubmit || !building || !floor || !campus || !position || !sanitizedJobDesc || !jobType || !dateOfRequest ) {
            return toast.error('All required fields must be filled out.');
        }

        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('reqOffice', reqOfficeToSubmit); // Use reqOfficeToSubmit here
            formData.append('campus', campus);
            formData.append('building', building);
            formData.append('floor', floor);
            formData.append('position', position);
            formData.append('jobDesc', sanitizedJobDesc); // Use sanitized job description
            formData.append('jobType', jobType); // Add job type
            formData.append('scenario', scenarioToSubmit); // Add scenario
            formData.append('object', objectToSubmit); // Add object
            formData.append('dateOfRequest', dateOfRequest); // New state for Date of Request

            if (file) {
                formData.append('file', file);
            }

            setIsLoading(true);

            const response = await axios.post('/api/addJobOrder', formData);
            const data = response.data;

            if (data.error) {
                setIsLoading(false);
                toast.error(data.error); // Corrected the reference here
            } else {
                setIsLoading(false);
                // Reset jobOrder state after submission
                setJobOrder(prev => ({
                    ...prev,
                    reqOffice: '',
                    otherReqOffice: '',
                    campus: '',
                    building: '',
                    floor: '',
                    jobDesc: '',
                    file: null,
                    jobType: '',
                    scenario: '',
                    object: '',
                    otherObject: '',
                    otherScenario: '',

                }));
                toast.success('Job Order Submitted');
            }
        } catch (error) {
            setIsLoading(false);
            return toast.error('Server Error');
        }
    }, [jobOrder]); // Add otherScenario and otherObject to the dependency array


    const maxLength = 250;
    const charactersLeft = maxLength - jobOrder.jobDesc.length;

    return (
        <Box
            component="form"
            autoComplete="off"
            noValidate
            onSubmit={submitJobOrder}
            encType="multipart/form-data"
        >
            <div className="flex">
                <div className="flex-wrap justify-between p-6 y-4 bg-gray-100 w-[77%] ml-[21.5%] mt-3">
                    <Typography variant="h5" gutterBottom>Job Order</Typography>

                    {/* Job Order Type Dropdown */}
                    <TextField
                        id="jobOrderType"
                        name="jobOrderType"
                        select
                        label="Job Order Type"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        value={jobOrder.jobType}
                        onChange={(e) => setJobOrder({ ...jobOrder, jobType: e.target.value })}
                        autoComplete="job-order-type"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            mb: 2
                        }}
                    >
                        {jobOrderTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        id="campus"
                        name="campus"
                        select
                        label="Campus"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        value={jobOrder.campus}
                        onChange={handleCampusChange}
                        autoComplete="campus"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            mb: 2
                        }}
                    >
                        {Object.keys(data).map((campus) => (
                            <MenuItem key={campus} value={campus}>
                                {campus}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        id="personnelName"
                        name="personnelName"
                        label="Name of Personnel"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        disabled
                        value={jobOrder.firstName + " " + jobOrder.lastName}
                        onChange={(e) => {
                            const [firstName, lastName] = e.target.value.split(' ');
                            setJobOrder({ ...jobOrder, firstName, lastName });
                        }}
                        autoComplete="name"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            mb: 2,
                        }}
                    />

                    <TextField
                        id="dateOfRequest"
                        name="dateOfRequest"
                        label="Date of Request"
                        type="date"
                        fullWidth
                        required
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={jobOrder.dateOfRequest}
                        disabled
                        sx={{
                            backgroundColor: '#f8f8f8',
                            mb: 2,
                        }}
                    />

                    {/* Warning for building, floor, and reqOffice */}
                    <Tooltip title="Please select a campus first." arrow disableHoverListener={!!jobOrder.campus}>
                        <Box mb={2}>
                            {/* Group for Building and Floor */}
                            <Box display="flex" gap={2} mb={2}>
                                <TextField
                                    id="building"
                                    name="building"
                                    select
                                    label="Building"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={jobOrder.building}
                                    onChange={handleBuildingChange}
                                    disabled={!jobOrder.campus}
                                    autoComplete="building"
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                    }}
                                >
                                    {buildings.map((building) => (
                                        <MenuItem key={building} value={building}>
                                            {building}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    id="floor"
                                    name="floor"
                                    select
                                    label="Floor"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={jobOrder.floor}
                                    onChange={handleFloorChange}
                                    disabled={!jobOrder.building}
                                    autoComplete="floor"
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                    }}
                                >
                                    {floors.map((floor) => (
                                        <MenuItem key={floor} value={floor}>
                                            {floor}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Requesting Office/College Field Below */}
                            <TextField
                                id="reqOffice"
                                name="reqOffice"
                                select
                                label="Requesting Office/College"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={jobOrder.reqOffice}
                                onChange={handleRoomChange}
                                required
                                disabled={!jobOrder.floor}
                                autoComplete="req-office"
                                sx={{
                                    backgroundColor: '#f8f8f8',
                                }}
                            >
                                {rooms.map((room) => (
                                    <MenuItem key={room} value={room}>
                                        {room}
                                    </MenuItem>
                                ))}
                                <MenuItem key="other" value="Other">
                                    Other
                                </MenuItem>
                            </TextField>

                            {/* Conditional TextField for "Other" */}
                            {jobOrder.reqOffice === 'Other' && (
                                <TextField
                                    id="otherReqOffice"
                                    name="otherReqOffice"
                                    label="Please specify"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={jobOrder.otherReqOffice || ''}
                                    onChange={(e) => setJobOrder({ ...jobOrder, otherReqOffice: e.target.value })}
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                        mt: 2,
                                    }}
                                />
                            )}

                        </Box>
                    </Tooltip>

                    <TextField
                        id="position"
                        name="position"
                        label="Position"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        disabled
                        value={jobOrder.position}
                        onChange={(e) => setJobOrder({ ...jobOrder, position: e.target.value })}
                        autoComplete="position"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            mb: 2,
                        }}
                    />

                    {/* Additional dropdowns for Scenario and Object */}
                    {/* Additional dropdowns for Scenario and Object */}
                    <Tooltip title="Please select a scenario first." arrow disableHoverListener={!jobOrder.scenario}>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                id="scenario"
                                name="scenario"
                                select
                                label="Scenario"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={jobOrder.scenario}
                                onChange={(e) => {
                                    const selectedScenario = e.target.value;
                                    setJobOrder({ ...jobOrder, scenario: selectedScenario, object: '' }); // Clear object if scenario changes
                                    if (selectedScenario !== 'Other') {
                                        setOtherScenario(''); // Clear otherScenario if not 'Other'
                                    }
                                    setObjects(selectedScenario === 'Other' ? [] : scenarioToObjects[selectedScenario] || []);
                                }}
                                autoComplete="scenario"
                                sx={{
                                    backgroundColor: '#f8f8f8',
                                }}
                            >
                                {Object.keys(scenarioToObjects).map((scenario) => (
                                    <MenuItem key={scenario} value={scenario}>
                                        {scenario}
                                    </MenuItem>
                                ))}
                                <MenuItem value="Other">Other</MenuItem> {/* Added 'Other' option */}
                            </TextField>

                            {jobOrder.scenario === 'Other' && (
                                <TextField
                                    id="otherScenario"
                                    name="otherScenario"
                                    label="Please specify other scenario"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={otherScenario}
                                    onChange={(e) => setOtherScenario(e.target.value)}
                                    autoComplete="other-scenario"
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                    }}
                                />
                            )}
                        </Box>
                    </Tooltip>

                    <Tooltip title="Please select an object first." arrow disableHoverListener={!jobOrder.object}>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                id="object"
                                name="object"
                                select
                                label="Object"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={jobOrder.object}
                                onChange={(e) => {
                                    const selectedObject = e.target.value;
                                    setJobOrder({ ...jobOrder, object: selectedObject });
                                    if (selectedObject !== 'Other') {
                                        setOtherObject(''); // Clear otherObject if not 'Other'
                                    }
                                }}
                                autoComplete="object"
                                disabled={!jobOrder.scenario}
                                sx={{
                                    backgroundColor: '#f8f8f8',
                                }}
                            >
                                {objects.map((object) => (
                                    <MenuItem key={object} value={object}>
                                        {object}
                                    </MenuItem>
                                ))}
                                <MenuItem value="Other">Other</MenuItem> {/* Added 'Other' option */}
                            </TextField>

                            {jobOrder.object === 'Other' && (
                                <TextField
                                    id="otherObject"
                                    name="otherObject"
                                    label="Please specify other object"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    value={otherObject}
                                    onChange={(e) => setOtherObject(e.target.value)}
                                    autoComplete="other-object"
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                    }}
                                />
                            )}
                        </Box>
                    </Tooltip>

                    {/* Job Description */}
                    <Box>
                        <TextField
                            id="jobDescription"
                            name="jobDescription"
                            label="Job Description"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            multiline
                            rows={3}
                            value={jobOrder.jobDesc}
                            onChange={e => setJobOrder({ ...jobOrder, jobDesc: e.target.value })}
                            inputProps={{ maxLength: maxLength }}
                            helperText={`${charactersLeft} characters left`}
                            autoComplete="job-description"
                            sx={{
                                backgroundColor: '#f8f8f8',
                            }}
                        />
                        {charactersLeft < 0 && (
                            <FormHelperText error>
                                You have exceeded the character limit by {-charactersLeft} characters.
                            </FormHelperText>
                        )}
                    </Box>

                    {/* File Upload and Submit Button in a Single Row */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        {/* Upload Button */}
                        <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            disabled={isLoading}
                            aria-label="Upload an image"
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png"
                            />
                        </Button>

                        {/* Display selected file name */}
                        {fileName && (
                            <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                                {fileName}
                            </Typography>
                        )}

                        {/* Submit Button aligned to the right */}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            sx={{
                                maxWidth: '150px', // Adjust width as needed
                            }}
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                    <Loader isLoading={isLoading} />
                </div>
            </div>
        </Box>
    );
};

export default JobOrderForm;

