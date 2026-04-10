document.addEventListener("DOMContentLoaded", () => {
    const isReportPage = document.body.classList.contains("page-reporte");
    if (!isReportPage) return;

    const form = document.getElementById("reportForm");
    const summaryText = document.getElementById("requestSummaryText");
    const successCard = document.getElementById("formSuccessCard");
    const trackingCode = document.getElementById("trackingCode");
    const successMessage = document.getElementById("successMessage");
    const submitButton = document.getElementById("submitReportBtn");
    const resetButton = document.getElementById("resetReportFormBtn");
    const newRequestButton = document.getElementById("newRequestBtn");
    const requestTypeInputs = Array.from(
        document.querySelectorAll('input[name="requestType"]')
    );

    if (!form || !window.ReportValidation) {
        console.warn("No se encontró el formulario o el módulo de validación.");
        return;
    }

    const STORAGE_KEY = "promart_report_draft_v1";

    const requestTypeMeta = {
        orientacion: {
            summary:
                "Estás solicitando orientación inicial. Esta ruta sirve para entender tus opciones, ordenar lo ocurrido y decidir con más claridad qué hacer después.",
            success:
                "Tu solicitud de orientación quedó registrada. Guarda este código y úsalo si necesitas dar seguimiento a esta consulta.",
        },
        reporte: {
            summary:
                "Estás iniciando una ruta de reporte. Esta opción está pensada para cuando ya decidiste avanzar hacia una gestión más formal del caso.",
            success:
                "Tu solicitud para iniciar una ruta de reporte quedó registrada. Guarda este código y úsalo si necesitas seguimiento o referencia posterior.",
        },
    };

    init();

    function init() {
        hydrateDraft();
        updateRequestTypeSummary();
        window.ReportValidation.bindLiveValidation(form);
        bindEvents();
    }

    function bindEvents() {
        requestTypeInputs.forEach((input) => {
            input.addEventListener("change", () => {
                updateRequestTypeSummary();
                persistDraft();
            });
        });

        form.addEventListener("input", persistDraft);
        form.addEventListener("change", persistDraft);

        form.addEventListener("submit", handleSubmit);
        resetButton?.addEventListener("click", handleReset);
        newRequestButton?.addEventListener("click", handleNewRequest);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const data = window.ReportValidation.collectFormData(form);
        const validation = window.ReportValidation.validateFormData(data);

        if (!validation.isValid) {
            window.ReportValidation.renderErrors(form, validation.errors);
            window.ReportValidation.focusFirstError(form, validation.errors);
            return;
        }

        window.ReportValidation.clearAllErrors(form);

        setSubmitState(true);

        const payload = buildPayload(data);
        const code = generateTrackingCode();

        saveSubmission(payload)
            .then(() => {
                showSuccess(code, data.requestType);
                clearDraft();
            })
            .catch((error) => {
                console.error("No se pudo guardar en backend. Se mostrará modo local.", error);
                showSuccess(code, data.requestType, true);
                clearDraft();
            })
            .finally(() => {
                setSubmitState(false);
            });
    }

    function handleReset() {
        form.reset();
        window.ReportValidation.clearAllErrors(form);

        const defaultOrientation = form.querySelector(
            'input[name="requestType"][value="orientacion"]'
        );
        if (defaultOrientation) {
            defaultOrientation.checked = true;
            defaultOrientation.dispatchEvent(new Event("change", { bubbles: true }));
        }

        updateRequestCardsVisual();
        updateRequestTypeSummary();
        persistDraft();
    }

    function handleNewRequest() {
        successCard?.classList.add("is-hidden");
        form.classList.remove("is-hidden");
        handleReset();

        form.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function updateRequestTypeSummary() {
        const requestType = getSelectedRequestType();
        const meta = requestTypeMeta[requestType] || requestTypeMeta.orientacion;

        if (summaryText) {
            summaryText.textContent = meta.summary;
        }
    }

    function getSelectedRequestType() {
        return (
            form.querySelector('input[name="requestType"]:checked')?.value || "orientacion"
        );
    }

    function updateRequestCardsVisual() {
        const cards = document.querySelectorAll(".request-type-card");
        const selected = getSelectedRequestType();

        cards.forEach((card) => {
            const type = card.getAttribute("data-request-type");
            card.classList.toggle("is-active", type === selected);
        });
    }

    function buildPayload(data) {
        return {
            ...data,
            trackingCode: generateTrackingCode(),
            source: "micrositio-promart-hackathon",
            createdAt: new Date().toISOString(),
            status: "recibido",
            channelRecommendation:
                data.requestType === "reporte"
                    ? "ruta-formal"
                    : "orientacion-inicial",
        };
    }

    async function saveSubmission(payload) {
        const hasFirebase =
            typeof window.PromartFirebase !== "undefined" &&
            typeof window.PromartFirebase.saveReport === "function";

        if (!hasFirebase) {
            throw new Error("Firebase no está configurado todavía.");
        }

        return window.PromartFirebase.saveReport(payload);
    }

    function showSuccess(code, requestType, isLocalFallback = false) {
        const meta = requestTypeMeta[requestType] || requestTypeMeta.orientacion;

        if (trackingCode) {
            trackingCode.textContent = code;
        }

        if (successMessage) {
            successMessage.textContent = isLocalFallback
                ? `${meta.success} En esta versión, el registro quedó preparado en modo local de demostración.`
                : meta.success;
        }

        form.classList.add("is-hidden");
        successCard?.classList.remove("is-hidden");

        successCard?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function setSubmitState(isSubmitting) {
        if (!submitButton) return;

        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting
            ? "Enviando solicitud..."
            : "Enviar solicitud";
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

    function persistDraft() {
        try {
            const data = window.ReportValidation.collectFormData(form);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn("No se pudo guardar el borrador del formulario:", error);
        }
    }

    function hydrateDraft() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                updateRequestCardsVisual();
                return;
            }

            const draft = JSON.parse(raw);

            setInputValue("region", draft.region);
            setInputValue("area", draft.area);
            setInputValue("relationship", draft.relationship);
            setInputValue("urgency", draft.urgency);
            setInputValue("incidentDate", draft.incidentDate);
            setInputValue("description", draft.description);
            setInputValue("ongoing", draft.ongoing);
            setInputValue("evidence", draft.evidence);
            setInputValue("fullName", draft.fullName);
            setInputValue("contactEmail", draft.contactEmail);
            setInputValue("contactPhone", draft.contactPhone);

            setCheckboxValue("consentAccuracy", Boolean(draft.consentAccuracy));
            setCheckboxValue("consentPrivacy", Boolean(draft.consentPrivacy));
            setCheckboxValue("consentContact", Boolean(draft.consentContact));

            if (draft.requestType) {
                const input = form.querySelector(
                    `input[name="requestType"][value="${draft.requestType}"]`
                );
                if (input) {
                    input.checked = true;
                }
            }

            updateRequestCardsVisual();
        } catch (error) {
            console.warn("No se pudo recuperar el borrador del formulario:", error);
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn("No se pudo limpiar el borrador guardado:", error);
        }
    }

    function setInputValue(name, value) {
        const field = form.elements[name];
        if (!field || value === undefined || value === null) return;
        field.value = value;
    }

    function setCheckboxValue(name, checked) {
        const field = form.elements[name];
        if (!field) return;
        field.checked = checked;
    }
});