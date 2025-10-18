import React, { useState, useEffect } from 'react'

const SmartImage = ({ src, alt = '', style = {}, className = '', ...rest }) => {
  const [index, setIndex] = useState(0)
  const [candidates, setCandidates] = useState([])
  const placeholder = '/placeholder-juice.svg'

  useEffect(() => {
  const imgs = []
  const envBase = import.meta?.env?.VITE_API_BASE || ''
  const fallbacks = [envBase, 'http://localhost:5000', 'http://127.0.0.1:5000'].filter(Boolean)

    if (!src || typeof src !== 'string') {
      imgs.push(placeholder)
    } else {
      // If absolute URL
      if (src.startsWith('http')) imgs.push(src)

      // If src starts with a leading slash, prefer backend-host uploads first
      if (src.startsWith('/')) {
        const basename = src.replace(/^\/+/, '')
        // try backend /uploads/<basename> first
        fallbacks.forEach(base => imgs.push(`${base}/uploads/${basename}`))
        // then try backend + original path
        fallbacks.forEach(base => imgs.push(`${base}${src}`))
        // then try local public/relative uploads and finally the raw src
        imgs.push(`/public/uploads/${basename}`)
        imgs.push(`/uploads/${basename}`)
        imgs.push(src)
      } else {
        // filename-like: try several upload locations and backend hosts
        // 1) backend-host /uploads/<file>
        fallbacks.forEach(base => imgs.push(`${base}/uploads/${src}`))
        // 2) try local dev server public uploads and relative uploads
        imgs.push(`/public/uploads/${src}`)
        imgs.push(`/uploads/${src}`)
        imgs.push(`./uploads/${src}`)
      }

      // raw src as last attempt, then placeholder
      imgs.push(src)
      imgs.push(placeholder)
    }

    setCandidates(imgs)
    setIndex(0)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[SmartImage] candidates for', src, imgs)
    }
  }, [src])

  const handleError = (e) => {
    // try next candidate
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
