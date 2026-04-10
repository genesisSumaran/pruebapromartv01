document.addEventListener("DOMContentLoaded", () => {
    const isGuidePage = document.body.classList.contains("page-guia");
    if (!isGuidePage) return;

    const STORAGE_KEY = "promart_guide_state_v1";

    const steps = [
        {
            key: "who",
            label: "Paso 1",
            title: "¿A quién le pasó?",
            text: "Elige la opción que mejor describa tu situación actual.",
            options: [
                { value: "me-paso", label: "Me pasó a mí" },
                { value: "lo-vi", label: "Lo vi o fui testigo" },
                { value: "me-lo-contaron", label: "Me lo contó otra persona" },
            ],
        },
        {
            key: "status",
            label: "Paso 2",
            title: "¿La situación sigue ocurriendo?",
            text: "Esto nos ayuda a priorizar el tipo de orientación que podrías necesitar.",
            options: [
                { value: "si", label: "Sí, sigue ocurriendo" },
                { value: "no", label: "No, ya pasó" },
                { value: "no-se", label: "No estoy segura(o)" },
            ],
        },
        {
            key: "need",
            label: "Paso 3",
            title: "¿Qué necesitas ahora?",
            text: "No tienes que decidirlo todo hoy. Marca la opción que más se acerque a lo que buscas.",
            options: [
                { value: "orientacion", label: "Quiero orientación" },
                { value: "reporte", label: "Quiero reportar" },
                { value: "entender", label: "Solo quiero entender mis opciones" },
            ],
        },
        {
            key: "risk",
            label: "Paso 4",
            title: "¿Hay riesgo inmediato o exposición continua?",
            text: "Piensa si la situación puede repetirse pronto o si afecta tu seguridad, bienestar o trabajo diario.",
            options: [
                { value: "si", label: "Sí, hay riesgo o sigue muy presente" },
                { value: "no", label: "No, no hay riesgo inmediato" },
            ],
        },
    ];

    const elements = {
        stepperItems: Array.from(document.querySelectorAll(".guide-stepper__item")),
        stepLabel: document.getElementById("guideStepLabel"),
        questionTitle: document.getElementById("guideTitle"),
        questionText: document.getElementById("guideQuestionText"),
        optionsContainer: document.getElementById("guideOptions"),
        backBtn: document.getElementById("guideBackBtn"),
        nextBtn: document.getElementById("guideNextBtn"),
        questionCard: document.getElementById("guideQuestionCard"),
        resultCard: document.getElementById("guideResultCard"),
        resultTitle: document.getElementById("guideResultTitle"),
        resultSummary: document.getElementById("guideResultSummary"),
        actionsList: document.getElementById("guideActionsList"),
        rightsList: document.getElementById("guideRightsList"),
        channelText: document.getElementById("guideChannelText"),
        restartBtn: document.getElementById("guideRestartBtn"),
    };

    const state = {
        currentStep: 0,
        answers: {
            who: null,
            status: null,
            need: null,
            risk: null,
        },
    };

    init();

    function init() {
        hydrateState();
        bindEvents();

        if (isGuideComplete()) {
            renderResult();
            showResult();
        } else {
            renderCurrentStep();
            showQuestionCard();
        }
    }

    function bindEvents() {
        elements.backBtn?.addEventListener("click", handleBack);
        elements.nextBtn?.addEventListener("click", handleNext);
        elements.restartBtn?.addEventListener("click", restartGuide);
    }

    function hydrateState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const saved = JSON.parse(raw);

            state.currentStep =
                Number.isInteger(saved.currentStep) && saved.currentStep >= 0
                    ? Math.min(saved.currentStep, steps.length - 1)
                    : 0;

            state.answers = {
                who: saved.answers?.who || null,
                status: saved.answers?.status || null,
                need: saved.answers?.need || null,
                risk: saved.answers?.risk || null,
            };
        } catch (error) {
            console.warn("No se pudo recuperar el estado de la guía:", error);
        }
    }

    function persistState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    currentStep: state.currentStep,
                    answers: state.answers,
                })
            );
        } catch (error) {
            console.warn("No se pudo guardar el estado de la guía:", error);
        }
    }

    function renderCurrentStep() {
        const step = steps[state.currentStep];
        if (!step) return;

        updateStepper();
        elements.stepLabel.textContent = step.label;
        elements.questionTitle.textContent = step.title;
        elements.questionText.textContent = step.text;

        elements.optionsContainer.innerHTML = step.options
            .map((option) => {
                const isSelected = state.answers[step.key] === option.value;
                return `
          <button
            type="button"
            class="option-button ${isSelected ? "is-selected" : ""}"
            data-guide-option="${escapeHtml(option.value)}"
            aria-pressed="${isSelected ? "true" : "false"}"
          >
            ${escapeHtml(option.label)}
          </button>
        `;
            })
            .join("");

        bindOptionEvents(step.key);
        updateNavigation();
        persistState();
    }

    function bindOptionEvents(stepKey) {
        const optionButtons = elements.optionsContainer.querySelectorAll("[data-guide-option]");

        optionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const value = button.getAttribute("data-guide-option");
                if (!value) return;

                state.answers[stepKey] = value;

                optionButtons.forEach((item) => {
                    item.classList.remove("is-selected");
                    item.setAttribute("aria-pressed", "false");
                });

                button.classList.add("is-selected");
                button.setAttribute("aria-pressed", "true");

                updateNavigation();
                persistState();
            });
        });
    }

    function updateStepper() {
        elements.stepperItems.forEach((item, index) => {
            item.classList.toggle("is-active", index === state.currentStep);
        });
    }

    function updateNavigation() {
        const currentKey = steps[state.currentStep]?.key;
        const hasAnswer = currentKey ? Boolean(state.answers[currentKey]) : false;

        elements.backBtn.disabled = state.currentStep === 0;
        elements.nextBtn.disabled = !hasAnswer;
        elements.nextBtn.textContent =
            state.currentStep === steps.length - 1 ? "Ver orientación" : "Siguiente";
    }

    function handleBack() {
        if (state.currentStep === 0) return;

        state.currentStep -= 1;
        renderCurrentStep();
        showQuestionCard();
        scrollToQuestionCard();
    }

    function handleNext() {
        const currentKey = steps[state.currentStep]?.key;
        if (!currentKey || !state.answers[currentKey]) return;

        if (state.currentStep === steps.length - 1) {
            renderResult();
            showResult();
            persistState();
            scrollToResult();
            return;
        }

        state.currentStep += 1;
        renderCurrentStep();
        showQuestionCard();
        scrollToQuestionCard();
    }

    function renderResult() {
        const route = getRouteRecommendation(state.answers);

        elements.resultTitle.textContent = route.title;
        elements.resultSummary.textContent = route.summary;
        elements.channelText.textContent = route.channel;

        elements.actionsList.innerHTML = route.actions
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");

        elements.rightsList.innerHTML = route.rights
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");
    }

    function getRouteRecommendation(answers) {
        const { who, status, need, risk } = answers;

        const commonRights = [
            "No necesitas esperar a que pase otra vez para buscar orientación.",
            "Tu incomodidad importa, incluso si todavía no sabes cómo nombrar lo ocurrido.",
            "La confidencialidad y el trato respetuoso deben ser parte del proceso.",
        ];

        const witnessRights = [
            "Ser testigo también importa. Observar una situación puede justificar una búsqueda de orientación.",
            "Puedes registrar hechos concretos sin exagerar ni reinterpretar lo ocurrido.",
            "No necesitas resolver la situación sola(o) antes de buscar ayuda.",
        ];

        if (who === "me-paso" && need === "reporte" && risk === "si") {
            return {
                title: "Conviene priorizar una ruta de acción formal",
                summary:
                    "Por tus respuestas, parece importante no postergar la acción. La situación sigue presente o hay riesgo inmediato, y tú ya identificas la necesidad de reportar.",
                actions: [
                    "Busca una vía segura para salir del contexto inmediato si te sientes expuesta(o).",
                    "Anota hechos, fechas, lugares y cualquier patrón que recuerdes con claridad.",
                    "Guarda mensajes, capturas o cualquier evidencia digital si existe.",
                    "Inicia la ruta de orientación o reporte para no cargar esto sola(o).",
                ],
                rights: [
                    ...commonRights,
                    "Puedes pedir apoyo sin tener que presentar una narración perfecta desde el inicio.",
                ],
                channel:
                    "Canal sugerido: iniciar orientación o reporte desde la ruta formal de la empresa lo antes posible.",
            };
        }

        if (who === "me-paso" && need === "orientacion") {
            return {
                title: "Empezar por orientación es una buena decisión",
                summary:
                    "No necesitas definirlo todo ahora. Buscar orientación primero puede ayudarte a entender mejor tus opciones, ordenar lo ocurrido y decidir con más claridad.",
                actions: [
                    "Escribe un resumen simple de lo que pasó, aunque sea breve.",
                    "Identifica si hubo mensajes, testigos o momentos repetidos.",
                    "Piensa qué necesitas hoy: información, acompañamiento o una ruta formal.",
                    "Continúa a orientación si quieres apoyo sin pasar todavía a un reporte completo.",
                ],
                rights: commonRights,
                channel:
                    "Canal sugerido: orientación inicial, con posibilidad de derivarte luego a una ruta formal si lo decides.",
            };
        }

        if (who === "me-paso" && need === "entender") {
            return {
                title: "Tu siguiente paso es aclarar el panorama",
                summary:
                    "Todavía estás en una etapa de comprensión, y eso es válido. Antes de decidir si reportas, puede ayudarte revisar tus opciones y reconocer mejor el patrón de la situación.",
                actions: [
                    "Ordena lo ocurrido en secuencia: qué pasó, cuándo, dónde y quién estuvo presente.",
                    "Distingue si fue un hecho aislado o parte de una conducta repetida.",
                    "Revisa la guía y los recursos para entender señales y rutas disponibles.",
                    "Busca orientación si la duda te está frenando o te genera ansiedad.",
                ],
                rights: commonRights,
                channel:
                    "Canal sugerido: revisión de opciones y orientación inicial antes de decidir si quieres reportar.",
            };
        }

        if (who === "lo-vi" && risk === "si") {
            return {
                title: "Como testigo, tu rol puede ser importante",
                summary:
                    "Cuando hay riesgo o continuidad, mirar hacia otro lado puede aumentar la vulnerabilidad de la persona afectada. No necesitas invadir, pero sí actuar con criterio.",
                actions: [
                    "Registra hechos observables: qué viste, cuándo y en qué contexto.",
                    "Evita confrontaciones impulsivas si eso puede aumentar el riesgo.",
                    "Si puedes hacerlo de forma segura, ofrece apoyo respetuoso a la persona afectada.",
                    "Busca orientación sobre la ruta más adecuada para reportar o acompañar.",
                ],
                rights: witnessRights,
                channel:
                    "Canal sugerido: orientación o reporte desde el rol de testigo, especialmente si la situación sigue ocurriendo.",
            };
        }

        if (who === "lo-vi" || who === "me-lo-contaron") {
            return {
                title: "Primero conviene orientar y ordenar la información",
                summary:
                    "Cuando no te pasó directamente, es útil actuar con cuidado, sin minimizar ni exagerar. La prioridad es apoyar de forma respetuosa y entender la mejor vía de ayuda.",
                actions: [
                    "Diferencia lo que viste directamente de lo que te contaron.",
                    "Evita difundir la situación entre más personas de las necesarias.",
                    "Sugiere una ruta de orientación a quien lo vivió, si eso es apropiado.",
                    "Busca guía si tienes dudas sobre cómo acompañar o derivar.",
                ],
                rights: witnessRights,
                channel:
                    "Canal sugerido: orientación inicial para acompañamiento responsable y eventual derivación.",
            };
        }

        if (status === "si" || risk === "si") {
            return {
                title: "No conviene dejarlo en pausa",
                summary:
                    "Tus respuestas muestran que la situación puede seguir presente. Aunque todavía no definas una ruta formal, sí conviene moverte hacia una orientación concreta.",
                actions: [
                    "No normalices la continuidad de la situación.",
                    "Registra lo esencial mientras lo recuerdas con claridad.",
                    "Busca una vía de orientación hoy, no solo cuando empeore.",
                    "Si hay temor o exposición constante, prioriza apoyo temprano.",
                ],
                rights: [
                    ...commonRights,
                    "Puedes pedir ayuda aunque aún no tengas todas las pruebas ordenadas.",
                ],
                channel:
                    "Canal sugerido: orientación inmediata, con posibilidad de escalar a reporte según el caso.",
            };
        }

        return {
            title: "Tu mejor siguiente paso es orientación clara y sin presión",
            summary:
                "No todo se resuelve de una sola vez. Con tus respuestas, lo más útil parece ser una orientación inicial que te ayude a decidir con calma y con más información.",
            actions: [
                "Resume lo ocurrido con tus propias palabras.",
                "Identifica si hubo repetición, presión, insinuaciones o represalias.",
                "Revisa los recursos si todavía sientes que te faltan elementos.",
                "Avanza a orientación si necesitas apoyo más personalizado.",
            ],
            rights: commonRights,
            channel:
                "Canal sugerido: orientación inicial y revisión de recursos antes de decidir una acción mayor.",
        };
    }

    function showQuestionCard() {
        elements.questionCard.classList.remove("is-hidden");
        elements.resultCard.classList.add("is-hidden");
    }

    function showResult() {
        elements.questionCard.classList.add("is-hidden");
        elements.resultCard.classList.remove("is-hidden");
    }

    function restartGuide() {
        state.currentStep = 0;
        state.answers = {
            who: null,
            status: null,
            need: null,
            risk: null,
        };

        persistState();
        renderCurrentStep();
        showQuestionCard();
        scrollToQuestionCard();
    }

    function isGuideComplete() {
        return steps.every((step) => Boolean(state.answers[step.key]));
    }

    function scrollToQuestionCard() {
        elements.questionCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function scrollToResult() {
        elements.resultCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function escapeHtml(value) {
        const span = document.createElement("span");
        span.textContent = String(value ?? "");
        return span.innerHTML;
    }
});