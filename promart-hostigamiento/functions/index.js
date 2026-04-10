"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

exports.createPromartReport = functions.https.onCall(async (data, context) => {
    try {
        const payload = sanitizePayload(data);
        const validation = validatePayload(payload);

        if (!validation.valid) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                validation.message
            );
        }

        const trackingCode = generateTrackingCode();
        const now = admin.firestore.FieldValue.serverTimestamp();

        const docRef = await db.collection("promart_reportes").add({
            ...payload,
            trackingCode,
            source: "micrositio-promart-hackathon",
            status: "recibido",
            createdAt: now,
        });

        return {
            ok: true,
            id: docRef.id,
            trackingCode,
            message: "Solicitud registrada correctamente.",
        };
    } catch (error) {
        console.error("Error en createPromartReport:", error);

        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            "internal",
            "No se pudo registrar la solicitud."
        );
    }
});

function sanitizePayload(data) {
    const input = data && typeof data === "object" ? data : {};

    return {
        requestType: cleanString(input.requestType),
        region: cleanString(input.region),
        area: cleanString(input.area),
        relationship: cleanString(input.relationship),
        urgency: cleanString(input.urgency),
        incidentDate: cleanString(input.incidentDate),
        description: cleanString(input.description),
        ongoing: cleanString(input.ongoing),
        evidence: cleanString(input.evidence),
        fullName: cleanString(input.fullName),
        contactEmail: cleanString(input.contactEmail),
        contactPhone: cleanString(input.contactPhone),
        consentAccuracy: Boolean(input.consentAccuracy),
        consentPrivacy: Boolean(input.consentPrivacy),
        consentContact: Boolean(input.consentContact),
        channelRecommendation:
            cleanString(input.channelRecommendation) ||
            inferChannelRecommendation(cleanString(input.requestType)),
    };
}

function validatePayload(payload) {
    const allowedRequestTypes = ["orientacion", "reporte"];
    const allowedRegions = ["lima-callao", "norte", "centro-sur", "oriente"];
    const allowedAreas = [
        "piso-ventas",
        "caja",
        "almacen",
        "supervision",
        "back-office",
        "otro",
    ];
    const allowedRelationships = ["me-paso", "testigo", "me-contaron"];
    const allowedUrgencies = ["alta", "media", "baja"];
    const allowedOngoing = ["si", "no", "no-se"];
    const allowedEvidence = ["mensajes", "testigos", "ambos", "no", "no-se"];
    const allowedChannels = ["orientacion-inicial", "ruta-formal"];

    if (!allowedRequestTypes.includes(payload.requestType)) {
        return invalid("Tipo de solicitud inválido.");
    }

    if (!allowedRegions.includes(payload.region)) {
        return invalid("Región inválida.");
    }

    if (!allowedAreas.includes(payload.area)) {
        return invalid("Área inválida.");
    }

    if (!allowedRelationships.includes(payload.relationship)) {
        return invalid("Relación con el caso inválida.");
    }

    if (!allowedUrgencies.includes(payload.urgency)) {
        return invalid("Urgencia inválida.");
    }

    if (!allowedOngoing.includes(payload.ongoing)) {
        return invalid("Valor de continuidad inválido.");
    }

    if (!allowedEvidence.includes(payload.evidence)) {
        return invalid("Valor de evidencia inválido.");
    }

    if (!allowedChannels.includes(payload.channelRecommendation)) {
        return invalid("Canal sugerido inválido.");
    }

    if (!hasLengthBetween(payload.incidentDate, 4, 120)) {
        return invalid("La fecha o periodo aproximado es inválido.");
    }

    if (!hasLengthBetween(payload.description, 20, 1500)) {
        return invalid("La descripción debe tener entre 20 y 1500 caracteres.");
    }

    if (payload.fullName && payload.fullName.length > 120) {
        return invalid("El nombre o alias es demasiado largo.");
    }

    if (payload.contactEmail && !isValidEmail(payload.contactEmail)) {
        return invalid("Correo inválido.");
    }

    if (payload.contactEmail && payload.contactEmail.length > 160) {
        return invalid("El correo es demasiado largo.");
    }

    if (payload.contactPhone && !isValidPhone(payload.contactPhone)) {
        return invalid("Teléfono inválido.");
    }

    if (payload.contactPhone && payload.contactPhone.length > 40) {
        return invalid("El teléfono es demasiado largo.");
    }

    if (!payload.consentAccuracy || !payload.consentPrivacy) {
        return invalid("Faltan consentimientos obligatorios.");
    }

    return { valid: true };
}

function invalid(message) {
    return {
        valid: false,
        message,
    };
}

function cleanString(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function hasLengthBetween(value, min, max) {
    return typeof value === "string" && value.length >= min && value.length <= max;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
    return /^[0-9+\s()-]{6,20}$/.test(value);
}

function inferChannelRecommendation(requestType) {
    return requestType === "reporte" ? "ruta-formal" : "orientacion-inicial";
}

function generateTrackingCode() {
    const now = new Date();
    const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("");

    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PMH-${datePart}-${randomPart}`;
}