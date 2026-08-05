/// <reference types="vite-plugin-pwa/client" />
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-emerald-500 max-w-sm w-full transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Nueva versión disponible. Haz clic para actualizar la página.
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => close()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReloadPrompt
