import { usePageTone } from '../hooks/usePageTone'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

interface LightboxImageData {
  alt: string
  caption?: string
  src: string
}

interface ImageLightboxContextValue {
  openImage: (image: LightboxImageData, trigger: HTMLButtonElement) => void
}

interface ImageLightboxProviderProps {
  children: ReactNode
}

interface LightboxImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  alt: string
  caption?: string
  previewSrc?: string
  src: string
  triggerAriaHidden?: boolean
  triggerClassName?: string
  triggerTabIndex?: number
}

const ImageLightboxContext = createContext<ImageLightboxContextValue | null>(
  null,
)

export function ImageLightboxProvider({
  children,
}: ImageLightboxProviderProps) {
  const [activeImage, setActiveImage] = useState<LightboxImageData | null>(null)
  usePageTone('#020404', true, activeImage !== null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const openingTrigger = useRef<HTMLButtonElement | null>(null)

  const closeImage = useCallback(() => {
    setActiveImage(null)
    window.requestAnimationFrame(() => openingTrigger.current?.focus())
  }, [])

  const openImage = useCallback(
    (image: LightboxImageData, trigger: HTMLButtonElement) => {
      openingTrigger.current = trigger
      setActiveImage(image)
    },
    [],
  )

  useEffect(() => {
    if (!activeImage) return

    const appRoot = document.getElementById('root')
    const previousOverflow = document.body.style.overflow
    const previousInert = appRoot?.inert ?? false
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeImage()
    }

    document.body.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true
    window.addEventListener('keydown', closeOnEscape)
    closeButton.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = previousInert
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeImage, closeImage])

  return (
    <ImageLightboxContext.Provider value={{ openImage }}>
      {children}

      {activeImage &&
        createPortal(
          <div
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.caption ?? activeImage.alt}
          >
            <button
              className="image-lightbox__backdrop"
              type="button"
              aria-label="Cerrar imagen"
              onClick={closeImage}
            />

            <figure className="image-lightbox__figure">
              <img src={activeImage.src} alt={activeImage.alt} />
              {activeImage.caption && (
                <figcaption>{activeImage.caption}</figcaption>
              )}
            </figure>

            <button
              className="image-lightbox__close"
              type="button"
              onClick={closeImage}
              ref={closeButton}
            >
              <span aria-hidden="true">×</span>
              Cerrar
            </button>
          </div>,
          document.body,
        )}
    </ImageLightboxContext.Provider>
  )
}

export function LightboxImage({
  alt,
  caption,
  previewSrc,
  src,
  triggerAriaHidden,
  triggerClassName = '',
  triggerTabIndex,
  ...imageProps
}: LightboxImageProps) {
  const lightbox = useContext(ImageLightboxContext)

  if (!lightbox) {
    throw new Error('LightboxImage must be used inside ImageLightboxProvider')
  }

  return (
    <button
      className={`image-lightbox-trigger ${triggerClassName}`.trim()}
      type="button"
      aria-hidden={triggerAriaHidden}
      aria-label={`Ampliar ${caption ?? alt}`}
      tabIndex={triggerTabIndex}
      onClick={(event) =>
        lightbox.openImage({ alt, caption, src }, event.currentTarget)
      }
    >
      <img src={previewSrc ?? src} alt={alt} {...imageProps} />
    </button>
  )
}
