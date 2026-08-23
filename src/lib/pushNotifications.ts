import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── VAPID ──────────────────────────────────────────────────────────────────

/**
 * Obtiene la clave pública VAPID del servidor para usarla en la suscripción.
 */
async function fetchVapidPublicKey(): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/ed/push/vapid-key`, { headers });
  if (!res.ok) throw new Error("No se pudo obtener la VAPID key");
  const data = await res.json();
  return data.vapid_public_key;
}

/**
 * Convierte la VAPID public key (Base64URL) al formato Uint8Array
 * que necesita la Web Push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ─── Soporte del browser ─────────────────────────────────────────────────────

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function getPermissionState(): NotificationPermission {
  return Notification.permission;
}

// ─── Suscripción ─────────────────────────────────────────────────────────────

/**
 * Activa las notificaciones push para el usuario actual:
 * 1. Pide permiso al browser
 * 2. Obtiene la VAPID key del servidor
 * 3. Suscribe al Service Worker
 * 4. Envía la suscripción al backend para guardarla
 */
export async function subscribeToPush(): Promise<"ok" | "denied" | "error"> {
  if (!isPushSupported()) return "error";

  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission !== "granted") return "error";

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = await fetchVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);

    console.debug("[Push] applicationServerKey length:", applicationServerKey.length, "bytes");

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });

    const subJson = subscription.toJSON();
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/ed/push/subscribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Push] Error del servidor al guardar suscripción:", res.status, text);
      throw new Error("Error al guardar suscripción en el servidor");
    }
    return "ok";
  } catch (err) {
    console.error("[Push] Error al suscribirse:", err instanceof Error ? err.message : err);
    return "error";
  }
}

/**
 * Desactiva las notificaciones push para el dispositivo actual:
 * 1. Obtiene la suscripción activa del SW
 * 2. La elimina del backend
 * 3. La cancela en el browser
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    const headers = await getAuthHeaders();

    // Notificar al backend primero
    await fetch(`${API_URL}/ed/push/unsubscribe`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    // Luego desuscribir en el browser
    await subscription.unsubscribe();
    return true;
  } catch (err) {
    console.error("[Push] Error al desuscribirse:", err);
    return false;
  }
}

/**
 * Consulta al backend si el endpoint actual está registrado como suscripto.
 * Útil para sincronizar el estado del toggle al cargar el perfil.
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/ed/push/status?endpoint=${encodeURIComponent(subscription.endpoint)}`,
      { headers }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.subscribed === true;
  } catch {
    return false;
  }
}

/**
 * Verifica si las notificaciones push están autorizadas pero desincronizadas
 * (falta suscripción en el browser o el backend borró la fila por pruning)
 * y re-suscribe silenciosamente en segundo plano. Best-effort.
 */
export async function repairSubscriptionIfNeeded(): Promise<void> {
  if (!isPushSupported()) return;
  if (Notification.permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const browserSub = await reg.pushManager.getSubscription();

    const isSubscribedInBackend = browserSub ? await checkSubscriptionStatus() : false;
    const needsRepair = !browserSub || !isSubscribedInBackend;

    if (needsRepair) {
      console.debug("[Push] Detectada suscripción desincronizada o faltante. Reparando...");
      await subscribeToPush();
    }
  } catch (err) {
    console.error("[Push] Error durante auto-reparación de suscripción:", err);
  }
}

