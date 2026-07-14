import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Participante } from '../lib/supabase'
import { Camera, PenLine, Check, X, RotateCcw, AlertCircle, UserCheck } from 'lucide-react'

type Props = {
  participante: Participante
  dialogoId: string
  onClose: () => void
  onConfirmed: (updated: Participante) => void
}

type Step = 'photo' | 'signature' | 'saving'

export default function ConfirmacaoPresenca({ participante, dialogoId, onClose, onConfirmed }: Props) {
  const [step, setStep] = useState<Step>('photo')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const photoCanvasRef = useRef<HTMLCanvasElement>(null)
  const sigCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')

  // Start camera when on photo step
  useEffect(() => {
    if (step !== 'photo') return
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (err: any) {
        setCameraError(
          err?.name === 'NotAllowedError'
            ? 'Permissão de câmera negada. Autorize o acesso à câmera para confirmar presença.'
            : 'Não foi possível acessar a câmera do dispositivo.'
        )
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [step])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = photoCanvasRef.current
    if (!video || !canvas) return

    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror the photo to match preview
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)

    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.8))
  }, [])

  function retakePhoto() {
    setPhotoDataUrl(null)
    setCameraReady(false)
    // Restart camera
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().then(() => setCameraReady(true))
    }
  }

  // Signature canvas
  useEffect(() => {
    if (step !== 'signature') return
    const canvas = sigCanvasRef.current
    if (!canvas) return

    // Set canvas size to match displayed size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let drawing = false
    let lastX = 0
    let lastY = 0

    function getPos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    function start(e: PointerEvent) {
      drawing = true
      const pos = getPos(e)
      lastX = pos.x
      lastY = pos.y
    }

    function draw(e: PointerEvent) {
      if (!drawing) return
      e.preventDefault()
      const pos = getPos(e)
      ctx!.beginPath()
      ctx!.moveTo(lastX, lastY)
      ctx!.lineTo(pos.x, pos.y)
      ctx!.stroke()
      lastX = pos.x
      lastY = pos.y
    }

    function stop() {
      drawing = false
    }

    canvas.addEventListener('pointerdown', start)
    canvas.addEventListener('pointermove', draw)
    canvas.addEventListener('pointerup', stop)
    canvas.addEventListener('pointerleave', stop)
    canvas.addEventListener('pointercancel', stop)

    return () => {
      canvas.removeEventListener('pointerdown', start)
      canvas.removeEventListener('pointermove', draw)
      canvas.removeEventListener('pointerup', stop)
      canvas.removeEventListener('pointerleave', stop)
      canvas.removeEventListener('pointercancel', stop)
    }
  }, [step])

  function clearSignature() {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(null)
  }

  function saveSignature() {
    const canvas = sigCanvasRef.current
    if (!canvas) return
    // Check if canvas has content
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0)
    if (!hasContent) {
      setError('Por favor, desenhe sua assinatura.')
      return
    }
    setSignatureDataUrl(canvas.toDataURL('image/png'))
    setError('')
  }

  async function handleConfirm() {
    if (!photoDataUrl || !signatureDataUrl) return
    setStep('saving')
    setError('')

    try {
      const photoBlob = await dataUrlToBlob(photoDataUrl)
      const sigBlob = await dataUrlToBlob(signatureDataUrl)
      const photoPath = `${dialogoId}/${participante.id}-foto.jpg`
      const sigPath = `${dialogoId}/${participante.id}-assinatura.png`

      const [photoUpload, sigUpload] = await Promise.all([
        supabase.storage.from('participantes-fotos').upload(photoPath, photoBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        }),
        supabase.storage.from('participantes-fotos').upload(sigPath, sigBlob, {
          contentType: 'image/png',
          upsert: true,
        }),
      ])

      if (photoUpload.error) throw photoUpload.error
      if (sigUpload.error) throw sigUpload.error

      const { data: photoUrlData } = supabase.storage.from('participantes-fotos').getPublicUrl(photoPath)
      const { data: sigUrlData } = supabase.storage.from('participantes-fotos').getPublicUrl(sigPath)

      const { data, error: updateError } = await supabase
        .from('participantes')
        .update({
          assinatura: true,
          foto_url: photoUrlData.publicUrl,
          assinatura_imagem_url: sigUrlData.publicUrl,
          assinatura_data: new Date().toISOString(),
        })
        .eq('id', participante.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      onConfirmed(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar presença.')
      setStep('signature')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-success-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-neutral-800 text-base">
                Confirmar Presença
              </h2>
              <p className="text-xs text-neutral-500">{participante.nome}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
              }
              onClose()
            }}
            className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 py-3 bg-neutral-50 border-b border-neutral-100">
          <StepBadge num={1} label="Foto" active={step === 'photo'} done={step !== 'photo'} />
          <div className="w-8 h-px bg-neutral-200" />
          <StepBadge num={2} label="Assinatura" active={step === 'signature'} done={step === 'saving'} />
          <div className="w-8 h-px bg-neutral-200" />
          <StepBadge num={3} label="Confirmação" active={step === 'saving'} done={false} />
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger-200 flex items-center gap-2 text-sm text-danger-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Photo step */}
          {step === 'photo' && (
            <div>
              <p className="text-sm text-neutral-600 mb-3 text-center">
                Tire uma foto do participante para confirmar a presença.
              </p>

              {cameraError ? (
                <div className="p-6 rounded-xl bg-danger-50 border border-danger-200 text-center">
                  <Camera className="w-8 h-8 text-danger-400 mx-auto mb-2" />
                  <p className="text-sm text-danger-700">{cameraError}</p>
                </div>
              ) : photoDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-200">
                  <img src={photoDataUrl} alt="Foto" className="w-full h-64 object-cover" />
                  <button
                    onClick={retakePhoto}
                    className="absolute bottom-3 right-3 btn-secondary text-sm bg-white/90 backdrop-blur"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refazer
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-64 object-cover -scale-x-100"
                  />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/70 text-sm animate-pulse">Iniciando câmera...</div>
                    </div>
                  )}
                </div>
              )}

              <canvas ref={photoCanvasRef} className="hidden" />

              <div className="flex gap-2 mt-4">
                {!photoDataUrl && !cameraError && (
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    className="btn-primary w-full"
                  >
                    <Camera className="w-4 h-4" />
                    Capturar foto
                  </button>
                )}
                {photoDataUrl && (
                  <>
                    <button onClick={retakePhoto} className="btn-secondary flex-1">
                      <RotateCcw className="w-4 h-4" />
                      Refazer
                    </button>
                    <button onClick={() => setStep('signature')} className="btn-primary flex-1">
                      Continuar
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Signature step */}
          {step === 'signature' && (
            <div>
              <p className="text-sm text-neutral-600 mb-3 text-center">
                Desenhe a assinatura do participante no campo abaixo.
              </p>

              <div className="rounded-xl border border-neutral-300 bg-white overflow-hidden">
                <canvas
                  ref={sigCanvasRef}
                  className="w-full touch-none cursor-crosshair"
                  style={{ height: 200 }}
                />
              </div>

              {signatureDataUrl && (
                <div className="mt-3 p-3 rounded-lg bg-success-50 border border-success-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-success-700">Assinatura capturada</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => { clearSignature(); setStep('photo') }} className="btn-secondary">
                  Voltar
                </button>
                <button onClick={clearSignature} className="btn-secondary flex-1">
                  <RotateCcw className="w-4 h-4" />
                  Limpar
                </button>
                {!signatureDataUrl ? (
                  <button onClick={saveSignature} className="btn-primary flex-1">
                    <PenLine className="w-4 h-4" />
                    Capturar assinatura
                  </button>
                ) : (
                  <button onClick={handleConfirm} className="btn-primary flex-1">
                    <Check className="w-4 h-4" />
                    Confirmar presença
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Saving step */}
          {step === 'saving' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-aguia-100 flex items-center justify-center animate-pulse mb-3">
                <Check className="w-6 h-6 text-aguia-600" />
              </div>
              <p className="text-sm text-neutral-500">Salvando confirmação...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
          done
            ? 'bg-success-500 text-white'
            : active
            ? 'bg-aguia-600 text-white'
            : 'bg-neutral-200 text-neutral-500'
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : num}
      </div>
      <span className={`text-xs font-medium ${active || done ? 'text-neutral-700' : 'text-neutral-400'}`}>
        {label}
      </span>
    </div>
  )
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob())
}
