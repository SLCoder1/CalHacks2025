# API Setup Guide

## Overview
The chatbot connects to a Flask backend. This guide explains how to configure the API URL for different environments.

## Configuration File
Edit `config/api.ts` to set the correct API URL for your environment.

## Setup Options

### 1. Local Development (Default)
```typescript
development: 'http://localhost:3001'
```
- Works on simulator/emulator
- Backend runs on your computer

### 2. Physical Device Testing
```typescript
development: 'http://YOUR_COMPUTER_IP:3001'
```
- Replace `YOUR_COMPUTER_IP` with your computer's IP address
- Both device and computer must be on same WiFi network
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### 3. Production Deployment
```typescript
production: 'https://your-backend-url.com'
```
- Deploy backend to cloud service (Heroku, Railway, etc.)
- Update this URL with your deployed backend URL

## Quick Setup for Physical Device Testing

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig | findstr "IPv4"
   
   # Mac/Linux
   ifconfig | grep "inet "
   ```

2. **Update the config file:**
   ```typescript
   // In config/api.ts
   development: 'http://192.168.1.100:3001' // Replace with your IP
   ```

3. **Make sure backend is running:**
   ```bash
   cd votEZ/backend
   python app.py
   ```

4. **Test on your device:**
   - Both device and computer must be on same WiFi
   - Open the app and try the chatbot

## For Other Developers

When someone clones your repo:
1. They'll need to set up their own backend
2. Update `config/api.ts` with their own URL
3. Or deploy to a shared backend service

## Recommended Production Setup

1. **Deploy backend to cloud service:**
   - Heroku, Railway, Render, or similar
   - Get the public URL

2. **Update production URL:**
   ```typescript
   production: 'https://your-app-name.herokuapp.com'
   ```

3. **Build and deploy frontend:**
   - The app will automatically use production URL in release builds 