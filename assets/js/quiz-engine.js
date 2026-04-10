document.addEventListener("DOMContentLoaded", () => {
    const isQuizPage = document.body.classList.contains("page-escenarios");
    if (!isQuizPage) return;

    const STORAGE_KEY = "promart_quiz_state_v1";
    const ALL_REGIONS = "todas";

    const regionLabels = {
        [ALL_REGIONS]: "Todas",
        "lima-callao": "Lima y Callao",
        norte: "Norte",
        "centro-sur": "Centro y Sur",
        oriente: "Oriente",
    };

    const elements = {
        regionFilters: document.getElementById("regionFilters"),
        scenarioCard: document.getElementById("scenarioCard"),
        scenarioRegion: document.getElementById("scenarioRegion"),
        scenarioArea: document.getElementById("scenarioArea"),
        scenarioDifficulty: document.getElementById("scenarioDifficulty"),
        quizTitle: document.getElementById("quizModuleTitle"),
        scenarioContext: document.getElementById("scenarioContext"),
        scenarioSituation: document.getElementById("scenarioSituation"),
        progressLabel: document.getElementById("progressLabel"),
        progressPercent: document.getElementById("progressPercent"),
        progressBar: document.getElementById("progressBar"),
        answerOptions: document.getElementById("answerOptions"),
        optionButtons: Array.from(document.querySelectorAll(".option-button")),
        feedbackCard: document.getElementById("scenarioFeedback"),
        feedbackLabel: document.getElementById("feedbackLabel"),
        feedbackTitle: document.getElementById("feedbackTitle"),
        feedbackText: document.getElementById("feedbackText"),
        feedbackSignalsWrapper: document.getElementById("feedbackSignalsWrapper"),
        feedbackSignals: document.getElementById("feedbackSignals"),
        feedbackActionWrapper: document.getElementById("feedbackActionWrapper"),
        feedbackAction: document.getElementById("feedbackAction"),
        nextScenarioBtn: document.getElementById("nextScenarioBtn"),
        resetQuizBtn: document.getElementById("resetQuizBtn"),
        sidebarAnswered: document.getElementById("sidebarAnswered"),
        sidebarScore: document.getElementById("sidebarScore"),
        sidebarRegion: document.getElementById("sidebarRegion"),
        quizResult: document.getElementById("quizResult"),
        resultScore: document.getElementById("resultScore"),
        resultLevel: document.getElementById("resultLevel"),
        resultRegion: document.getElementById("resultRegion"),
        resultRecommendationTitle: document.getElementById("resultRecommendationTitle"),
        resultRecommendationText: document.getElementById("resultRecommendationText"),
        resultRecommendationCard: document.getElementById("resultRecommendationCard"),
        quizResultText: document.getElementById("quizResultText"),
        restartFromResultBtn: document.getElementById("restartFromResultBtn"),
        quizEmptyState: document.getElementById("quizEmptyState"),
        showAllRegionsBtn: document.getElementById("showAllRegionsBtn"),
    };

    const fallbackScenarios = [
        {
            id: "caso-01",
            region: "lima-callao",
            area: "Piso de ventas",
            difficulty: "Básico",
            title: "Comentario repetido frente a clientes",
            context:
                "En una tienda de Lima, una asesora de ventas atiende en su módulo con alto flujo de clientes.",
            situation:
                "Un compañero le dice varias veces delante de otros: “Con esa sonrisa sí vendes más” y luego agrega comentarios sobre su cuerpo. Ella se ríe por incomodidad, pero ya le pidió antes que deje de hacerlo.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. Hay comentarios no deseados sobre su apariencia y cuerpo, repetidos pese a que ya expresó incomodidad.",
            signals: [
                "Comentarios sobre el cuerpo o apariencia.",
                "Repetición de la conducta después de poner un límite.",
                "Exposición en un espacio laboral frente a otras personas.",
            ],
            actionTip:
                "Registrar fechas y contexto puede ayudar. Si la situación continúa, conviene revisar la guía y considerar orientación o reporte.",
        },
        {
            id: "caso-02",
            region: "norte",
            area: "Caja",
            difficulty: "Básico",
            title: "Invitación insistente después del turno",
            context:
                "En una tienda del norte, una colaboradora de caja termina su jornada y se prepara para salir.",
            situation:
                "Su supervisor le escribe por chat personal para invitarla a salir. Ella dice que no está interesada. Él insiste tres veces más y le dice que podría “ayudarla con sus horarios” si cambia de opinión.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. Hay insistencia no deseada y una insinuación de ventaja laboral vinculada a aceptar una salida.",
            signals: [
                "Insistencia luego de una negativa clara.",
                "Uso de una posición de poder o influencia.",
                "Sugerencia de beneficio laboral a cambio de aceptar.",
            ],
            actionTip:
                "Guardar capturas del chat y revisar la ruta de acción puede ser útil si deseas orientación o reporte.",
        },
        {
            id: "caso-03",
            region: "centro-sur",
            area: "Almacén",
            difficulty: "Intermedio",
            title: "Broma normalizada en el equipo",
            context:
                "En almacén, durante una pausa, varias personas conversan mientras ordenan mercadería.",
            situation:
                "Un trabajador hace chistes sobre la vida sexual de una compañera y el resto del equipo se ríe. Ella se queda callada y luego evita coincidir con ese grupo.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. Aunque se presente como broma, hay contenido sexual o sexista que genera incomodidad y afecta el ambiente laboral.",
            signals: [
                "Contenido sexual o íntimo no apropiado para el trabajo.",
                "Normalización por parte del grupo.",
                "Cambio de conducta de la persona afectada para evitar el espacio.",
            ],
            actionTip:
                "Si observas algo así, la guía también puede orientarte desde el rol de testigo.",
        },
        {
            id: "caso-04",
            region: "oriente",
            area: "Supervisión",
            difficulty: "Intermedio",
            title: "Acercamiento físico innecesario",
            context:
                "En un recorrido de tienda, una jefa explica tareas nuevas a una colaboradora recién incorporada.",
            situation:
                "Mientras revisan un exhibidor, un compañero se acerca demasiado, le toca la cintura para “moverla” y sonríe cuando ella se aparta. Después le dice que no sea “tan sensible”.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. Hay contacto físico no deseado, invasión del espacio personal y minimización posterior de la incomodidad.",
            signals: [
                "Contacto físico no necesario.",
                "Invasión del espacio personal.",
                "Descalificación de la incomodidad de la otra persona.",
            ],
            actionTip:
                "No necesitas esperar a que ocurra más veces para buscar orientación si la situación te incomodó.",
        },
        {
            id: "caso-05",
            region: "lima-callao",
            area: "Back office de tienda",
            difficulty: "Básico",
            title: "Corrección laboral sin contenido inapropiado",
            context:
                "En el cierre del día, un líder revisa errores en el registro de inventario con una analista.",
            situation:
                "El líder le indica que debe corregir un reporte porque tiene inconsistencias y le pide rehacerlo antes del cierre. El tono fue firme, pero no hubo comentarios personales, sexuales ni insinuaciones.",
            correctAnswer: "no",
            rationale:
                "No necesariamente constituye hostigamiento por sí solo. Puede ser una interacción laboral exigente o incómoda, pero en este caso no aparecen señales sexuales o sexistas.",
            signals: [
                "La incomodidad no siempre significa hostigamiento.",
                "Es importante distinguir exigencia laboral de conductas inapropiadas.",
            ],
            actionTip:
                "Diferenciar situaciones ayuda a identificar mejor cuándo sí hay señales que merecen atención.",
        },
        {
            id: "caso-06",
            region: "norte",
            area: "Piso de ventas",
            difficulty: "Intermedio",
            title: "Cambio de trato después de un rechazo",
            context:
                "En el área comercial, dos colaboradores trabajan en el mismo pasillo y coordinan metas diarias.",
            situation:
                "Después de que una colaboradora rechaza una invitación personal, su compañero empieza a ignorarla, deja de compartir información necesaria y hace comentarios irónicos sobre que ahora “se cree mucho”.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. El trato hostil o represalia después de un rechazo es una señal relevante.",
            signals: [
                "Represalia luego de marcar un límite.",
                "Afectación del trabajo diario.",
                "Comentarios despectivos ligados al rechazo.",
            ],
            actionTip:
                "La guía puede ayudarte a decidir si primero quieres orientación o si ya corresponde una ruta más formal.",
        },
        {
            id: "caso-07",
            region: "centro-sur",
            area: "Caja",
            difficulty: "Avanzado",
            title: "Mensaje ambiguo que genera duda",
            context:
                "Una colaboradora de caja recibe mensajes de un jefe fuera del horario laboral.",
            situation:
                "El mensaje dice: “Cuando quieras crecer acá, avísame y vemos cómo apoyarte 😉”. No hay algo explícito, pero antes él ya había hecho comentarios sobre lo “guapa” que se ve cuando usa cierto uniforme.",
            correctAnswer: "duda",
            rationale:
                "La situación reúne señales que merecen atención y no debería minimizarse. Aunque el mensaje sea ambiguo, el contexto previo cambia la lectura. Aquí la mejor respuesta es reconocer que hace falta mirar el patrón completo.",
            signals: [
                "Mensajes ambiguos con doble sentido.",
                "Contexto previo de comentarios sobre apariencia.",
                "Relación de poder que puede influir en la interpretación.",
            ],
            actionTip:
                "Cuando una situación no es totalmente clara, revisar el patrón completo y buscar orientación temprana puede ser la mejor opción.",
        },
        {
            id: "caso-08",
            region: "oriente",
            area: "Almacén",
            difficulty: "Intermedio",
            title: "Foto no solicitada en chat de trabajo",
            context:
                "Un equipo operativo comparte coordinación diaria por un grupo de mensajería.",
            situation:
                "Un trabajador envía una foto personal insinuante al chat donde también está una compañera. Luego dice que fue “sin querer”, pero mantiene comentarios sugestivos durante la semana.",
            correctAnswer: "si",
            rationale:
                "Sí puede constituir hostigamiento. Compartir contenido insinuante no solicitado en un espacio de trabajo y continuar con comentarios sugestivos es una señal clara.",
            signals: [
                "Contenido insinuante o sexual no solicitado.",
                "Uso de un canal laboral para una conducta inapropiada.",
                "Persistencia posterior de comentarios sugestivos.",
            ],
            actionTip:
                "Guardar evidencia digital puede facilitar una orientación más clara si decides avanzar.",
        },
    ];

    const state = {
        allScenarios: [],
        filteredScenarios: [],
        region: ALL_REGIONS,
        currentIndex: 0,
        score: 0,
        answeredCount: 0,
        selectedAnswer: null,
        hasAnsweredCurrent: false,
    };

    init();

    async function init() {
        hydrateStateFromStorage();
        bindEvents();

        const scenarios = await loadScenarios();
        state.allScenarios = normalizeScenarios(scenarios);

        applyRegionFilter(state.region, { preserveRegionChip: true });
    }

    function bindEvents() {
        elements.optionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (state.hasAnsweredCurrent) return;
                const selectedValue = button.getAttribute("data-answer-value");
                if (!selectedValue) return;

                handleAnswer(selectedValue);
            });
        });

        elements.nextScenarioBtn?.addEventListener("click", goToNextScenario);
        elements.resetQuizBtn?.addEventListener("click", resetQuiz);
        elements.restartFromResultBtn?.addEventListener("click", resetQuiz);

        elements.showAllRegionsBtn?.addEventListener("click", () => {
            applyRegionFilter(ALL_REGIONS);
        });

        const regionButtons = elements.regionFilters?.querySelectorAll("[data-region]");
        regionButtons?.forEach((button) => {
            button.addEventListener("click", () => {
                const region = button.getAttribute("data-region") || ALL_REGIONS;
                applyRegionFilter(region);
            });
        });
    }

    async function loadScenarios() {
        try {
            const response = await fetch("data/escenarios.json", { cache: "no-store" });
            if (!response.ok) throw new Error("No se pudo cargar escenarios.json");

            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) return data;
            if (Array.isArray(data?.scenarios) && data.scenarios.length > 0) return data.scenarios;

            return fallbackScenarios;
        } catch (error) {
            console.warn("Usando escenarios de respaldo:", error);
            return fallbackScenarios;
        }
    }

    function normalizeScenarios(items) {
        return items.map((item, index) => ({
            id: item.id || `caso-${index + 1}`,
            region: item.region || ALL_REGIONS,
            area: item.area || "Piso de ventas",
            difficulty: item.difficulty || "Básico",
            title: item.title || "Caso sin título",
            context: item.context || "",
            situation: item.situation || "",
            correctAnswer: item.correctAnswer || "duda",
            rationale: item.rationale || "",
            signals: Array.isArray(item.signals) ? item.signals : [],
            actionTip: item.actionTip || "",
        }));
    }

    function hydrateStateFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const saved = JSON.parse(raw);
            state.region = saved.region || ALL_REGIONS;
        } catch (error) {
            console.warn("No se pudo recuperar el estado del quiz:", error);
        }
    }

    function persistState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    region: state.region,
                })
            );
        } catch (error) {
            console.warn("No se pudo guardar el estado del quiz:", error);
        }
    }

    function applyRegionFilter(region, options = {}) {
        state.region = region || ALL_REGIONS;

        state.filteredScenarios =
            state.region === ALL_REGIONS
                ? [...state.allScenarios]
                : state.allScenarios.filter((scenario) => scenario.region === state.region);

        updateRegionChips(state.region, options.preserveRegionChip);
        resetRunState();
        persistState();

        if (!state.filteredScenarios.length) {
            showEmptyState();
            return;
        }

        hideEmptyState();
        renderScenario();
    }

    function updateRegionChips(region) {
        const buttons = elements.regionFilters?.querySelectorAll("[data-region]");
        buttons?.forEach((button) => {
            const buttonRegion = button.getAttribute("data-region");
            const isActive = buttonRegion === region;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function resetRunState() {
        state.currentIndex = 0;
        state.score = 0;
        state.answeredCount = 0;
        state.selectedAnswer = null;
        state.hasAnsweredCurrent = false;
        resetAnswerUI();
        hideResult();
        updateSidebar();
    }

    function resetQuiz() {
        resetRunState();

        if (!state.filteredScenarios.length) {
            showEmptyState();
            return;
        }

        hideEmptyState();
        renderScenario();
    }

    function renderScenario() {
        const scenario = state.filteredScenarios[state.currentIndex];
        if (!scenario) {
            finishQuiz();
            return;
        }

        showScenarioCard();
        hideResult();
        hideEmptyState();
        resetAnswerUI();

        elements.scenarioRegion.textContent = `Región: ${getRegionLabel(scenario.region)}`;
        elements.scenarioArea.textContent = `Área: ${scenario.area}`;
        elements.scenarioDifficulty.textContent = `Nivel: ${scenario.difficulty}`;
        elements.quizTitle.textContent = scenario.title;
        elements.scenarioContext.textContent = scenario.context;
        elements.scenarioSituation.textContent = scenario.situation;

        updateProgress();
        updateSidebar();
    }

    function handleAnswer(selectedValue) {
        const scenario = state.filteredScenarios[state.currentIndex];
        if (!scenario) return;

        state.selectedAnswer = selectedValue;
        state.hasAnsweredCurrent = true;
        state.answeredCount += 1;

        const isCorrect = selectedValue === scenario.correctAnswer;
        if (isCorrect) {
            state.score += 1;
        }

        paintAnswerButtons(selectedValue, scenario.correctAnswer);
        renderFeedback(scenario, selectedValue, isCorrect);

        elements.nextScenarioBtn.disabled = false;
        updateSidebar();
    }

    function paintAnswerButtons(selectedValue, correctValue) {
        elements.optionButtons.forEach((button) => {
            const value = button.getAttribute("data-answer-value");
            button.disabled = true;
            button.classList.remove("is-selected", "is-correct", "is-incorrect");

            if (value === selectedValue) {
                button.classList.add("is-selected");
            }

            if (value === correctValue) {
                button.classList.add("is-correct");
            } else if (value === selectedValue && selectedValue !== correctValue) {
                button.classList.add("is-incorrect");
            }
        });
    }

    function renderFeedback(scenario, selectedValue, isCorrect) {
        const feedbackVariant =
            selectedValue === "duda"
                ? "feedback-card feedback-card--warning"
                : isCorrect
                    ? "feedback-card feedback-card--correct"
                    : "feedback-card feedback-card--error";

        elements.feedbackCard.className = feedbackVariant;
        elements.feedbackCard.classList.remove("is-hidden");

        elements.feedbackLabel.textContent = getFeedbackLabel(selectedValue, isCorrect);
        elements.feedbackTitle.textContent = getFeedbackTitle(selectedValue, isCorrect, scenario.correctAnswer);
        elements.feedbackText.textContent = scenario.rationale || "Revisa las señales del caso y continúa con el siguiente escenario.";

        if (Array.isArray(scenario.signals) && scenario.signals.length > 0) {
            elements.feedbackSignalsWrapper.classList.remove("is-hidden");
            elements.feedbackSignals.innerHTML = scenario.signals
                .map((signal) => `<li>${escapeHtml(signal)}</li>`)
                .join("");
        } else {
            elements.feedbackSignalsWrapper.classList.add("is-hidden");
            elements.feedbackSignals.innerHTML = "";
        }

        if (scenario.actionTip) {
            elements.feedbackActionWrapper.classList.remove("is-hidden");
            elements.feedbackAction.textContent = scenario.actionTip;
        } else {
            elements.feedbackActionWrapper.classList.add("is-hidden");
            elements.feedbackAction.textContent = "";
        }
    }

    function goToNextScenario() {
        if (!state.hasAnsweredCurrent) return;

        state.currentIndex += 1;
        state.selectedAnswer = null;
        state.hasAnsweredCurrent = false;

        if (state.currentIndex >= state.filteredScenarios.length) {
            finishQuiz();
            return;
        }

        renderScenario();
        scrollToScenarioCard();
    }

    function finishQuiz() {
        hideScenarioCard();
        hideEmptyState();
        renderResult();
        showResult();
        updateSidebar();
        scrollToResult();
    }

    function renderResult() {
        const total = state.filteredScenarios.length || 0;
        const scoreRatio = total ? state.score / total : 0;
        const level = getLevelByScore(scoreRatio);
        const recommendation = getRecommendationByScore(scoreRatio);

        elements.resultScore.textContent = `${state.score}/${total}`;
        elements.resultLevel.textContent = level.label;
        elements.resultRegion.textContent = getRegionLabel(state.region);
        elements.quizResultText.textContent =
            "Terminaste este recorrido. Tu resultado no es un diagnóstico personal: es una forma rápida de medir qué tan fácil o difícil resulta reconocer señales en contextos cotidianos.";
        elements.resultRecommendationTitle.textContent = recommendation.title;
        elements.resultRecommendationText.textContent = recommendation.text;

        elements.resultRecommendationCard.className = `feedback-card ${recommendation.variant}`;
    }

    function updateProgress() {
        const total = state.filteredScenarios.length || 0;
        const current = total ? state.currentIndex + 1 : 0;
        const percent = total ? Math.round((state.currentIndex / total) * 100) : 0;

        elements.progressLabel.textContent = `Caso ${current} de ${total}`;
        elements.progressPercent.textContent = `${percent}%`;
        elements.progressBar.style.width = `${percent}%`;

        const progressRoot = elements.progressBar.closest(".progress");
        progressRoot?.setAttribute("aria-valuenow", String(percent));
    }

    function updateSidebar() {
        const total = state.filteredScenarios.length || 0;
        elements.sidebarAnswered.textContent = `${Math.min(state.answeredCount, total)} de ${total}`;
        elements.sidebarScore.textContent = String(state.score);
        elements.sidebarRegion.textContent = getRegionLabel(state.region);
    }

    function resetAnswerUI() {
        state.selectedAnswer = null;
        state.hasAnsweredCurrent = false;

        elements.optionButtons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("is-selected", "is-correct", "is-incorrect");
        });

        elements.feedbackCard.className = "feedback-card mt-4 is-hidden";
        elements.feedbackLabel.textContent = "Resultado";
        elements.feedbackTitle.textContent = "Aquí verás la explicación";
        elements.feedbackText.textContent =
            "Después de responder, aparecerá aquí una explicación simple y útil.";
        elements.feedbackSignalsWrapper.classList.add("is-hidden");
        elements.feedbackSignals.innerHTML = "";
        elements.feedbackActionWrapper.classList.add("is-hidden");
        elements.feedbackAction.textContent = "";
        elements.nextScenarioBtn.disabled = true;
    }

    function showEmptyState() {
        hideScenarioCard();
        hideResult();
        elements.quizEmptyState.classList.remove("is-hidden");
        updateSidebar();
    }

    function hideEmptyState() {
        elements.quizEmptyState.classList.add("is-hidden");
    }

    function showScenarioCard() {
        elements.scenarioCard.classList.remove("is-hidden");
    }

    function hideScenarioCard() {
        elements.scenarioCard.classList.add("is-hidden");
    }

    function showResult() {
        elements.quizResult.classList.remove("is-hidden");
    }

    function hideResult() {
        elements.quizResult.classList.add("is-hidden");
    }

    function getRegionLabel(region) {
        return regionLabels[region] || "Todas";
    }

    function getFeedbackLabel(selectedValue, isCorrect) {
        if (selectedValue === "duda") return "Lectura cuidadosa";
        return isCorrect ? "Respuesta alineada" : "Oportunidad de aprendizaje";
    }

    function getFeedbackTitle(selectedValue, isCorrect, correctAnswer) {
        if (selectedValue === "duda") {
            return "Tu duda también es una señal útil";
        }

        if (isCorrect) {
            return "Vas identificando bien las señales";
        }

        if (correctAnswer === "si") {
            return "Aquí sí hay señales que merecen atención";
        }

        if (correctAnswer === "no") {
            return "Aquí conviene diferenciar incomodidad de hostigamiento";
        }

        return "Este caso necesita mirar el contexto completo";
    }

    function getLevelByScore(ratio) {
        if (ratio >= 0.85) {
            return { label: "Claro" };
        }
        if (ratio >= 0.5) {
            return { label: "En proceso" };
        }
        return { label: "Atención" };
    }

    function getRecommendationByScore(ratio) {
        if (ratio >= 0.85) {
            return {
                title: "Tienes buena claridad para reconocer señales",
                text:
                    "Identificas varios patrones relevantes. El mejor siguiente paso es revisar la guía para convertir ese reconocimiento en una ruta de acción concreta.",
                variant: "feedback-card--correct",
            };
        }

        if (ratio >= 0.5) {
            return {
                title: "Ya detectas varias señales, pero algunas aún pueden confundirse",
                text:
                    "La guía te ayudará a traducir mejor la duda en decisiones prácticas, especialmente cuando el contexto es ambiguo o hay una relación de poder.",
                variant: "feedback-card--warning",
            };
        }

        return {
            title: "Hay señales que todavía pueden pasar desapercibidas",
            text:
                "No pasa nada. Justamente este micrositio existe para eso. Te conviene continuar con la guía y revisar cómo actuar si algo similar te ocurre o lo observas.",
            variant: "feedback-card--error",
        };
    }

    function scrollToScenarioCard() {
        elements.scenarioCard.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function scrollToResult() {
        elements.quizResult.scrollIntoView({
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