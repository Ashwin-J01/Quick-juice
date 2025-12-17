import React, { useState, useEffect } from 'react'
import { getImageUrl } from '../utils/image'

const SmartImage = ({ src, alt = '', style = {}, className = '', ...rest }) => {
  const [index, setIndex] = useState(0)
  const [candidates, setCandidates] = useState([])
  const placeholder = '/placeholder-juice.svg'

  useEffect(() => {
    const imgs = []
    
    if (!src || typeof src !== 'string') {
      imgs.push(placeholder)
    } else {
      // If already a full URL, use it directly
      if (src.startsWith('http://') || src.startsWith('https://')) {
        imgs.push(src)
      } else {
        // Use the getImageUrl helper to construct the full URL
        const fullUrl = getImageUrl(src)
        imgs.push(fullUrl)
      }
      
      // Fallback candidates for local development
      if (src.startsWith('/')) {
        const basename = src.replace(/^\/+/, '')
        imgs.push(`/public/uploads/${basename}`)
        imgs.push(`/uploads/${basename}`)
        imgs.push(src)
      } else if (!src.startsWith('http')) {
        imgs.push(`/public/uploads/${src}`)
        imgs.push(`/uploads/${src}`)
        imgs.push(`./uploads/${src}`)
      }
      
      imgs.push(placeholder)
    }

    setCandidates(imgs)
    setIndex(0)
    
    if (import.meta.env.DEV) {
      console.debug('[SmartImage] candidates for', src, imgs)
    }
  }, [src])

  const handleError = (e) => {
    // Try next candidate
    setIndex(i => {
      const next = i + 1
      if (next >= candidates.length) return i
      e.target.src = candidates[next]
      return next
    })
  }

  const current = candidates[index] || placeholder

  return (
    <img
      src={current}
      alt={alt}
      onError={handleError}
      style={style}
      className={className}
      {...rest}
    />
  )
}

export default SmartImage
