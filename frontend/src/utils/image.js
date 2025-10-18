export const getImageUrl = (imagePath) => {
  const envBase = import.meta?.env?.VITE_API_BASE || ''
  const fallbacks = [envBase, 'http://localhost:5000', 'http://127.0.0.1:5000'].filter(Boolean)
  const placeholder = '/placeholder-juice.svg'

  if (!imagePath) return placeholder
  if (typeof imagePath !== 'string') return placeholder
  if (imagePath.startsWith('http')) return imagePath

  const candidates = []
  // If path is already an absolute-path like /uploads/...
  if (imagePath.startsWith('/')) {
    // try the path as-is first (maybe served by Vite/public)
    candidates.push(imagePath)
    // then try backend hosts
    fallbacks.forEach(base => candidates.push(`${base}${imagePath}`))
  } else {
    // filename only - try backend-host /uploads, public/uploads and relative uploads
    fallbacks.forEach(base => candidates.push(`${base}/uploads/${imagePath}`))
    candidates.push(`/public/uploads/${imagePath}`)
    candidates.push(`/uploads/${imagePath}`)
    candidates.push(`./uploads/${imagePath}`)
  }

  // return first candidate; callers/components can use SmartImage which will try multiple
  return candidates[0] || placeholder
}

export default getImageUrl
