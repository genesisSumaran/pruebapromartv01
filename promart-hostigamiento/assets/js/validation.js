(function () {
    "use strict";

    const validators = {
        required(value) {
            if (typeof value === "boolean") return value;
            return String(value ?? "").trim().length > 0;
        },

        minLength(value, min) {
            return String(value ?? "").trim().length >= min;
        },

        maxLength(value, max) {
            return String(value ?? "").trim().length <= max;
        },

        email(value) {
            const text = String(value ?? "").trim();
            if (!text) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
        },

        phone(value) {
            const text = String(value ?? "").trim();
            if (!text) return true;
            return /^[0-9+\s()-]{6,20}$/.test(text);
        },
    };

    const fieldMessages = {
        region: {
            required: "Selecciona una región.",
        },
        area: {
            required: "Selecciona un área o entorno.",
        },
        relationship: {
            required: "Indica qué relación tienes con el caso.",
        },
        urgency: {
            required: "Selecciona el nivel de urgencia.",
        },
        incidentDate: {
            required: "Indica una fecha o periodo aproximado.",
            minLength: "Da un poco más de contexto sobre cuándo ocurrió.",
            maxLength: "Este campo es demasiado largo. Resúmelo un poco.",
        },
        description: {
            required: "Describe brevemente lo ocurrido.",
            minLength: "Agrega un poco más de detalle para entender mejor la situación.",
            maxLength: "Tu descripción es muy larga. Intenta resumir lo esencial.",
        },
        ongoing: {
            required: "Indica si la situación sigue ocurriendo.",
        },
        evidence: {
            required: "Selecciona si existen mensajes, testigos o evidencia.",
        },
        fullName: {
            maxLength: "El nombre o alias es demasiado largo.",
        },
        contactEmail: {
            email: "Ingresa un correo válido o déjalo vacío.",
            maxLength: "El correo es demasiado largo.",
        },
        contactPhone: {
            phone: "Ingresa un teléfono válido o déjalo vacío.",
            maxLength: "El medio de contacto es demasiado largo.",
        },
        consentAccuracy: {
            required: "Debes confirmar este punto para continuar.",
        },
        consentPrivacy: {
            required: "Debes aceptar este punto para continuar.",
        },
    };

    const formRules = {
        region: [
            { rule: "required" },
        ],
        area: [
            { rule: "required" },
        ],
        relationship: [
            { rule: "required" },
        ],
        urgency: [
            { rule: "required" },
        ],
        incidentDate: [
            { rule: "required" },
            { rule: "minLength", value: 4 },
            { rule: "maxLength", value: 120 },
        ],
        description: [
            { rule: "required" },
            { rule: "minLength", value: 20 },
            { rule: "maxLength", value: 1500 },
        ],
        ongoing: [
            { rule: "required" },
        ],
        evidence: [
            { rule: "required" },
        ],
        fullName: [
            { rule: "maxLength", value: 120 },
        ],
        contactEmail: [
            { rule: "email" },
            { rule: "maxLength", value: 160 },
        ],
        contactPhone: [
            { rule: "phone" },
            { rule: "maxLength", value: 40 },
        ],
        consentAccuracy: [
            { rule: "required" },
        ],
        consentPrivacy: [
            { rule: "required" },
        ],
    };

    function getFieldValue(form, fieldName) {
        const field = form.elements[fieldName];
        if (!field) return "";

        if (field.type === "checkbox") {
            return field.checked;
        }

        if (field.type === "radio") {
            const checked = form.querySelector(`[name="${fieldName}"]:checked`);
            return checked ? checked.value : "";
        }

        return field.value;
    }

    function sanitizeText(value) {
        return String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function collectFormData(form) {
        return {
            requestType:
                form.querySelector('input[name="requestType"]:checked')?.value || "orientacion",
            region: sanitizeText(getFieldValue(form, "region")),
            area: sanitizeText(getFieldValue(form, "area")),
            relationship: sanitizeText(getFieldValue(form, "relationship")),
            urgency: sanitizeText(getFieldValue(form, "urgency")),
            incidentDate: sanitizeText(getFieldValue(form, "incidentDate")),
            description: sanitizeText(getFieldValue(form, "description")),
            ongoing: sanitizeText(getFieldValue(form, "ongoing")),
            evidence: sanitizeText(getFieldValue(form, "evidence")),
            fullName: sanitizeText(getFieldValue(form, "fullName")),
            contactEmail: sanitizeText(getFieldValue(form, "contactEmail")),
            contactPhone: sanitizeText(getFieldValue(form, "contactPhone")),
            consentAccuracy: Boolean(getFieldValue(form, "consentAccuracy")),
            consentPrivacy: Boolean(getFieldValue(form, "consentPrivacy")),
            consentContact: Boolean(getFieldValue(form, "consentContact")),
        };
    }

    function validateField(fieldName, value) {
        const rules = formRules[fieldName] || [];
        const messages = fieldMessages[fieldName] || {};

        for (const item of rules) {
            const validator = validators[item.rule];
            if (typeof validator !== "function") continue;

            const isValid =
                item.value !== undefined ? validator(value, item.value) : validator(value);

            if (!isValid) {
                return {
                    valid: false,
                    message: messages[item.rule] || "Revisa este campo.",
                };
            }
        }

        return {
            valid: true,
            message: "",
        };
    }

    function validateFormData(data) {
        const errors = {};

        Object.keys(formRules).forEach((fieldName) => {
            const result = validateField(fieldName, data[fieldName]);
            if (!result.valid) {
                errors[fieldName] = result.message;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    function clearFieldError(form, fieldName) {
        const field = form.elements[fieldName];
        const errorNode = form.querySelector(`[data-error-for="${fieldName}"]`);
        if (!errorNode) return;

        errorNode.textContent = "";
        errorNode.classList.add("is-hidden");

        if (field) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
            field.classList.remove("is-invalid");
        }
    }

    function showFieldError(form, fieldName, message) {
        const field = form.elements[fieldName];
        const errorNode = form.querySelector(`[data-error-for="${fieldName}"]`);
        if (!errorNode) return;

        errorNode.textContent = message;
        errorNode.classList.remove("is-hidden");

        if (field) {
            field.setAttribute("aria-invalid", "true");
            field.setAttribute("aria-describedby", errorNode.dataset.errorFor);
            field.classList.add("is-invalid");
        }
    }

    function clearAllErrors(form) {
        Object.keys(formRules).forEach((fieldName) => {
            clearFieldError(form, fieldName);
        });
    }

    function renderErrors(form, errors) {
        clearAllErrors(form);

        Object.entries(errors).forEach(([fieldName, message]) => {
            showFieldError(form, fieldName, message);
        });
    }

    function focusFirstError(form, errors) {
        const firstFieldName = Object.keys(errors)[0];
        if (!firstFieldName) return;

        const field = form.elements[firstFieldName];
        if (!field || typeof field.focus !== "function") return;

        field.focus();
    }

    function bindLiveValidation(form) {
        if (!form) return;

        Object.keys(formRules).forEach((fieldName) => {
            const field = form.elements[fieldName];
            if (!field) return;

            const eventName =
                field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";

            field.addEventListener(eventName, () => {
                const value = getFieldValue(form, fieldName);
                const result = validateField(fieldName, sanitizeDynamicValue(value));

                if (result.valid) {
                    clearFieldError(form, fieldName);
                }
            });
        });
    }

    function sanitizeDynamicValue(value) {
        if (typeof value === "boolean") return value;
        return sanitizeText(value);
    }

    window.ReportValidation = {
        collectFormData,
        validateField,
        validateFormData,
        clearAllErrors,
        renderErrors,
        focusFirstError,
        bindLiveValidation,
        sanitizeText,
    };
})();