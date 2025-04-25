// utils/decodeJWT.js

/**
 * Decodes a JWT token and returns its payload as a JavaScript object.
 * Works without external libraries like jwt-decode.
 *
 * @param {string} token - The JWT token string.
 * @returns {object|null} - The decoded payload or null if invalid.
 */
export default function decodeJWT(token) {
    try {
      if (!token) return null;
  
      const base64Payload = token.split('.')[1]; // Get payload part of the token
      if (!base64Payload) return null;
  
      const decodedPayload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
  
      // Parse the payload JSON string into a JS object
      return JSON.parse(decodeURIComponent(escape(decodedPayload)));
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return null;
    }
  }
  