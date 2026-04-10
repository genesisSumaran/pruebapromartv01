(function () {
    "use strict";

    const firebaseConfig = {
        apiKey: "AIzaSyAcsdaJWllTTTeD0TGYRpUQC8pgFycPdB0c",
        authDomain: "promart-hostigamiento.firebaseapp.com",
        projectId: "promart-hostigamiento",
        storageBucket: "promart-hostigamiento.firebasestorage.app",
        messagingSenderId: "511049474074",
        appId: "1:511049474074:web:c395860242cc159c53b1a3"
    };

    const collectionName = "promart_reportes";

    let appInstance = null;
    let firestoreInstance = null;
    let firebaseReady = false;

    initFirebase();

    function initFirebase() {
        const hasConfig =
            firebaseConfig.apiKey &&
            firebaseConfig.projectId &&
            firebaseConfig.appId;

        const hasFirebaseSDK =
            typeof window.firebase !== "undefined" &&
            typeof window.firebase.initializeApp === "function" &&
            typeof window.firebase.firestore === "function";

        if (!hasConfig || !hasFirebaseSDK) {
            window.PromartFirebase = createFallbackApi(
                !hasConfig
                    ? "Firebase no está configurado todavía."
                    : "Firebase SDK no está cargado."
            );
            return;
        }

        try {
            if (!window.firebase.apps.length) {
                appInstance = window.firebase.initializeApp(firebaseConfig);
            } else {
                appInstance = window.firebase.app();
            }

            firestoreInstance = window.firebase.firestore();
            firebaseReady = true;

            window.PromartFirebase = {
                isReady: true,
                saveReport,
                getStatus() {
                    return {
                        ready: firebaseReady,
                        mode: "firestore",
                        collection: collectionName
                    };
                }
            };

            console.info("Firebase inicializado correctamente.");
        } catch (error) {
            console.error("Error al iniciar Firebase:", error);
            window.PromartFirebase = createFallbackApi("Error al inicializar Firebase.");
        }
    }

    async function saveReport(payload) {
        if (!firebaseReady || !firestoreInstance) {
            throw new Error("Firestore no está disponible.");
        }

        const sanitizedPayload = sanitizePayload(payload);

        const docRef = await firestoreInstance.collection(collectionName).add({
            ...sanitizedPayload,
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
            source: sanitizedPayload.source || "micrositio-promart-hackathon",
            status: sanitizedPayload.status || "recibido"
        });

        return {
            ok: true,
            id: docRef.id,
            mode: "firestore"
        };
    }

    function sanitizePayload(payload) {
        const safeObject = {};

        Object.entries(payload || {}).forEach(([key, value]) => {
            if (typeof value === "string") {
                safeObject[key] = value.trim();
                return;
            }

            if (typeof value === "boolean" || typeof value === "number") {
                safeObject[key] = value;
                return;
            }

            if (value === null || value === undefined) {
                safeObject[key] = null;
                return;
            }

            safeObject[key] = String(value);
        });

        return safeObject;
    }

    function createFallbackApi(reason) {
        return {
            isReady: false,
            async saveReport() {
                throw new Error(reason || "Firebase no disponible.");
            },
            getStatus() {
                return {
                    ready: false,
                    mode: "fallback",
                    reason: reason || "No disponible"
                };
            }
        };
    }
})();