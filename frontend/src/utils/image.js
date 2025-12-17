/**
 * Constructs the full image URL for use in the frontend
 * Handles both relative paths and absolute URLs from the backend
 * 
 * @param {string} imagePath - The image path from the backend (e.g., 'juice-1.jpg', '/uploads/juice-1.jpg', or full URL)
 * @returns {string} - The full image URL or a placeholder
 * 
 * Development: Uses http://localhost:5000 as backend
 * Production: Uses environment variable VITE_API_URL or Render backend URL
 */
export const getImageUrl = (imagePath) => {
  const placeholder = '/placeholder-juice.svg'
  
  // Return placeholder for missing or invalid paths
  if (!imagePath || typeof imagePath !== 'string') {
    return placeholder
  }
  
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Get backend base URL from environment or use development default
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const backendUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix to get base URL
  
  // Ensure imagePath starts with /uploads for consistency
  const normalizedPath = imagePath.startsWith('/') 
    ? imagePath 
    : `/uploads/${imagePath}`
  
  // Return full URL with backend base URL
  return `${backendUrl}${normalizedPath}`
}

export default getImageUrl
