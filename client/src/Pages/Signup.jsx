import React, { useState, useRef } from "react";
import { IconButton, InputAdornment, TextField, Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import signupLogoSrc from '../assets/img/nu_logo.webp';
import Loader from "../hooks/Loader";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [data, setData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleEmailChange = (e) => {
    const email = DOMPurify.sanitize(e.target.value).trim();
    setData({ ...data, email });
    const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students|faculty|admin)\.national-u\.edu\.ph$/;
    setEmailError(!emailDomainRegex.test(email) ? 'Please provide a valid email.' : '');
  };

  const sendOtp = async () => {
    try {
      const { email } = data;
      const sanitizedEmail = DOMPurify.sanitize(email);
      setIsLoading(true);
      await axios.post('/api/signupOTP', { email: sanitizedEmail });
      setIsOtpStep(true);
      toast.success('OTP sent to your email.');
    } catch (error) {
      setIsLoading(false);
      toast.error('Error sending OTP.');
    }
  };

  const verifyOtp = async () => {
    try {
      const { email } = data;
      setIsLoading(true);
      const response = await axios.post('/api/verify-otp-signup', { email, otp });
      if (response.data.error) {
        setIsLoading(false);
        toast.error(response.data.error);
      } else {
        setIsLoading(false);
        registerUser(); // Proceed to registration after OTP verification
      }
    } catch (error) {
      toast.error('Invalid OTP.');
    }
  };

  const registerUser = async () => {
    const { email, password } = data;
    const sanitizedData = {
      email: DOMPurify.sanitize(email),
      password: DOMPurify.sanitize(password),
    };
    try {
      setIsLoading(true);
      const response = await axios.post('/api/signup', sanitizedData); // Send only password, not confirmPassword
      const result = response.data;
      if (result.error) {
        setIsLoading(false);
        toast.error(result.error);
      } else {
        setIsLoading(false);
        setData({ email: '', password: '', confirmPassword: '' });
        toast.success('Registration successful.');
        navigate('/addInfo');
      }
    } catch (error) {
      toast.error('Error submitting form.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = data;

    // Check if all fields are filled
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Check if terms and conditions are accepted
    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions.');
      return;
    }

    // Send OTP before proceeding to registration
    sendOtp();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
        </div>
        <Box component="form" autoComplete="off" noValidate onSubmit={handleSubmit}>
          {!isOtpStep ? (
            <div id="input" className="space-y-6">
              <h1 className="text-2xl font-bold text-white text-center">Register</h1>
              <div className="space-y-4">
                <TextField
                  variant='filled'
                  label='Email'
                  fullWidth
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{
                    input: { color: 'white' },
                    '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid white' },
                    '& .Mui-focused': { borderColor: 'white' },
                    '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                  }}
                  value={data.email}
                  required
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                />
                <TextField
                  variant='filled'
                  type={showPassword ? 'text' : 'password'}
                  label='Password'
                  InputLabelProps={{ style: { color: 'white' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {showPassword ? <VisibilityOff style={{ color: 'white' }} /> : <Visibility style={{ color: 'white' }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  sx={{
                    input: { color: 'white' },
                    '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid white' },
                    '& .Mui-focused': { borderColor: 'white' },
                    '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                  }}
                  value={data.password}
                  required
                  onChange={(e) => setData({ ...data, password: DOMPurify.sanitize(e.target.value) })}
                />
                <TextField
                  variant='filled'
                  label='Confirm Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  InputLabelProps={{ style: { color: 'white' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowConfirmPassword}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {showConfirmPassword ? <VisibilityOff style={{ color: 'white' }} /> : <Visibility style={{ color: 'white' }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    input: { color: 'white' },
                    '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid white' },
                    '& .Mui-focused': { borderColor: 'white' },
                    '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                  }}
                  value={data.confirmPassword}
                  required
                  onChange={(e) => setData({ ...data, confirmPassword: DOMPurify.sanitize(e.target.value) })}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      style={{ color: 'white' }}
                    />
                  }
                  label="I agree to the Terms and Conditions"
                  style={{ color: 'white' }}
                />

                <button type='submit' className="bg-[#5cb85c] text-white border-none rounded-md cursor-pointer block py-2 px-8 mx-auto hover:bg-[#449D44]">Sign Up</button>
                <Loader isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <div className="otp-container flex flex-col items-center space-y-4">
              <TextField
                label="Enter OTP"
                variant="filled"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{
                  input: { color: 'white' },
                  '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid white' },
                  '& .Mui-focused': { borderColor: 'white' },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                }}
              />
              <Button
                onClick={verifyOtp}
                className="bg-[#5cb85c] hover:bg-[#449d44] text-white py-2 px-8 rounded-md"
                fullWidth
                sx={{
                  backgroundColor: '#5cb85c',
                  '&:hover': { backgroundColor: '#449d44' },
                }}
              >
                Verify OTP
              </Button>
              <Loader isLoading={isLoading} />
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Signup;
