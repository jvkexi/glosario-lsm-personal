// ========================================
// DATOS
// ========================================

const categories = [
    {
        id: 1,
        name: "Alimentos",
        icon: "🍎"
    },
    {
        id: 2,
        name: "Colores",
        icon: "🎨"
    },
    {
        id: 3,
        name: "Saludos",
        icon: "👋"
    },
    {
        id: 4,
        name: "Bebidas",
        icon: "🥤"
    }
];


const signs = [
    {
        id: 1,
        name: "Manzana",
        categoryId: 1
    },
    {
        id: 2,
        name: "Pan",
        categoryId: 1
    },
    {
        id: 3,
        name: "Azul",
        categoryId: 2
    },
    {
        id: 4,
        name: "Verde",
        categoryId: 2
    },
    {
        id: 5,
        name: "Hola",
        categoryId: 3
    },
    {
        id: 6,
        name: "Adiós",
        categoryId: 3
    }
];


// ========================================
// BASE DE DATOS DE EMOJIS
// ========================================

let emojiDatabase = {};
let emojiAliases = {};

// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://zyfuzjscnpdqqzsbojwq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_9rSbng-6BIoAIp616QM0yQ_6QO22z4V";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


async function testSupabaseConnection() {

    const {
        data,
        error
    } = await supabaseClient
        .from("categories")
        .select("*");

    if (error) {

        console.error(
            "Error conectando con Supabase:",
            error
        );

        return;
    }

    console.log(
        "Conexión con Supabase correcta:",
        data
    );

}

// ========================================
// PROBAR SEÑAS EN SUPABASE
// ========================================

async function testSignsConnection() {

    const {
        data,
        error
    } = await supabaseClient
        .from("signs")
        .select("*");

    if (error) {

        console.error(
            "Error obteniendo las señas de Supabase:",
            error
        );

        return;
    }

    console.log(
        "Señas de Supabase:",
        data
    );

}


// ========================================
// NORMALIZAR TEXTO
// ========================================

function normalizeText(text) {

    if (
        typeof text !== "string"
    ) {

        return "";
    }


    return text
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}


// ========================================
// ALMACENAMIENTO LOCAL
// ========================================

const SIGNS_STORAGE_KEY =
    "glosarioLSM_signs";

const CATEGORIES_STORAGE_KEY =
    "glosarioLSM_categories";


// ========================================
// GUARDAR DATOS
// ========================================

function saveData() {

    localStorage.setItem(
        SIGNS_STORAGE_KEY,
        JSON.stringify(signs)
    );


    localStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(categories)
    );

}


// ========================================
// CARGAR DATOS
// ========================================

function loadData() {

    const savedSigns =
        localStorage.getItem(
            SIGNS_STORAGE_KEY
        );


    const savedCategories =
        localStorage.getItem(
            CATEGORIES_STORAGE_KEY
        );


    if (savedSigns) {

        try {

            const parsedSigns =
                JSON.parse(
                    savedSigns
                );


            if (
                Array.isArray(
                    parsedSigns
                )
            ) {

                signs.length = 0;

                signs.push(
                    ...parsedSigns
                );

            }

        } catch (error) {

            console.error(
                "Error al cargar las señas:",
                error
            );

        }

    }


    if (savedCategories) {

        try {

            const parsedCategories =
                JSON.parse(
                    savedCategories
                );


            if (
                Array.isArray(
                    parsedCategories
                )
            ) {

                categories.length = 0;

                categories.push(
                    ...parsedCategories
                );

            }

        } catch (error) {

            console.error(
                "Error al cargar las categorías:",
                error
            );

        }

    }

}



// ========================================
// CARGAR BASE DE DATOS DE UNICODE
// ========================================

async function loadEmojiDatabase() {

    try {

        // ========================================
        // CARGAR BASE DE DATOS DE UNICODE
        // ========================================

        const emojiResponse =
            await fetch(
                "./data/annotations.json"
            );


        if (!emojiResponse.ok) {

            throw new Error(
                "No se pudo cargar annotations.json"
            );

        }


        const emojiData =
            await emojiResponse.json();


        emojiDatabase =
            emojiData.annotations.annotations;


        // ========================================
        // CARGAR EQUIVALENCIAS PROPIAS
        // ========================================

        const aliasResponse =
            await fetch(
                "./data/emoji-aliases.json"
            );


        if (!aliasResponse.ok) {

            throw new Error(
                "No se pudo cargar emoji-aliases.json"
            );

        }


        emojiAliases =
            await aliasResponse.json();


        // ========================================
        // CONFIRMAR CARGA
        // ========================================

        console.log(
            "Base de emojis cargada:",
            emojiDatabase
        );


        console.log(
            "Equivalencias propias cargadas:",
            emojiAliases
        );


    } catch (error) {

        console.error(
            "Error al cargar la base de emojis:",
            error
        );

    }
}


// ========================================
// BUSCAR EMOJI AUTOMÁTICAMENTE
// ========================================

function findEmoji(signName) {

    const normalizedSignName =
        normalizeText(
            signName
        );


    // ========================================
    // 1. BUSCAR EN EQUIVALENCIAS PROPIAS
    // ========================================

    if (
        emojiAliases &&
        typeof emojiAliases === "object"
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                emojiAliases,
                normalizedSignName
            )
        ) {

            return emojiAliases[
                normalizedSignName
            ];

        }

    }


    // ========================================
    // COMPROBAR BASE DE DATOS DE UNICODE
    // ========================================

    if (
        !emojiDatabase ||
        Object.keys(
            emojiDatabase
        ).length === 0
    ) {

        return null;

    }


    // ========================================
    // 2. BUSCAR POR NOMBRE CORTO (tts)
    // ========================================

    for (
        const emoji in emojiDatabase
    ) {

        const annotation =
            emojiDatabase[
                emoji
            ];


        if (
            !annotation
        ) {

            continue;

        }


        // CLDR puede guardar tts como
        // arreglo o como texto

        let ttsValues = [];


        if (
            Array.isArray(
                annotation.tts
            )
        ) {

            ttsValues =
                annotation.tts;

        } else if (
            typeof annotation.tts ===
            "string"
        ) {

            ttsValues = [
                annotation.tts
            ];

        }


        for (
            const tts of
            ttsValues
        ) {

            if (
                typeof tts !==
                "string"
            ) {

                continue;

            }


            if (
                normalizeText(
                    tts
                ) ===
                normalizedSignName
            ) {

                return emoji;

            }

        }

    }


    // ========================================
    // 3. BUSCAR POR PALABRA CLAVE
    // ========================================

    for (
        const emoji in emojiDatabase
    ) {

        const annotation =
            emojiDatabase[
                emoji
            ];


        if (
            !annotation ||
            !Array.isArray(
                annotation.default
            )
        ) {

            continue;

        }


        for (
            const keyword of
            annotation.default
        ) {

            if (
                typeof keyword !==
                "string"
            ) {

                continue;

            }


            if (
                normalizeText(
                    keyword
                ) ===
                normalizedSignName
            ) {

                return emoji;

            }

        }

    }


    // ========================================
    // 4. NO SE ENCONTRÓ UN EMOJI
    // ========================================

    return null;

}

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const mainHeader =
    document.getElementById("mainHeader");

const homeDashboard =
    document.querySelector(".home-dashboard");

const exploreView =
    document.getElementById("exploreView");

const categoriesView =
    document.getElementById("categoriesView");

const openCategories =
    document.getElementById("openCategories");

const backFromCategories =
    document.getElementById("backFromCategories");

const signTypesView =
    document.getElementById("signTypesView");

const openSignTypes =
    document.getElementById("openSignTypes");

const backFromSignTypes =
    document.getElementById("backFromSignTypes");

const grammarView =
    document.getElementById("grammarView");

const openGrammar =
    document.getElementById("openGrammar");

const backFromGrammar =
    document.getElementById("backFromGrammar");

const featureInfoView =
    document.getElementById("featureInfoView");

const openCharacteristics =
    document.getElementById("openCharacteristics");

const featureInfoTitle =
    document.getElementById("featureInfoTitle");

const featureInfoContent =
    document.getElementById("featureInfoContent");

const backFromFeature =
    document.getElementById("backFromFeature");

const navHome =
    document.getElementById("navHome");

const navExplore =
    document.getElementById("navExplore");

const searchSuggestions =
    document.getElementById("searchSuggestions");

const searchSection =
    document.querySelector(".search-section");

const categoriesSection =
    document.querySelector(".categories-section");

const dictionarySection =
    document.querySelector(".dictionary-section");

const categoriesContainer =
    document.getElementById("categoriesContainer");

const searchInput =
    document.getElementById("searchInput");


// ========================================
// VISTA DE CATEGORÍA
// ========================================

const categoryView =
    document.getElementById("categoryView");

const categoryTitle =
    document.getElementById("categoryTitle");

const categorySignsContainer =
    document.getElementById("categorySignsContainer");

const backFromCategory =
    document.getElementById("backFromCategory");


// ========================================
// VISTA DEL DICCIONARIO
// ========================================

const dictionaryView =
    document.getElementById("dictionaryView");

const openDictionary =
    document.getElementById("openDictionary");

const backFromDictionary =
    document.getElementById("backFromDictionary");

const dictionaryContainer =
    document.getElementById("dictionaryContainer");

const dictionarySearch =
    document.getElementById("dictionarySearch");

const dictionaryCount =
    document.getElementById("dictionaryCount");


// ========================================
// VISTA INDIVIDUAL DE SEÑA
// ========================================

const signDetailView =
    document.getElementById("signDetailView");

    const editSignButton =
    document.getElementById("editSignButton");

const deleteSignButton =
    document.getElementById("deleteSignButton");

const backFromSignDetail =
    document.getElementById("backFromSignDetail");


const signDetailCategory =
    document.getElementById("signDetailCategory");

const signDetailTitle =
    document.getElementById("signDetailTitle");

const signDetailImage =
    document.getElementById("signDetailImage");

const signDetailManualConfiguration =
    document.getElementById(
        "signDetailManualConfiguration"
    );

const signDetailOrientation =
    document.getElementById(
        "signDetailOrientation"
    );

const signDetailHandDetails =
    document.getElementById("signDetailHandDetails");

const signDetailLocation =
    document.getElementById(
        "signDetailLocation"
    );

const signDetailMovement =
    document.getElementById(
        "signDetailMovement"
    );

const signDetailNonManualFeatures =
    document.getElementById(
        "signDetailNonManualFeatures"
    );

    const signDetailMeaning =
    document.getElementById("signDetailMeaning");


// ========================================
// CONTROL DE NAVEGACIÓN
// ========================================

// Guarda desde dónde se abrió la seña.
//
// Puede ser:
// "category"
// "dictionary"

let previousSignView = "category";
let previousCategoryId = null;

// Seña que actualmente se está editando
let editingSignId = null;


// ========================================
// MODAL
// ========================================

const signModal =
    document.getElementById("signModal");

const openAddModal =
    document.getElementById("openAddModal");

const closeAddModal =
    document.getElementById("closeAddModal");

const cancelAdd =
    document.getElementById("cancelAdd");

const closeModalOverlay =
    document.getElementById("closeModalOverlay");

const signForm =
    document.getElementById("signForm");

const signName =
    document.getElementById("signName");

const signCategory =
    document.getElementById("signCategory");

const signMeaning =
    document.getElementById("signMeaning");

const signType =
    document.getElementById("signType");

signType.addEventListener(
    "change",
    () => {

        signTypeOptions.innerHTML = "";

        if (signType.value === "manual") {

    signTypeOptions.innerHTML = `

        <div class="form-group">

            <label for="referentRelation">
                Relación con el referente
            </label>

            <select id="referentRelation">

                <option value="">
                    Selecciona una característica
                </option>

                <option value="inicializada">Inicializada</option>
                <option value="lexicografica">Lexicográfica</option>
                <option value="iconica">Icónica</option>
                <option value="natural">Natural</option>
                <option value="arbitraria">Arbitraria</option>

            </select>

        </div>

        <div class="form-group">

            <label for="manualConfiguration">
                Configuración manual
            </label>

            <textarea
                id="manualConfiguration"
                placeholder="Describe la configuración de la mano..."
            ></textarea>

        </div>

        <div id="manualOrientationSelector"></div>

        <!-- ========================================
     UBICACIÓN
======================================== -->

<div id="manualLocationSelector"></div>


<!-- ========================================
     MOVIMIENTO
======================================== -->

<!-- MOVIMIENTO -->

<div class="form-group">
    <h3>Movimiento</h3>
</div>

<div id="manualMovementOrigin"></div>

<div id="manualMovementDestination"></div>

        <div class="form-group">

            <label for="nonManualFeatures">
                Rasgos no manuales
            </label>

            <textarea
                id="nonManualFeatures"
                placeholder="Describe las expresiones faciales o movimientos corporales..."
            ></textarea>

        </div>

    `;

    createOrientationSelector(
        document.getElementById("manualOrientationSelector"),
        "manualOrientation"
    );

    createLocationSelector(
    document.getElementById("manualLocationSelector"),
    "manualLocation"
);

createMovementSelector(
    document.getElementById("manualMovementOrigin"),
    "manualMovementOriginValue",
    "Punto de origen"
);

createMovementSelector(
    document.getElementById("manualMovementDestination"),
    "manualMovementDestinationValue",
    "Punto de destino"
);

}


if (signType.value === "bimanual") {

    signTypeOptions.innerHTML = `

        <div class="form-group">

            <label for="bimanualType">
                Tipo de seña bimanual
            </label>

            <select id="bimanualType">

                <option value="">
                    Selecciona una opción
                </option>

                <option value="simetrica">Simétrica</option>
                <option value="asimetrica">Asimétrica</option>

            </select>

        </div>

        <div id="bimanualOptions"></div>

    `;

    const bimanualType =
        document.getElementById("bimanualType");

    const bimanualOptions =
        document.getElementById("bimanualOptions");

    bimanualType.addEventListener("change", () => {

        bimanualOptions.innerHTML = "";

        if (bimanualType.value === "simetrica") {

            bimanualOptions.innerHTML = `

                <div class="form-group">

                    <label for="bimanualReferentRelation">
                        Relación con el referente
                    </label>

                    <select id="bimanualReferentRelation">

                        <option value="">Selecciona una característica</option>
                        <option value="inicializada">Inicializada</option>
                        <option value="lexicografica">Lexicográfica</option>
                        <option value="iconica">Icónica</option>
                        <option value="natural">Natural</option>
                        <option value="arbitraria">Arbitraria</option>

                    </select>

                </div>

                <div class="form-group">

                    <label for="symmetricConfiguration">
                        Configuración manual
                    </label>

                    <textarea
                        id="symmetricConfiguration"
                        placeholder="Describe la configuración de ambas manos..."
                    ></textarea>

                </div>

                <div id="symmetricOrientationSelector"></div>

                <div id="symmetricLocationSelector"></div>

                <!-- MOVIMIENTO -->

<div class="form-group">
    <h3>Movimiento</h3>
</div>

<div id="symmetricMovementOrigin"></div>

<div id="symmetricMovementDestination"></div>

                <div class="form-group">

                    <label for="nonManualFeatures">
                        Rasgos no manuales
                    </label>

                    <textarea
                        id="nonManualFeatures"
                        placeholder="Describe las expresiones faciales o movimientos corporales..."
                    ></textarea>

                </div>

            `;

            createOrientationSelector(
                document.getElementById("symmetricOrientationSelector"),
                "symmetricOrientation"
            );

            createLocationSelector(
    document.getElementById("symmetricLocationSelector"),
    "symmetricLocation"
);

createMovementSelector(
    document.getElementById("symmetricMovementOrigin"),
    "symmetricMovementOriginValue",
    "Punto de origen"
);

createMovementSelector(
    document.getElementById("symmetricMovementDestination"),
    "symmetricMovementDestinationValue",
    "Punto de destino"
);

        }

        if (bimanualType.value === "asimetrica") {

    bimanualOptions.innerHTML = `

        <div class="form-group">

            <label for="bimanualReferentRelation">
                Relación con el referente
            </label>

            <select id="bimanualReferentRelation">

                <option value="">Selecciona una característica</option>
                <option value="inicializada">Inicializada</option>
                <option value="lexicografica">Lexicográfica</option>
                <option value="iconica">Icónica</option>
                <option value="natural">Natural</option>
                <option value="arbitraria">Arbitraria</option>

            </select>

        </div>

        <!-- MANO BASE -->

        <div class="form-group">

            <h3>Configuración manual</h3>

            <label for="baseHandConfiguration">
                Mano base
            </label>

            <textarea
                id="baseHandConfiguration"
                placeholder="Describe la configuración de la mano base..."
            ></textarea>

        </div>

        <div class="form-group">

            <div id="baseHandOrientationSelector"></div>

        </div>

        <div id="baseHandLocationSelector"></div>

        <!-- MANO DOMINANTE -->

        <div class="form-group">

            <h3>Configuración manual</h3>

            <label for="dominantHandConfiguration">
                Mano dominante
            </label>

            <textarea
                id="dominantHandConfiguration"
                placeholder="Describe la configuración de la mano dominante..."
            ></textarea>

        </div>

        <div class="form-group">

            <div id="dominantHandOrientationSelector"></div>

        </div>

        <div id="dominantHandLocationSelector"></div>

        <!-- MOVIMIENTO -->

<div class="form-group">
    <h3>Movimiento</h3>
</div>

<div id="asymmetricMovementOrigin"></div>

<div id="asymmetricMovementDestination"></div>

        <!-- RASGOS NO MANUALES -->

        <div class="form-group">

            <label for="nonManualFeatures">
                Rasgos no manuales
            </label>

            <textarea
                id="nonManualFeatures"
                placeholder="Describe las expresiones faciales o movimientos corporales..."
            ></textarea>

        </div>

    `;

    createOrientationSelector(
        document.getElementById("baseHandOrientationSelector"),
        "baseHandOrientation"
    );

     createLocationSelector(
    document.getElementById("baseHandLocationSelector"),
    "baseHandLocation"
);

    createOrientationSelector(
        document.getElementById("dominantHandOrientationSelector"),
        "dominantHandOrientation"
    );

    createLocationSelector(
    document.getElementById("dominantHandLocationSelector"),
    "dominantHandLocation"
);

createMovementSelector(
    document.getElementById("asymmetricMovementOrigin"),
    "asymmetricMovementOriginValue",
    "Punto de origen"
);

createMovementSelector(
    document.getElementById("asymmetricMovementDestination"),
    "asymmetricMovementDestinationValue",
    "Punto de destino"
);
   

}
    });

}


// ========================================
// SEÑA COMPUESTA
// ========================================

if (signType.value === "compuesta") {

    signTypeOptions.innerHTML = `

        <div class="form-group">

            <label for="compoundReferentRelation">
                Relación con el referente
            </label>

            <select id="compoundReferentRelation">

                <option value="">Selecciona una característica</option>
                <option value="inicializada">Inicializada</option>
                <option value="lexicografica">Lexicográfica</option>
                <option value="iconica">Icónica</option>
                <option value="natural">Natural</option>
                <option value="arbitraria">Arbitraria</option>

            </select>

        </div>

        <div class="compound-elements-section">

    <div id="compoundElements"></div>

            <button
                type="button"
                id="addCompoundElement"
                class="new-category-button"
            >
                ＋ Agregar elemento
            </button>

        </div>


        <!-- MOVIMIENTO -->

<div class="form-group">
    <h3>Movimiento</h3>
</div>

<div id="compoundMovementOrigin"></div>

<div id="compoundMovementDestination"></div>

        <div class="form-group">

            <label for="nonManualFeatures">
                Rasgos no manuales
            </label>

            <textarea
                id="nonManualFeatures"
                placeholder="Describe las expresiones faciales o movimientos corporales..."
            ></textarea>

        </div>

    `;

    const compoundElements =
        document.getElementById("compoundElements");

    const addCompoundElement =
        document.getElementById("addCompoundElement");

    let compoundElementCount = 0;

    function addElement() {

        compoundElementCount++;

        const elementNumber = compoundElementCount;

        const element = document.createElement("div");

        element.className =
            "compound-element form-group";

        element.innerHTML = `

            <div class="form-group">

                <label>
                    Configuración manual
                </label>

                <textarea
                    class="compound-element-configuration"
                    placeholder="Describe la configuración de las manos..."
                ></textarea>

            </div>

            <div class="form-group">

                <div id="compoundOrientation${elementNumber}"></div>

            </div>

            <div id="compoundLocation${elementNumber}"></div>

        `;

        compoundElements.appendChild(element);

        createOrientationSelector(
            document.getElementById(
                `compoundOrientation${elementNumber}`
            ),
            `compoundOrientation${elementNumber}Value`
        );

        createLocationSelector(
    document.getElementById(
        `compoundLocation${elementNumber}`
    ),
    `compoundLocation${elementNumber}Value`
);


    }

    addElement();
    addElement();

    createMovementSelector(
    document.getElementById("compoundMovementOrigin"),
    "compoundMovementOriginValue",
    "Punto de origen"
);

createMovementSelector(
    document.getElementById("compoundMovementDestination"),
    "compoundMovementDestinationValue",
    "Punto de destino"
);

    addCompoundElement.addEventListener(
        "click",
        addElement
    );

}

    }
);

const signImage =
    document.getElementById("signImage");

const manualConfiguration =
    document.getElementById(
        "manualConfiguration"
    );

const orientation =
    document.getElementById("orientation");


const nonManualFeatures =
    document.getElementById(
        "nonManualFeatures"
    );

const createCategoryButton =
    document.getElementById(
        "createCategoryButton"
    );


// ========================================
// CAMBIAR A VISTA INTERNA
// ========================================

function showInternalView() {

    document.body.classList.add("internal-view");

    homeDashboard.classList.add("hidden");
    exploreView.classList.add("hidden");
    categoriesView.classList.add("hidden");

    categoryView.classList.add("hidden");
    dictionaryView.classList.add("hidden");
    signDetailView.classList.add("hidden");

    signTypesView.classList.add("hidden");
featureInfoView.classList.add("hidden");
grammarView.classList.add("hidden");

}


// ========================================
// VOLVER A INICIO
// ========================================

function showHomeView() {

    document.body.classList.remove("internal-view");

    mainHeader.classList.remove("hidden");

    homeDashboard.classList.remove("hidden");

    exploreView.classList.add("hidden");
    categoriesView.classList.add("hidden");

    categoryView.classList.add("hidden");
    dictionaryView.classList.add("hidden");
    signDetailView.classList.add("hidden");

    signTypesView.classList.add("hidden");
    featureInfoView.classList.add("hidden");

    grammarView.classList.add("hidden");

    searchInput.value = "";
    dictionarySearch.value = "";

    navHome.classList.add("active");
    navExplore.classList.remove("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* ========================================
   NAVEGACIÓN INFERIOR
======================================== */

navHome.addEventListener("click", () => {
    showHomeView();
});

navExplore.addEventListener("click", () => {

    showInternalView();

    exploreView.classList.remove("hidden");

    navHome.classList.remove("active");
    navExplore.classList.add("active");

    searchInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


/* ========================================
   ABRIR CATEGORÍAS
======================================== */

openCategories.addEventListener("click", () => {

    showInternalView();

    categoriesView.classList.remove("hidden");

    renderCategories();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

backFromCategories.addEventListener("click", () => {
    showHomeView();
});


/* ========================================
   TIPOS DE SEÑAS
======================================== */

openSignTypes.addEventListener("click", () => {

    showInternalView();


    signTypesView.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

backFromSignTypes.addEventListener("click", () => {
    showHomeView();
});


/* ========================================
   CARACTERÍSTICAS DE LA SEÑA
======================================== */

const featureNames = {
    configuration: "Configuración manual",
    orientation: "Orientación",
    location: "Ubicación",
    movement: "Movimiento",
    nonManual: "Rasgos no manuales"
};

// ========================================
// GRAMÁTICA DE LA LSM
// ========================================

const grammarNames = {
    systems: "Lenguas y sistemas de comunicación",
    syntax: "Sintaxis de la LSM",
    glosses: "Glosas",
    conventions: "Convenciones de transcripción",
    exercises: "Ejercicios de clase"
};


const grammarContents = {

    systems: `
        <div class="note-section">
            <h3>Lenguas y sistemas de comunicación</h3>

            <div class="note-topic">
                <h4>Español signado</h4>
                <p>
                    Es un sistema de comunicación manual que utiliza
                    señas asociadas a palabras del español y conserva,
                    en mayor o menor medida, el orden y la estructura
                    gramatical de esta lengua.
                </p>
                <p>
                    No debe confundirse con una lengua de señas natural,
                    ya que su organización toma como referencia
                    la estructura del español.
                </p>
            </div>

            <div class="note-topic">
                <h4>Español exacto</h4>
                <p>
                    Es una denominación utilizada en determinados
                    contextos educativos para referirse a sistemas
                    que buscan representar manualmente los elementos
                    gramaticales del español, incluyendo artículos,
                    preposiciones y conectores.
                </p>
                <p>
                    Puede emplearse como recurso de apoyo en la
                    enseñanza de la lectura y la escritura de
                    personas sordas. No constituye una lengua
                    natural independiente.
                </p>
            </div>

            <div class="note-topic">
                <h4>Lengua de Señas Mexicana (LSM)</h4>
                <p>
                    Es una lengua natural de modalidad visual-gestual,
                    con vocabulario, gramática y recursos lingüísticos
                    propios. Su estructura no depende de reproducir
                    palabra por palabra las oraciones del español.
                </p>
                <p>
                    Su comprensión requiere reconocer la organización
                    de las señas, el uso del espacio y los componentes
                    manuales y no manuales.
                </p>
            </div>
        </div>
    `,

    syntax: `
        <div class="note-section">
            <h3>Sintaxis de la LSM</h3>

            <div class="note-topic">
                <h4>¿Qué es la sintaxis?</h4>
                <p>
                    Es el área de la gramática que estudia cómo se
                    organizan y relacionan los elementos de una lengua
                    para formar expresiones y oraciones.
                </p>
            </div>

            <div class="note-topic">
                <h4>Organización de los elementos</h4>
                <p>
                    En la LSM, los elementos de una oración se
                    organizan mediante relaciones gramaticales
                    y recursos espaciales.
                </p>
                <p>
                    El tiempo, el lugar, el sujeto, el objeto
                    y el predicado pueden intervenir en la
                    construcción del enunciado. Su orden
                    depende de la estructura y del contexto.
                </p>
            </div>

            <div class="note-topic">
                <h4>Orden de los elementos en clase</h4>
                <p>
                    Como referencia para los ejercicios del curso
                    se utiliza la siguiente secuencia:
                </p>
                <p>
                    <strong>
                        TIEMPO / LUGAR / SUJETO / OBJETO / VERBO /
                        PREGUNTA
                    </strong>
                </p>
                <p>
                    Esta secuencia funciona como una guía de trabajo,
                    no como una regla obligatoria para todas las
                    construcciones de la LSM.
                </p>
            </div>
        </div>
    `,

    glosses: `
        <div class="note-section">
            <h3>Glosas de la LSM</h3>

            <div class="note-topic">
                <h4>¿Qué es una glosa?</h4>
                <p>
                    Es una representación escrita que se utiliza
                    para transcribir y analizar una producción
                    en lengua de señas.
                </p>
                <p>
                    Generalmente se emplea una palabra del español
                    como etiqueta para identificar una seña.
                    Sin embargo, esa palabra no necesariamente
                    expresa todo su significado ni equivale
                    a una traducción literal.
                </p>
            </div>

            <div class="note-topic">
                <h4>¿Para qué sirve?</h4>
                <p>
                    Permite organizar, documentar y analizar
                    las producciones signadas, identificar
                    sus elementos y estudiar las relaciones
                    gramaticales que se presentan en ellas.
                </p>
            </div>

            <div class="note-topic">
                <h4>Glosa y traducción</h4>
                <p>
                    La glosa no debe confundirse con una traducción
                    completa. Una transcripción puede acompañarse
                    de una traducción al español para facilitar
                    la interpretación del enunciado.
                </p>
            </div>
        </div>
    `,

    conventions: `
        <div class="note-section">
            <h3>Convenciones para realizar una glosa</h3>

            <div class="note-topic">
                <h4>Organización en dos columnas</h4>
                <p>
                    Para los ejercicios del curso se pueden utilizar
                    dos columnas: una para el texto original en español
                    y otra para la glosa correspondiente a la LSM.
                </p>
            </div>

            <div class="note-topic">
                <h4>MAYÚSCULAS</h4>
                <p>
                    Se utilizan para representar las etiquetas
                    léxicas de las señas. Generalmente se escribe
                    una palabra por cada etiqueta.
                </p>
            </div>

            <div class="note-topic">
                <h4>Separación con diagonales</h4>
                <p>
                    La diagonal ( / ) permite separar las etiquetas
                    y organizar la secuencia de la glosa.
                </p>
            </div>

            <div class="note-topic">
                <h4>Reiteración (++ )</h4>
                <p>
                    En las convenciones del curso, el símbolo ++
                    indica la repetición de un elemento o movimiento.
                </p>
            </div>

            <div class="note-topic">
                <h4>Deletreo manual</h4>
                <p>
                    Las letras se representan separadas mediante
                    guiones cuando se transcribe el deletreo manual.
                </p>
                <p><strong>d-e-l-e-t-r-e-o</strong></p>
            </div>

            <div class="note-topic">
                <h4>Notas aclaratorias</h4>
                <p>
                    Los paréntesis ( ) permiten incorporar
                    información adicional sobre la producción,
                    como movimientos, expresiones faciales
                    o características de la ejecución.
                </p>
            </div>

            <div class="note-topic">
                <h4>Gesto y rasgos no manuales</h4>
                <p>
                    Se pueden registrar movimientos de cabeza,
                    expresiones faciales y otros componentes
                    corporales que intervienen en la producción.
                    Es importante distinguir los gestos espontáneos
                    de los rasgos no manuales con función lingüística.
                </p>
            </div>

            <div class="note-topic">
                <h4>CL: Clasificadores</h4>
                <p>
                    Se utiliza para señalar la presencia de
                    construcciones clasificadoras. Estas pueden
                    representar características de entidades,
                    formas, movimientos o relaciones espaciales.
                </p>
                <p>
                    La configuración manual y su función deben
                    interpretarse dentro de la construcción
                    completa, no únicamente por la forma de la mano.
                </p>
            </div>

            <div class="note-topic">
                <h4>Una seña para más de una palabra</h4>
                <p>
                    Una sola seña puede corresponder a una expresión
                    de varias palabras en español. Por eso,
                    la glosa no siempre mantiene una equivalencia
                    de una palabra por cada palabra traducida.
                </p>
            </div>

            <div class="note-topic">
                <h4>Marcas de transcripción</h4>
                <p>
                    Las convenciones como ++, //, CL y las notas
                    entre paréntesis deben definirse previamente
                    para que la transcripción sea consistente.
                    Su uso puede variar entre investigaciones
                    y materiales educativos.
                </p>
            </div>
        </div>
    `,

    exercises: `
        <div class="note-section">
            <h3>Ejercicios y ejemplos de clase</h3>

            <div class="note-topic">
                <h4>Ejercicio 1. Acción y parentesco</h4>
                <p><strong>Español:</strong></p>
                <p>Mi primo está jugando videojuegos.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>PRESENTE / YO - PRIMO / CL:C / JUGAR</p>
                <p>
                    <strong>Nota:</strong>
                    Se registró una expresión con mejillas infladas.
                    Es necesario identificar si corresponde a un
                    rasgo no manual o a otro componente de la producción.
                </p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 2. Edad</h4>
                <p><strong>Español:</strong></p>
                <p>Yo tengo 25 años.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>PRESENTE / YO / 25 / AÑOS</p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 3. Condición climática</h4>
                <p><strong>Español:</strong></p>
                <p>Hace mucho calor hoy.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>PRESENTE / HOY / CALOR / MUCHO</p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 4. Presentación personal</h4>
                <p><strong>Español:</strong></p>
                <p>
                    Hola, yo me llamo Jake y mi nombre en
                    lengua de señas es...
                </p>
                <p><strong>Glosa de clase:</strong></p>
                <p>HOLA / YO - NOMBRE / j-a-k-e / YO - SEÑA / JAKE</p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 5. Actividad grupal</h4>
                <p><strong>Español:</strong></p>
                <p>Hoy todo el grupo presentó cuentos diferentes.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>HOY / GRUPO - TODO / CL:1 / CUENTO / PRESENTAR</p>
                <p>
                    <strong>Nota:</strong>
                    La descripción del movimiento del clasificador
                    debe acompañar la transcripción cuando sea
                    necesaria para comprender su ejecución.
                </p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 6. Negación</h4>
                <p><strong>Español:</strong></p>
                <p>Ayer Daniel no vino porque no quiso.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>AYER / DANIEL / VENIR / QUERER</p>
                <p>
                    <strong>Nota:</strong>
                    Se deben registrar los movimientos de cabeza
                    y las expresiones faciales que acompañan
                    la negación, según la producción original.
                </p>
            </div>

            <div class="note-topic">
                <h4>Ejercicio 7. Descripción y comparación</h4>
                <p><strong>Español:</strong></p>
                <p>Hoy Solís se puso roja igual que Romeo.</p>
                <p><strong>Glosa de clase:</strong></p>
                <p>HOY / SOLÍS / ROJO / IGUAL / ROMEO / CUENTO</p>
                <p>
                    <strong>Nota:</strong>
                    Se registraron mejillas infladas y ojos cerrados
                    durante la producción. Estos componentes deben
                    analizarse como parte de la expresión no manual.
                </p>
            </div>
        </div>
    `
};



const featureContents = {

    configuration: `
        <div class="note-intro">
            <span class="note-kicker">CARACTERÍSTICAS DE LA SEÑA</span>

            <h3>Configuración manual</h3>

            <p>
                Es la forma que adoptan una o ambas manos durante
                la articulación de una seña. Constituye uno de los
                parámetros fundamentales para describir cómo se
                produce una seña en la Lengua de Señas Mexicana.
            </p>
        </div>

        <div class="note-section">

            <h3>Características principales</h3>

            <div class="note-topic">
                <h4>Forma de las manos</h4>
                <p>
                    Comprende la disposición que adoptan los dedos,
                    el pulgar y la palma. Considera aspectos como
                    la flexión, extensión, separación y posición
                    de los dedos.
                </p>
            </div>

            <div class="note-topic">
                <h4>Participación de las manos</h4>
                <p>
                    La configuración puede involucrar una o ambas
                    manos. Cuando participan las dos, sus formas
                    pueden ser iguales o diferentes, dependiendo
                    de la organización articulatoria de la seña.
                </p>
            </div>

            <div class="note-topic">
                <h4>Importancia lingüística</h4>
                <p>
                    La configuración manual permite distinguir
                    señas que pueden compartir otros parámetros.
                    Por ello, sus características deben analizarse
                    en conjunto con la orientación, la ubicación
                    y el movimiento.
                </p>
            </div>

        </div>

        <div class="note-section note-observation">
            <h3>Para tener en cuenta</h3>
            <p>
                La configuración manual no describe por sí sola
                toda la seña. Su interpretación depende de la
                combinación de los distintos parámetros
                articulatorios y de los rasgos no manuales.
            </p>
        </div>

        <div class="note-sources">
            <h4>Fuentes de consulta</h4>
            <p>
                Diccionario de Lengua de Señas Mexicana de la
                Ciudad de México (2017).
            </p>
            <p>
                Cruz-Aldrete, Miroslava (2008).
                <em>Gramática de la Lengua de Señas Mexicana.</em>
            </p>
        </div>
        `,

    orientation: `
        <div class="note-intro">
            <span class="note-kicker">CARACTERÍSTICAS DE LA SEÑA</span>

            <h3>Orientación</h3>

            <p>
                Es la posición que adopta la palma de la mano
                con respecto al cuerpo de la persona que realiza
                la seña durante su articulación.
            </p>
        </div>

        <div class="note-section">

            <h3>Características principales</h3>

            <div class="note-topic">
                <h4>Dirección de la palma</h4>
                <p>
                    Describe hacia dónde se encuentra orientada
                    la superficie palmar de la mano en relación
                    con el cuerpo y el espacio de señas.
                </p>
            </div>

            <div class="note-topic">
                <h4>Dirección de los dedos</h4>
                <p>
                    La orientación también puede considerar
                    la dirección hacia la que apuntan los dedos,
                    ya que esta información contribuye a describir
                    la posición de la mano.
                </p>
            </div>

            <div class="note-topic">
                <h4>Orientación estable y cambiante</h4>
                <p>
                    Durante la articulación, la orientación puede
                    mantenerse o modificarse como parte de la
                    configuración del movimiento de la seña.
                </p>
            </div>

        </div>

        <div class="note-section note-observation">
            <h3>Para tener en cuenta</h3>
            <p>
                La orientación es un parámetro independiente
                de la configuración manual. Dos señas pueden
                presentar una configuración semejante y
                diferenciarse por la orientación de sus manos.
            </p>
        </div>

        <div class="note-sources">
            <h4>Fuentes de consulta</h4>
            <p>
                Diccionario de Lengua de Señas Mexicana de la
                Ciudad de México (2017).
            </p>
            <p>
                Cruz-Aldrete, Miroslava (2008).
                <em>Gramática de la Lengua de Señas Mexicana.</em>
            </p>
        </div>
        `,

    location: `
        <div class="note-intro">
            <span class="note-kicker">CARACTERÍSTICAS DE LA SEÑA</span>

            <h3>Ubicación</h3>

            <p>
                Es el lugar del espacio señante donde se realiza
                una seña. Describe la posición espacial de una
                o ambas manos durante su articulación.
            </p>
        </div>

        <div class="note-section">

            <h3>Características principales</h3>

            <div class="note-topic">
                <h4>Espacio señante</h4>
                <p>
                    Comprende el espacio utilizado para producir
                    las señas, tanto en relación con el cuerpo
                    como en el área situada frente a la persona
                    que está señando.
                </p>
            </div>

            <div class="note-topic">
                <h4>Ubicación corporal</h4>
                <p>
                    La articulación puede realizarse en distintas
                    regiones del cuerpo. La posición donde se
                    produce la seña constituye información
                    relevante para su descripción lingüística.
                </p>
            </div>

            <div class="note-topic">
                <h4>Altura y profundidad</h4>
                <p>
                    La ubicación también considera la altura
                    a la que se realiza la seña y su posición
                    en profundidad dentro del espacio señante.
                </p>
            </div>

            <div class="note-topic">
                <h4>Relación espacial</h4>
                <p>
                    La posición de las manos puede establecerse
                    en relación con el cuerpo, con otras partes
                    del espacio señante o con elementos que
                    intervienen en el discurso.
                </p>
            </div>

        </div>

        <div class="note-section note-observation">
            <h3>Para tener en cuenta</h3>
            <p>
                La ubicación no debe confundirse con la orientación:
                la primera describe dónde se produce la seña,
                mientras que la segunda indica hacia dónde
                se dirige la palma y la mano.
            </p>
        </div>

        <div class="note-sources">
            <h4>Fuentes de consulta</h4>
            <p>
                Diccionario de Lengua de Señas Mexicana de la
                Ciudad de México (2017).
            </p>
            <p>
                Cruz-Aldrete, Miroslava (2008).
                <em>Gramática de la Lengua de Señas Mexicana.</em>
            </p>
        </div>
        `,

    movement: `
        <div class="note-intro">
            <span class="note-kicker">CARACTERÍSTICAS DE LA SEÑA</span>

            <h3>Movimiento</h3>

            <p>
                Es la trayectoria o acción que realizan una
                o ambas manos durante la articulación de una
                seña. Constituye uno de los parámetros
                fundamentales de su estructura.
            </p>
        </div>

        <div class="note-section">

            <h3>Características principales</h3>

            <div class="note-topic">
                <h4>Trayectoria</h4>
                <p>
                    Describe el recorrido que siguen las manos
                    dentro del espacio señante. Puede presentar
                    distintas direcciones y recorridos.
                </p>
            </div>

            <div class="note-topic">
                <h4>Dirección</h4>
                <p>
                    Indica hacia dónde se desplazan las manos
                    durante la producción de la seña. La dirección
                    se analiza en relación con el cuerpo y el
                    espacio de articulación.
                </p>
            </div>

            <div class="note-topic">
                <h4>Tipo de movimiento</h4>
                <p>
                    El movimiento puede presentar diferentes
                    características articulatorias, como
                    desplazamientos lineales, circulares,
                    curvos, alternados u ondulatorios.
                </p>
            </div>

            <div class="note-topic">
                <h4>Partes de la mano involucradas</h4>
                <p>
                    El movimiento no siempre implica el
                    desplazamiento de toda la mano. También
                    puede producirse mediante acciones de
                    los dedos, el pulgar o la muñeca.
                </p>
            </div>

            <div class="note-topic">
                <h4>Relación entre ambas manos</h4>
                <p>
                    Cuando participan las dos manos, sus
                    movimientos pueden coordinarse de manera
                    simultánea, alternada o diferenciada,
                    según la estructura de la seña.
                </p>
            </div>

        </div>

        <div class="note-section note-observation">
            <h3>Para tener en cuenta</h3>
            <p>
                El movimiento debe analizarse junto con la
                configuración manual, la orientación y la
                ubicación. Estos parámetros pueden mantenerse
                o modificarse durante la articulación de una seña.
            </p>
        </div>

        <div class="note-sources">
            <h4>Fuentes de consulta</h4>
            <p>
                Diccionario de Lengua de Señas Mexicana de la
                Ciudad de México (2017).
            </p>
            <p>
                Cruz-Aldrete, Miroslava (2008).
                <em>Gramática de la Lengua de Señas Mexicana.</em>
            </p>
        </div>
        `,

    nonManual: `
        <div class="note-intro">
            <span class="note-kicker">CARACTERÍSTICAS DE LA SEÑA</span>

            <h3>Rasgos no manuales</h3>

            <p>
                Son los elementos articulatorios que participan
                en la producción de las señas sin depender
                directamente de las manos. Incluyen movimientos
                y posiciones de distintas partes del rostro
                y del cuerpo.
            </p>
        </div>

        <div class="note-section">

            <h3>Elementos principales</h3>

            <div class="note-topic">
                <h4>Expresión facial</h4>
                <p>
                    Comprende las posiciones y movimientos
                    de las cejas, los ojos, las mejillas,
                    la nariz, la boca y otras partes del rostro.
                </p>
            </div>

            <div class="note-topic">
                <h4>Movimiento de la cabeza</h4>
                <p>
                    Incluye movimientos, inclinaciones y
                    posiciones de la cabeza que pueden
                    acompañar o modificar la información
                    transmitida durante la seña.
                </p>
            </div>

            <div class="note-topic">
                <h4>Movimiento corporal</h4>
                <p>
                    Comprende las posiciones y movimientos
                    del tronco y otras partes del cuerpo
                    que participan en la producción del
                    mensaje.
                </p>
            </div>

            <div class="note-topic">
                <h4>Componentes orales</h4>
                <p>
                    Incluyen movimientos de los labios,
                    la lengua y la boca que pueden formar
                    parte de la articulación y aportar
                    información lingüística.
                </p>
            </div>

        </div>

        <div class="note-section">

            <h3>Función lingüística y gramatical</h3>

            <div class="note-topic">
                <h4>Producción simultánea</h4>
                <p>
                    Los rasgos no manuales pueden producirse
                    al mismo tiempo que los movimientos de
                    las manos. No constituyen necesariamente
                    elementos independientes, sino que
                    pueden integrarse a la estructura de
                    una seña o de una construcción lingüística.
                </p>
            </div>

            <div class="note-topic">
                <h4>Información gramatical</h4>
                <p>
                    Participan en la organización de las
                    oraciones y pueden expresar funciones
                    gramaticales, como la negación,
                    la interrogación y otros matices
                    lingüísticos.
                </p>
            </div>

            <div class="note-topic">
                <h4>Interpretación del mensaje</h4>
                <p>
                    Contribuyen a interpretar el significado
                    y la intención comunicativa. Su función
                    depende de la estructura lingüística
                    y del contexto en el que se produce
                    el mensaje.
                </p>
            </div>

        </div>

        <div class="note-section note-observation">
            <h3>Polisemia y contexto</h3>
            <p>
                La polisemia es un fenómeno lingüístico en
                el que una misma unidad léxica puede tener
                varios significados relacionados. La
                interpretación depende del contexto
                comunicativo y de la información lingüística
                disponible, incluidos los rasgos no manuales.
            </p>
        </div>

        <div class="note-section note-observation">
            <h3>Una distinción importante</h3>
            <p>
                No todos los gestos espontáneos son rasgos
                no manuales lingüísticos. Para considerarlos
                parte de la estructura de la LSM, es necesario
                reconocer la función que desempeñan dentro
                de la lengua.
            </p>
        </div>

        <div class="note-sources">
            <h4>Fuentes de consulta</h4>
            <p>
                Diccionario de Lengua de Señas Mexicana de la
                Ciudad de México (2017).
            </p>
            <p>
                Cruz-Aldrete, Miroslava (2013).
                <em>No siempre digo no. La negación en la
                Lengua de Señas Mexicana.</em>
            </p>
            <p>
                García Benavides, Irene (2004).
                <em>La lingüística en el lenguaje de señas.</em>
            </p>
        </div>
    `
};


// ========================================
// CARACTERÍSTICAS DE LA SEÑA
// ========================================

openCharacteristics.addEventListener("click", () => {

    const feature = "configuration";

    featureInfoTitle.textContent =
        featureNames[feature];

    featureInfoContent.innerHTML =
        featureContents[feature];

    document.querySelectorAll("[data-feature-link]").forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.featureLink === feature
        );

    });

    showInternalView();

    featureInfoView.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


backFromFeature.addEventListener("click", () => {
    showHomeView();
});


/* ========================================
   GRAMÁTICA DE LA LSM
======================================== */

openGrammar.addEventListener("click", () => {

    showInternalView();

    grammarView.classList.remove("hidden");

    showGrammarSection("systems");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

backFromGrammar.addEventListener("click", () => {
    showHomeView();
});


// ========================================
// NAVEGACIÓN ENTRE APUNTES
// ========================================

document.querySelectorAll("[data-feature-link]").forEach(button => {

    button.addEventListener("click", () => {

        const feature = button.dataset.featureLink;

        featureInfoTitle.textContent =
            featureNames[feature] || "Características de la seña";

        featureInfoContent.innerHTML =
            featureContents[feature] || "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});



// ========================================
// MOSTRAR CATEGORÍAS
// ========================================

function renderCategories() {

    categoriesContainer.innerHTML = "";

    // ========================================
// CATEGORÍA GENERAL: VOCABULARIO
// ========================================

const vocabularySigns =
    signs.filter(
        sign => sign.categoryId === null
    );

const vocabularyCard =
    document.createElement("article");

vocabularyCard.className = "category-card";

vocabularyCard.innerHTML = `

    <div class="category-icon">
        📚
    </div>

    <h3>
        Vocabulario
    </h3>

    <p>
        ${vocabularySigns.length}
        ${
            vocabularySigns.length === 1
                ? "seña"
                : "señas"
        }
    </p>

`;

vocabularyCard.addEventListener(
    "click",
    () => {
        showCategory(null);
    }
);

categoriesContainer.appendChild(
    vocabularyCard
);

    const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(
        b.name,
        "es",
        { sensitivity: "base" }
    )
);

sortedCategories.forEach(category => {

        const categorySigns =
            signs.filter(
                sign =>
                    sign.categoryId ===
                    category.id
            );


        const card =
            document.createElement("article");


        card.className =
            "category-card";


        card.innerHTML = `

            <div class="category-icon">
                ${category.icon}
            </div>

            <h3>
                ${category.name}
            </h3>

            <p>
                ${categorySigns.length}
                ${
                    categorySigns.length === 1
                        ? "seña"
                        : "señas"
                }
            </p>

        `;


        card.addEventListener(
            "click",
            () => {

                showCategory(
                    category.id
                );

            }
        );


        categoriesContainer.appendChild(
            card
        );

    });
}
// ========================================
// NAVEGACIÓN DE GRAMÁTICA DE LA LSM
// ========================================

const grammarInfoContent =
    document.getElementById("grammarInfoContent");

function showGrammarSection(section) {

    grammarInfoContent.innerHTML =
        grammarContents[section] || "";

    document.querySelectorAll("[data-grammar-link]").forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.grammarLink === section
        );

    });

}

document.querySelectorAll("[data-grammar-link]").forEach(button => {

    button.addEventListener("click", () => {

        const section = button.dataset.grammarLink;

        showGrammarSection(section);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


// ========================================
// MOSTRAR UNA CATEGORÍA
// ========================================

function showCategory(categoryId) {

    const category =
    categories.find(
        category =>
            category.id === categoryId
    ) || {
        id: null,
        name: "Vocabulario"
    };


    const filteredSigns =
    signs
        .filter(
            sign =>
                sign.categoryId ===
                categoryId
        )
        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    "es",
                    { sensitivity: "base" }
                )
        );


    categoryTitle.textContent =
        category.name;


    categorySignsContainer.innerHTML =
        "";


    if (filteredSigns.length === 0) {

        categorySignsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🖐️
                </div>

                <h3>
                    No hay señas todavía
                </h3>

                <p>
                    Esta categoría aún no tiene
                    señas registradas.
                </p>

            </div>

        `;

    } else {

        filteredSigns.forEach(sign => {

            const card =
                createSignCard(
                    sign,
                    category
                );


            categorySignsContainer.appendChild(
                card
            );

        });

    }


    showInternalView();


    categoryView.classList.remove(
        "hidden"
    );

    dictionaryView.classList.add(
        "hidden"
    );

    signDetailView.classList.add(
        "hidden"
    );


    // Guardamos la categoría actual

    previousCategoryId =
        categoryId;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


//// ========================================
// CREAR TARJETA DE SEÑA
// ========================================

function createSignCard(sign, category) {

    const card =
        document.createElement("article");


    card.className =
        "sign-card";


    // ========================================
    // BUSCAR EMOJI
    // ========================================

    const emoji =
        findEmoji(
            sign.name
        );


    // ========================================
    // DETERMINAR QUÉ MOSTRAR
    // PRIORIDAD:
    // 1. EMOJI
    // 2. IMAGEN
    // 3. NADA
    // ========================================

    let visualHTML = "";


    if (
        emoji
    ) {

        visualHTML = `
            <div class="sign-emoji">
                ${emoji}
            </div>
        `;

    } else if (
        sign.image
    ) {

        visualHTML = `
            <img
                src="${sign.image}"
                alt="Seña de ${sign.name}"
            >
        `;

    }


    // ========================================
    // CONTENIDO DE LA TARJETA
    // ========================================

    card.innerHTML = `

        <div class="sign-image">

            ${visualHTML}

        </div>


        <div class="sign-info">

            <span class="sign-category">
                ${category.name}
            </span>

            <h3>
                ${sign.name}
            </h3>

        </div>

    `;


    // ========================================
    // ABRIR DETALLE
    // ========================================

    card.addEventListener(
        "click",
        () => {

            previousSignView =
                "category";

            previousCategoryId =
                category.id;

            showSignDetail(
                sign.id
            );

        }
    );


    return card;
}


// ========================================
// MOSTRAR DETALLE DE UNA SEÑA
// ========================================

function showSignDetail(signId) {

    const sign =
        signs.find(
            sign =>
                sign.id === signId
        );


    if (!sign) return;

    signDetailView.dataset.signId =
    signId;

    


    const category =
    categories.find(
        category =>
            category.id === sign.categoryId
    ) || {
        id: null,
        name: "Vocabulario"
    };


    // ========================================
    // INFORMACIÓN PRINCIPAL
    // ========================================

    signDetailCategory.textContent =
        category.name;


    signDetailTitle.textContent =
        sign.name;


// ========================================
// OCULTAR ELEMENTO VISUAL
// ========================================

signDetailImage.innerHTML = "";

signDetailImage.classList.add("hidden");


    // ========================================
    // INFORMACIÓN DE LA SEÑA
    // ========================================

// ========================================
// CONFIGURACIÓN MANUAL Y ORIENTACIÓN
// ========================================

const configurations =
    sign.handConfigurations || [];

const orientations =
    sign.orientations || [];

    const locations =
    sign.locations || [];

const orientationClasses = {
    dorso_frente: "dark",
    palma_frente: "light",
    dorso_arriba: "half-horizontal-top",
    dorso_abajo: "half-horizontal-bottom",
    dorso_izquierda: "half-vertical-left",
    dorso_derecha: "half-vertical-right"
};

signDetailHandDetails.innerHTML = "";

let totalItems = Math.max(
    configurations.length,
    orientations.length
);

if (
    totalItems === 0 &&
    (sign.manualConfiguration || sign.orientation)
) {
    totalItems = 1;
}

for (let i = 0; i < totalItems; i++) {

    const configuration = configurations[i];
    const orientation = orientations[i];

    const location =
    locations.find(item => {

        if (item.role === "ambas") {
            return true;
        }

        if (item.role) {
            return (
                item.role === configuration?.role
            );
        }

        if (item.element) {
            return (
                item.element ===
                (configuration?.element || orientation?.element)
            );
        }

        return item.hand === (i + 1);

    });

    const handContainer =
        document.createElement("div");

    handContainer.className = "detail-hand-item";

    // IDENTIFICAR MANO O ELEMENTO

    let itemName = "";

    if (
        configuration?.role === "base" ||
        orientation?.role === "base"
    ) {
        itemName = "Mano base";

    } else if (
        configuration?.role === "dominante" ||
        orientation?.role === "dominante"
    ) {
        itemName = "Mano dominante";

    } else if (
        configuration?.element ||
        orientation?.element
    ) {
        itemName =
            `Configuración ${configuration?.element || orientation?.element}`;

    } else if (sign.signType === "bimanual") {
        itemName = "Ambas manos";

    } else if (sign.signType === "compuesta") {
        itemName = `Configuración ${i + 1}`;
    }

    if (itemName) {

        const heading = document.createElement("h4");

        heading.textContent = itemName;

        handContainer.appendChild(heading);
    }

    // CUADRANTE: CONFIGURACIÓN MANUAL

    const configurationField =
        document.createElement("div");

    configurationField.className = "detail-field";

    const configurationTitle =
        document.createElement("h3");

    configurationTitle.textContent =
        "Configuración manual";

    const configurationDescription =
        document.createElement("p");

    configurationDescription.textContent =
        configuration?.configuration ||
        (
            totalItems === 1
                ? sign.manualConfiguration || "No especificada."
                : "No especificada."
        );

    configurationField.appendChild(configurationTitle);
    configurationField.appendChild(configurationDescription);

    handContainer.appendChild(configurationField);

    // CUADRANTE: ORIENTACIÓN

    const orientationField =
        document.createElement("div");

    orientationField.className = "detail-field";

    const orientationTitle =
        document.createElement("h3");

    orientationTitle.textContent = "Orientación";

    const orientationContent =
        document.createElement("div");

    orientationContent.className =
        "detail-orientation-content";

    const orientationValue =
        orientation?.orientation ||
        (
            totalItems === 1
                ? sign.orientation || ""
                : ""
        );

    const orientationClass =
        orientationClasses[orientationValue];

    if (orientationClass) {

        const square = document.createElement("span");

        square.className =
            `orientation-square ${orientationClass}`;

        orientationContent.appendChild(square);

    } else {

        const missingOrientation =
            document.createElement("p");

        missingOrientation.textContent =
            "No especificada.";

        orientationContent.appendChild(missingOrientation);
    }

    orientationField.appendChild(orientationTitle);
    orientationField.appendChild(orientationContent);

    handContainer.appendChild(orientationField);

    // UBICACIÓN

if (
    location &&
    (
        location.quadrant ||
        location.distance ||
        location.notes
    )
) {

    const locationField =
        document.createElement("div");

    locationField.className = "detail-field";

    const locationTitle =
        document.createElement("h3");

    locationTitle.textContent = "Ubicación";

    const locationDescription =
        document.createElement("p");

    const locationParts = [];

    if (location.quadrant) {
        locationParts.push(
            `Cuadrante ${location.quadrant}`
        );
    }

    if (location.distance) {
        locationParts.push(location.distance);
    }

    if (location.notes) {
        locationParts.push(location.notes);
    }

    locationDescription.textContent =
        locationParts.join(" · ");

    locationField.appendChild(locationTitle);
    locationField.appendChild(locationDescription);

    handContainer.appendChild(locationField);
}

    signDetailHandDetails.appendChild(handContainer);
}

// ========================================
// MOVIMIENTO
// ========================================

const movement = sign.movements;

if (movement) {

    const movementField =
        document.createElement("div");

    movementField.className = "detail-field";

    const movementTitle =
        document.createElement("h3");

    movementTitle.textContent = "Movimiento";

    const movementContent =
        document.createElement("p");

    if (movement.origin && movement.destination) {

        movementContent.textContent =
            `Origen: ${movement.origin} → Destino: ${movement.destination}`;

    } else if (movement.origin) {

        movementContent.textContent =
            `Origen: ${movement.origin}`;

    } else if (movement.destination) {

        movementContent.textContent =
            `Destino: ${movement.destination}`;
    }

    movementField.appendChild(movementTitle);
    movementField.appendChild(movementContent);

    if (movement.description) {

        const description =
            document.createElement("p");

        description.textContent =
            movement.description;

        movementField.appendChild(description);
    }

    signDetailHandDetails.appendChild(movementField);
}

// ========================================
// SIGNIFICADO O SINÓNIMOS
// ========================================

signDetailMeaning.textContent =
    sign.meaning || "No especificado.";

// ========================================
// RASGOS NO MANUALES
// ========================================

signDetailNonManualFeatures.textContent =
    sign.nonManualFeatures || "No especificados.";


    // ========================================
    // CAMBIAR DE VISTA
    // ========================================

    showInternalView();


    categoryView.classList.add(
        "hidden"
    );

    dictionaryView.classList.add(
        "hidden"
    );

    signDetailView.classList.remove(
        "hidden"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// VOLVER DESDE DETALLE
// ========================================

backFromSignDetail.addEventListener(
    "click",
    () => {

        if (
            previousSignView ===
            "dictionary"
        ) {

            showInternalView();

            categoryView.classList.add(
                "hidden"
            );

            signDetailView.classList.add(
                "hidden"
            );

            dictionaryView.classList.remove(
                "hidden"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }


        if (
            previousSignView ===
            "category" &&
            previousCategoryId !== null
        ) {

            showCategory(
                previousCategoryId
            );

            return;
        }


        showHomeView();

    }
);


// ========================================
// VOLVER DESDE CATEGORÍA
// ========================================

backFromCategory.addEventListener(
    "click",
    () => {

        showHomeView();

    }
);



// ========================================
// BUSCADOR PRINCIPAL - EXPLORAR
// ========================================

searchInput.addEventListener("input", () => {

    const search = normalizeText(searchInput.value);

    searchSuggestions.innerHTML = "";

    if (!search) {
        searchSuggestions.classList.remove("active");
        return;
    }

    const filteredSigns = signs.filter(sign => {

        const category = categories.find(
            category => category.id === sign.categoryId
        );

        return (
            normalizeText(sign.name).includes(search) ||
            (category && normalizeText(category.name).includes(search))
        );

    });

    if (filteredSigns.length === 0) {

        searchSuggestions.innerHTML = `
            <div class="search-no-results">
                No se encontraron señas.
            </div>
        `;

        searchSuggestions.classList.add("active");
        return;
    }

    filteredSigns.slice(0, 8).forEach(sign => {

        const category = categories.find(
            category => category.id === sign.categoryId
        );

        const suggestion = document.createElement("button");

        suggestion.type = "button";
        suggestion.className = "search-suggestion";

        const name = document.createElement("strong");
        name.textContent = sign.name;

        const categoryName = document.createElement("span");
        categoryName.textContent = category
            ? category.name
            : "Sin categoría";

        suggestion.appendChild(name);
        suggestion.appendChild(categoryName);

        suggestion.addEventListener("click", () => {

            searchSuggestions.innerHTML = "";
            searchSuggestions.classList.remove("active");

            showSignDetail(sign.id);

        });

        searchSuggestions.appendChild(suggestion);

    });

    searchSuggestions.classList.add("active");

});



// ========================================
// MOSTRAR DICCIONARIO
// ========================================

function renderDictionary(
    signsToRender = signs
) {

    dictionaryContainer.innerHTML =
        "";


    dictionaryCount.textContent =
        `${signsToRender.length} ${
            signsToRender.length === 1
                ? "seña"
                : "señas"
        }`;


    if (
        signsToRender.length === 0
    ) {

        dictionaryContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🖐️
                </div>

                <h3>
                    No encontramos esa seña
                </h3>

                <p>
                    Intenta con otro término
                    de búsqueda.
                </p>

            </div>

        `;

        return;
    }


    const sortedSigns =
        [...signsToRender].sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    "es",
                    {
                        sensitivity: "base"
                    }
                )
        );


    const groups = {};


    sortedSigns.forEach(sign => {

        const letter =
            sign.name
                .charAt(0)
                .toLocaleUpperCase("es");


        if (!groups[letter]) {
            groups[letter] = [];
        }


        groups[letter].push(
            sign
        );

    });


    Object.keys(groups)
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "es"
                )
        )
        .forEach(letter => {

            const letterTitle =
                document.createElement(
                    "h3"
                );


            letterTitle.className =
                "dictionary-letter";


            letterTitle.textContent =
                letter;


            dictionaryContainer.appendChild(
                letterTitle
            );


            const list =
                document.createElement(
                    "div"
                );


            list.className =
                "dictionary-list";


            groups[letter].forEach(
                sign => {

                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "dictionary-sign";


                    item.innerHTML = `

                        <span
                            class="dictionary-sign-name"
                        >
                            ${sign.name}
                        </span>

                        <span
                            class="dictionary-sign-arrow"
                        >
                            →
                        </span>

                    `;


                    // ========================================
                    // ABRIR DETALLE DESDE DICCIONARIO
                    // ========================================

                    item.addEventListener(
                        "click",
                        () => {

                            previousSignView =
                                "dictionary";

                            showSignDetail(
                                sign.id
                            );

                        }
                    );


                    list.appendChild(
                        item
                    );

                }
            );


            dictionaryContainer.appendChild(
                list
            );

        });
}

console.log("Botones detectados:", {
    diccionario: openDictionary,
    categorias: openCategories,
    tipos: openSignTypes,
    caracteristicas: openCharacteristics,
    gramatica: openGrammar
});

// ========================================
// ABRIR DICCIONARIO
// ========================================

openDictionary.addEventListener(
    
    "click",
    () => {

        showInternalView();


        categoryView.classList.add(
            "hidden"
        );

        signDetailView.classList.add(
            "hidden"
        );

        dictionaryView.classList.remove(
            "hidden"
        );


        dictionarySearch.value =
            "";


        renderDictionary(
            signs
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ========================================
// BUSCAR DENTRO DEL DICCIONARIO
// ========================================

dictionarySearch.addEventListener(
    "input",
    () => {

        const search =
            dictionarySearch.value
                .toLocaleLowerCase("es")
                .trim();


        const filteredSigns =
            signs.filter(
                sign =>
                    sign.name
                        .toLocaleLowerCase("es")
                        .includes(search)
            );


        renderDictionary(
            filteredSigns
        );

    }
);


// ========================================
// VOLVER DESDE DICCIONARIO
// ========================================

backFromDictionary.addEventListener(
    "click",
    () => {

        showHomeView();

    }
);


// ========================================
// SELECT DE CATEGORÍAS
// ========================================

function populateCategorySelect(
    selectedCategoryId = ""
) {

    signCategory.innerHTML = `

    <option value="">
        Vocabulario (sin categoría)
    </option>

`;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category.id;


        option.textContent =
            category.name;


        signCategory.appendChild(
            option
        );

    });


    if (selectedCategoryId) {

        signCategory.value =
            selectedCategoryId;

    }
}


// ========================================
// CREAR NUEVA CATEGORÍA
// ========================================

createCategoryButton.addEventListener(
    "click",
    async () => {

        const categoryName =
            prompt(
                "Escribe el nombre de la nueva categoría:"
            );


        if (categoryName === null) {
            return;
        }


        const cleanName =
            categoryName.trim();


        if (!cleanName) {

            alert(
                "Escribe un nombre para la categoría."
            );

            return;
        }


        const existingCategory =
            categories.find(
                category =>
                    category.name
                        .toLocaleLowerCase("es") ===
                    cleanName
                        .toLocaleLowerCase("es")
            );


        if (existingCategory) {

            alert(
                "Esa categoría ya existe."
            );


            populateCategorySelect(
                existingCategory.id
            );

            return;
        }


const newCategory = {

    id:
        getNextCategoryId(),

    name:
        cleanName,

    icon:
        getCategoryIcon(
            cleanName
        )

};


const { error } =
    await supabaseClient
        .from("categories")
        .insert({
            id: newCategory.id,
            name: newCategory.name,
            icon: newCategory.icon
        });


if (error) {

    console.error(
    "Error guardando la seña en Supabase:",
    error.message,
    error.details,
    error.hint,
    error.code
);

    alert(
        "No se pudo guardar la categoría en Supabase."
    );

    return;
}


categories.push(
    newCategory
);

saveData();


        renderCategories();


        populateCategorySelect(
            newCategory.id
        );


        alert(
            `La categoría "${cleanName}" fue creada correctamente.`
        );

    }
);


// ========================================
// OBTENER SIGUIENTE ID DE CATEGORÍA
// ========================================

function getNextCategoryId() {

    if (categories.length === 0) {
        return 1;
    }


    return Math.max(
        ...categories.map(
            category =>
                category.id
        )
    ) + 1;
}


// ========================================
// ICONO AUTOMÁTICO
// ========================================

function getCategoryIcon(name) {

    const normalizedName =
        name
            .toLocaleLowerCase("es")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );


    const icons = {

        alimentos: "🍎",
        comida: "🍽️",
        frutas: "🍎",
        verduras: "🥦",
        bebidas: "🥤",

        colores: "🎨",

        saludos: "👋",

        animales: "🐾",

        familia: "👨‍👩‍👧‍👦",

        personas: "🧑",

        lugares: "📍",

        tiempo: "⏰",

        numeros: "🔢",

        emociones: "❤️",

        sentimientos: "💭",

        naturaleza: "🌿",

        escuela: "🎓",

        universidad: "🏫",

        trabajo: "💼",

        casa: "🏠",

        ropa: "👕",

        cuerpo: "🫶",

        transporte: "🚗",

        tecnologia: "💻",

        deportes: "⚽",

        musica: "🎵",

        profesiones: "🧑‍💼",

        verbos: "🔤",

        adjetivos: "📝"

    };


    return icons[normalizedName] ||
        "📚";
}


// ========================================
// ABRIR MODAL
// ========================================

function openModal() {

    // MODO CREAR

    editingSignId = null;

    signForm.reset();

    signModal.classList.remove("hidden");

    // Ocultar botón flotante
    openAddModal.classList.add("hidden");

    document.body.style.overflow = "hidden";

    populateCategorySelect();

}


// ========================================
// CERRAR MODAL
// ========================================

function closeModal() {

    signModal.classList.add("hidden");

    // Mostrar botón flotante
    openAddModal.classList.remove("hidden");

    document.body.style.overflow = "";

    signForm.reset();

}


// ========================================
// EVENTOS DEL MODAL
// ========================================

openAddModal.addEventListener(
    "click",
    openModal
);


closeAddModal.addEventListener(
    "click",
    closeModal
);


cancelAdd.addEventListener(
    "click",
    closeModal
);


closeModalOverlay.addEventListener(
    "click",
    closeModal
);


// ========================================
// OBTENER IMAGEN
// ========================================

function readImageFile(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                resolve(null);

                return;
            }


            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(
                    reader.result
                );

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "No se pudo leer la imagen."
                    )
                );

            };


            reader.readAsDataURL(
                file
            );

        }
    );
}


// ========================================
// OBTENER SIGUIENTE ID DE SEÑA
// ========================================

function getNextSignId() {

    if (signs.length === 0) {
        return 1;
    }


    return Math.max(
        ...signs.map(
            sign =>
                sign.id
        )
    ) + 1;
}


// ========================================
// RECOPILAR DATOS DE CLASIFICACIÓN
// ========================================

function collectClassificationData() {

    const getValue = id => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    };

    const getOrientation = id => {
        return getValue(id) || null;
    };

    const getLocation = id => {

    const quadrant = getValue(id);

    const distance =
        getValue(`${id}Distance`);

    const notes =
        getValue(`${id}Notes`);

    if (!quadrant && !distance && !notes) {
        return null;
    }

    return {
        quadrant: quadrant || null,
        distance: distance || null,
        notes: notes || null
    };

};

const getMovement = (originId, destinationId) => {

    const origin = getValue(originId);
    const destination = getValue(destinationId);

    const description =
        getValue(`${destinationId}Description`);

    if (!origin && !destination && !description) {
        return null;
    }

    return {
        origin: origin || null,
        destination: destination || null,
        description: description || null
    };
};

    const signTypeValue = signType.value;

    let referentRelation = null;
    let movementType = null;

    let handConfigurations = [];
    let orientations = [];

    let locations = [];

    let movementData = null;

    let manualConfiguration = "";
    let orientation = "";

    // ========================================
    // SEÑA MANUAL
    // ========================================

    if (signTypeValue === "manual") {

        referentRelation =
            getValue("referentRelation") || null;

        manualConfiguration =
            getValue("manualConfiguration");

        orientation =
            getOrientation("manualOrientation") || "";

            const manualLocation =
    getLocation("manualLocation");

if (manualLocation) {
    locations.push({
        hand: 1,
        ...manualLocation
    });
}

movementData = getMovement(
    "manualMovementOriginValue",
    "manualMovementDestinationValue"
);


        if (manualConfiguration) {
            handConfigurations.push({
                hand: 1,
                configuration: manualConfiguration
            });
        }

        if (orientation) {
            orientations.push({
                hand: 1,
                orientation: orientation
            });
        }

    }

    // ========================================
    // SEÑA BIMANUAL
    // ========================================

    if (signTypeValue === "bimanual") {

        movementType = getValue("bimanualType");

        referentRelation =
            getValue("bimanualReferentRelation") || null;

        if (movementType === "simetrica") {

            const configuration =
                getValue("symmetricConfiguration");

            const selectedOrientation =
                getOrientation("symmetricOrientation");

                const symmetricLocation =
    getLocation("symmetricLocation");

if (symmetricLocation) {
    locations.push({
        hand: 1,
        role: "ambas",
        ...symmetricLocation
    });
}

movementData = getMovement(
    "symmetricMovementOriginValue",
    "symmetricMovementDestinationValue"
);

            manualConfiguration = configuration;
            orientation = selectedOrientation || "";

            if (configuration) {

                handConfigurations.push(
                    {
                        hand: 1,
                        configuration: configuration
                    },
                    {
                        hand: 2,
                        configuration: configuration
                    }
                );

            }

            if (selectedOrientation) {

                orientations.push(
                    {
                        hand: 1,
                        orientation: selectedOrientation
                    },
                    {
                        hand: 2,
                        orientation: selectedOrientation
                    }
                );

            }

        }

        if (movementType === "asimetrica") {

            const baseConfiguration =
                getValue("baseHandConfiguration");

            const dominantConfiguration =
                getValue("dominantHandConfiguration");

            const baseOrientation =
                getOrientation("baseHandOrientation");

            const dominantOrientation =
                getOrientation("dominantHandOrientation");

            const baseLocation =
    getLocation("baseHandLocation");

const dominantLocation =
    getLocation("dominantHandLocation");

if (baseLocation) {
    locations.push({
        hand: 1,
        role: "base",
        ...baseLocation
    });
}

if (dominantLocation) {
    locations.push({
        hand: 2,
        role: "dominante",
        ...dominantLocation
    });
}

movementData = getMovement(
    "asymmetricMovementOriginValue",
    "asymmetricMovementDestinationValue"
);

            manualConfiguration =
                `Mano base: ${baseConfiguration}\nMano dominante: ${dominantConfiguration}`;

            orientation =
                `Mano base: ${baseOrientation || ""}\nMano dominante: ${dominantOrientation || ""}`;

            if (baseConfiguration) {
                handConfigurations.push({
                    hand: 1,
                    role: "base",
                    configuration: baseConfiguration
                });
            }

            if (dominantConfiguration) {
                handConfigurations.push({
                    hand: 2,
                    role: "dominante",
                    configuration: dominantConfiguration
                });
            }

            if (baseOrientation) {
                orientations.push({
                    hand: 1,
                    role: "base",
                    orientation: baseOrientation
                });
            }

            if (dominantOrientation) {
                orientations.push({
                    hand: 2,
                    role: "dominante",
                    orientation: dominantOrientation
                });
            }

        }

    }

    // ========================================
    // SEÑA COMPUESTA
    // ========================================

  if (signTypeValue === "compuesta") {

    referentRelation =
        getValue("compoundReferentRelation") || null;

    movementData = getMovement(
    "compoundMovementOriginValue",
    "compoundMovementDestinationValue"
);

    const elements =
        document.querySelectorAll(".compound-element");

    elements.forEach((element, index) => {

        const configuration =
            element.querySelector(
                ".compound-element-configuration"
            )?.value.trim() || "";

        const selectedOrientation =
            getOrientation(
                `compoundOrientation${index + 1}Value`
            );

            const selectedLocation =
    getLocation(
        `compoundLocation${index + 1}Value`
    );

if (selectedLocation) {

    locations.push({
        element: index + 1,
        ...selectedLocation
    });

}

        handConfigurations.push({
            element: index + 1,
            configuration: configuration
        });

        if (selectedOrientation) {

            orientations.push({
                element: index + 1,
                orientation: selectedOrientation
            });

        }

    });

    manualConfiguration =
        handConfigurations
            .map(element =>
                `Configuración ${element.element}: ${element.configuration}`
            )
            .join("\n");

    orientation =
        orientations
            .map(element =>
                `Configuración ${element.element}: ${element.orientation}`
            )
            .join("\n");

}

    return {

    signType: signTypeValue,

    meaning: getValue("signMeaning") || null,

    movementType,
    
    movement: movementData,

    referentRelation,

    handConfigurations,

    orientations,

    locations,

    manualConfiguration,

    orientation,

    nonManualFeatures:
        getValue("nonManualFeatures")

};

}


// ========================================
// FORMULARIO
// ========================================

signForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            signName.value.trim();


        const categoryId =
    signCategory.value
        ? Number(signCategory.value)
        : null;


        // ========================================
        // VALIDAR NOMBRE
        // ========================================

        if (!name) {

            alert(
                "Escribe el nombre de la seña."
            );

            signName.focus();

            return;
        }



        // ========================================
        // EVITAR SEÑAS REPETIDAS
        // ========================================

        const existingSign =
            signs.find(
                sign =>
                    sign.name
                        .toLocaleLowerCase("es") ===
                    name
                        .toLocaleLowerCase("es") &&
                    sign.id !== editingSignId
            );


        if (existingSign) {

            alert(
                "Ya existe una seña con ese nombre."
            );

            return;
        }


// ========================================
// RECOPILAR DATOS DE CLASIFICACIÓN
// ========================================

const classificationData =
    collectClassificationData();

 // ========================================
// CONSERVAR IMAGEN EXISTENTE
// ========================================

let image = null;


        // ========================================
        // EDITAR SEÑA EXISTENTE
        // ========================================

        if (
            editingSignId !== null
        ) {

            const sign =
                signs.find(
                    sign =>
                        sign.id ===
                        editingSignId
                );


            if (!sign) {

                alert(
                    "No se encontró la seña que quieres editar."
                );

                return;
            }


            // ----------------------------------------
            // ACTUALIZAR OBJETO LOCAL
            // ----------------------------------------

            sign.name =
                name;

            sign.categoryId =
                categoryId;

            sign.signType =
    classificationData.signType;

sign.movementType =
    classificationData.movementType;

sign.referentRelation =
    classificationData.referentRelation;

sign.handConfigurations =
    classificationData.handConfigurations;

sign.orientations =
    classificationData.orientations;

sign.locations =
    classificationData.locations;

    sign.movements =
    classificationData.movement;

    sign.meaning = classificationData.meaning;

sign.manualConfiguration =
    classificationData.manualConfiguration;

sign.orientation =
    classificationData.orientation;

sign.nonManualFeatures =
    classificationData.nonManualFeatures;


            // Solo reemplazar imagen
            // si se seleccionó una nueva

            if (
                image !== null
            ) {

                sign.image =
                    image;

            }


            // ----------------------------------------
            // PREPARAR DATOS PARA SUPABASE
            // ----------------------------------------

            const updateData = {

        name:
    sign.name,

meaning:
    sign.meaning || null,

category_id:
    sign.categoryId,

    // Conservar fotografía existente
    image:
        sign.image || null,

    // Clasificación
    sign_type:
        sign.signType || null,

    movement_type:
        sign.movementType || null,

    referent_relation:
        sign.referentRelation || null,

    hand_configurations:
        sign.handConfigurations.length > 0
            ? sign.handConfigurations
            : null,

    orientations:
        sign.orientations.length > 0
            ? sign.orientations
            : null,

            locations:
    sign.locations.length > 0
        ? sign.locations
        : null,

        movements:
    sign.movements || null,

    // Campos descriptivos
    manual_configuration:
        sign.manualConfiguration || null,

    orientation:
        sign.orientation || null,

    location:
        sign.location || null,

    movement:
        sign.movement || null,

    non_manual_features:
        sign.nonManualFeatures || null

};


            // ----------------------------------------
            // ACTUALIZAR EN SUPABASE
            // ----------------------------------------

            const {
                error
            } =
                await supabaseClient
                    .from("signs")
                    .update(
                        updateData
                    )
                    .eq(
                        "id",
                        sign.id
                    );


            if (error) {

                console.error(
                    "Error actualizando la seña en Supabase:",
                    error
                );

                alert(
                    "No se pudo actualizar la seña en Supabase."
                );

                return;
            }


            // ----------------------------------------
            // GUARDAR COPIA LOCAL
            // ----------------------------------------

            saveData();


            alert(
                `La seña "${name}" fue actualizada correctamente.`
            );

        } else {


            // ========================================
            // CREAR NUEVA SEÑA
            // ========================================

            const newSign = {

    id:
        getNextSignId(),

    name:
        name,

    meaning:
    classificationData.meaning,


    categoryId:
        categoryId,

    image:
        null,

    signType:
        classificationData.signType,

    movementType:
        classificationData.movementType,

    referentRelation:
        classificationData.referentRelation,

    handConfigurations:
        classificationData.handConfigurations,

    orientations:
        classificationData.orientations,

    locations:
    classificationData.locations,

    movements:
    classificationData.movement,

    manualConfiguration:
        classificationData.manualConfiguration,

    orientation:
        classificationData.orientation,

    location:
        null,

    movement:
        null,

    nonManualFeatures:
        classificationData.nonManualFeatures

};


            // ----------------------------------------
            // PREPARAR DATOS PARA SUPABASE
            // ----------------------------------------

            const supabaseSign = {
    id: newSign.id,
name: newSign.name,
meaning: newSign.meaning || null,
category_id: newSign.categoryId,
    image: newSign.image || null,

    sign_type: newSign.signType || null,
    movement_type: newSign.movementType || null,
    referent_relation: newSign.referentRelation || null,

    hand_configurations:
        newSign.handConfigurations.length > 0
            ? newSign.handConfigurations
            : null,

    orientations:
        newSign.orientations.length > 0
            ? newSign.orientations
            : null,

            locations:
    newSign.locations.length > 0
        ? newSign.locations
        : null,

        movements:
    newSign.movements || null,

    manual_configuration: newSign.manualConfiguration || null,
    orientation: newSign.orientation || null,
    location: newSign.location || null,
    movement: newSign.movement || null,
    non_manual_features: newSign.nonManualFeatures || null
};


            // ----------------------------------------
            // INSERTAR EN SUPABASE
            // ----------------------------------------

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("signs")
                    .insert(
                        supabaseSign
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Error guardando la seña en Supabase:",
                    error
                );

                alert(
                    "No se pudo guardar la seña en Supabase."
                );

                return;
            }


            // ----------------------------------------
            // AGREGAR A LA APLICACIÓN
            // ----------------------------------------

            signs.push(
                newSign
            );


            saveData();


            console.log(
                "Nueva seña guardada en Supabase:",
                data
            );


            alert(
                `La seña "${name}" fue guardada correctamente.`
            );

        }


        // ========================================
        // ACTUALIZAR INTERFAZ
        // ========================================

        renderCategories();


        closeModal();


        editingSignId =
            null;


        showCategory(
            categoryId
        );

    }
);





// ========================================
// CARGAR DATOS DESDE SUPABASE
// ========================================

async function loadDataFromSupabase() {

    const {
        data: categoriesData,
        error: categoriesError
    } = await supabaseClient
        .from("categories")
        .select("*")
        .order("id");

    if (categoriesError) {

        console.error(
            "Error cargando categorías desde Supabase:",
            categoriesError
        );

        return false;
    }


    const {
        data: signsData,
        error: signsError
    } = await supabaseClient
        .from("signs")
        .select("*")
        .order("id");

    if (signsError) {

        console.error(
            "Error cargando señas desde Supabase:",
            signsError
        );

        return false;
    }


    categories.length = 0;

    categories.push(
        ...categoriesData.map(
            category => ({

                id:
                    Number(category.id),

                name:
                    category.name,

                icon:
                    category.icon

            })
        )
    );


    signs.length = 0;

    signs.push(
        ...signsData.map(
            sign => ({

                id:
                    Number(sign.id),

                name:
                    sign.name,

                    meaning:
    sign.meaning || "",

                categoryId:
    sign.category_id === null
        ? null
        : Number(sign.category_id),

                image:
                    sign.image,

                manualConfiguration:
                    sign.manual_configuration,

                orientation:
                    sign.orientation,

                location:
                    sign.location,

                movement:
                    sign.movement,

                nonManualFeatures:
                    sign.non_manual_features,

                signType:
                    sign.sign_type,

                movementType:
                    sign.movement_type,

                referentRelation:
                    sign.referent_relation,

                handConfigurations:
    sign.hand_configurations,

orientations:
    sign.orientations,

locations:
    sign.locations || [],

movements:
    sign.movements || null

            })
        )
    );
    saveData();


    console.log(
        "Datos cargados desde Supabase correctamente."
    );

    return true;

}


// ========================================
// INICIALIZAR
// ========================================

async function initializeApp() {

    loadData();

    await loadEmojiDatabase();

    await testSupabaseConnection();

    await testSignsConnection();

    await loadDataFromSupabase();

    renderCategories();

    populateCategorySelect();


    console.log(
        "Manzana:",
        findEmoji("Manzana")
    );

    console.log(
        "Pan:",
        findEmoji("Pan")
    );

    console.log(
        "Azul:",
        findEmoji("Azul")
    );

    console.log(
        "Verde:",
        findEmoji("Verde")
    );

    console.log(
        "Hola:",
        findEmoji("Hola")
    );

    console.log(
        "Adiós:",
        findEmoji("Adiós")
    );

    showHomeView();

}

// ========================================
// EDITAR SEÑA
// ========================================

function editSign(signId) {

    const sign =
        signs.find(
            sign => sign.id === signId
        );

    if (!sign) {
        return;
    }

    editingSignId = signId;

    // ========================================
    // DATOS GENERALES
    // ========================================

    signName.value =
        sign.name || "";

        signMeaning.value =
    sign.meaning || "";

    signCategory.value =
        sign.categoryId || "";

    // ========================================
    // PREPARAR CLASIFICACIÓN
    // ========================================

    signType.value =
        sign.signType || "manual";

    signType.dispatchEvent(
        new Event("change")
    );

    const configurations =
        sign.handConfigurations || [];

    const orientations =
        sign.orientations || [];

    const locations =
    sign.locations || [];

    // ========================================
    // SEÑA MANUAL
    // ========================================

    if (signType.value === "manual") {

        document.getElementById("referentRelation").value =
            sign.referentRelation || "";

        document.getElementById("manualConfiguration").value =
            configurations[0]?.configuration ||
            sign.manualConfiguration || "";

        restoreOrientation(
            "manualOrientation",
            orientations[0]?.orientation ||
            sign.orientation || ""
        );

        const manualLocation =
    locations.find(item => item.hand === 1);

restoreLocation(
    "manualLocation",
    manualLocation
);

restoreMovement(
    "manualMovementOriginValue",
    "manualMovementDestinationValue",
    sign.movements
);

restoreMovement(
    "manualMovementOriginValue",
    "manualMovementDestinationValue",
    sign.movements
);

}



    // ========================================
    // SEÑA BIMANUAL
    // ========================================

    if (signType.value === "bimanual") {

        const bimanualType =
            document.getElementById("bimanualType");

        bimanualType.value =
            sign.movementType || "";

        bimanualType.dispatchEvent(
            new Event("change")
        );

        document.getElementById("bimanualReferentRelation").value =
            sign.referentRelation || "";

        // ------------------------------------
        // SIMÉTRICA
        // ------------------------------------

        if (sign.movementType === "simetrica") {

            document.getElementById("symmetricConfiguration").value =
                configurations[0]?.configuration ||
                sign.manualConfiguration || "";

            restoreOrientation(
                "symmetricOrientation",
                orientations[0]?.orientation ||
                sign.orientation || ""
            );

            const symmetricLocation =
    locations.find(item => item.role === "ambas");

restoreLocation(
    "symmetricLocation",
    symmetricLocation
);

restoreMovement(
    "symmetricMovementOriginValue",
    "symmetricMovementDestinationValue",
    sign.movements
);

        }

        // ------------------------------------
        // ASIMÉTRICA
        // ------------------------------------

        if (sign.movementType === "asimetrica") {

            const baseConfiguration =
                configurations.find(
                    item => item.role === "base"
                );

            const dominantConfiguration =
                configurations.find(
                    item => item.role === "dominante"
                );

            const baseOrientation =
                orientations.find(
                    item => item.role === "base"
                );

            const dominantOrientation =
                orientations.find(
                    item => item.role === "dominante"
                );

                const baseLocation =
    locations.find(
        item => item.role === "base"
    );

const dominantLocation =
    locations.find(
        item => item.role === "dominante"
    );

            document.getElementById("baseHandConfiguration").value =
                baseConfiguration?.configuration || "";

            document.getElementById("dominantHandConfiguration").value =
                dominantConfiguration?.configuration || "";

            restoreOrientation(
                "baseHandOrientation",
                baseOrientation?.orientation || ""
            );

            restoreOrientation(
                "dominantHandOrientation",
                dominantOrientation?.orientation || ""
            );

            restoreLocation(
    "baseHandLocation",
    baseLocation
);

restoreLocation(
    "dominantHandLocation",
    dominantLocation
);

restoreMovement(
    "asymmetricMovementOriginValue",
    "asymmetricMovementDestinationValue",
    sign.movements
);
        }
    }

    // ========================================
    // SEÑA COMPUESTA
    // ========================================

    if (signType.value === "compuesta") {

        document.getElementById("compoundReferentRelation").value =
            sign.referentRelation || "";

        const compoundElements =
            document.querySelectorAll(".compound-element");

        // Agregar los elementos que hagan falta

        const addButton =
            document.getElementById("addCompoundElement");

        while (
            document.querySelectorAll(".compound-element").length <
            configurations.length
        ) {
            addButton.click();
        }

        const elements =
            document.querySelectorAll(".compound-element");

        elements.forEach((element, index) => {

            const configuration =
                configurations[index];

            if (!configuration) {
                return;
            }

            element.querySelector(
    ".compound-element-configuration"
).value = configuration.configuration || "";

            const elementOrientation =
                orientations.find(
                    item => item.element === index + 1
                );

            restoreOrientation(
                `compoundOrientation${index + 1}Value`,
                elementOrientation?.orientation || ""
            );

            const elementLocation =
    locations.find(
        item => item.element === index + 1
    );

restoreLocation(
    `compoundLocation${index + 1}Value`,
    elementLocation
);

        });

        restoreMovement(
    "compoundMovementOriginValue",
    "compoundMovementDestinationValue",
    sign.movements
);
    }

    // ========================================
    // RASGOS NO MANUALES
    // ========================================

    const nonManualField =
        document.getElementById("nonManualFeatures");

    if (nonManualField) {
        nonManualField.value =
            sign.nonManualFeatures || "";
    }

 // ========================================
// ABRIR MODAL
// ========================================

signModal.classList.remove("hidden");

// Ocultar botón flotante
openAddModal.classList.add("hidden");

document.body.style.overflow = "hidden";

}

// ========================================
// ELIMINAR SEÑA
// ========================================

async function deleteSign(signId) {

    const sign =
        signs.find(
            sign =>
                sign.id === signId
        );


    if (!sign) {
        return;
    }


    // ========================================
    // CONFIRMAR ELIMINACIÓN
    // ========================================

    const confirmed =
        confirm(
            `¿Seguro que quieres eliminar la seña "${sign.name}"?`
        );


    if (!confirmed) {
        return;
    }


    // ========================================
    // ELIMINAR SEÑA
    // ========================================

const { error } =
    await supabaseClient
        .from("signs")
        .delete()
        .eq("id", signId);


if (error) {

    console.error(
        "Error eliminando la seña de Supabase:",
        error
    );

    alert(
        "No se pudo eliminar la seña de Supabase."
    );

    return;
}


const signIndex =
    signs.findIndex(
        sign =>
            sign.id === signId
    );


if (signIndex === -1) {
    return;
}


signs.splice(
    signIndex,
    1
);

saveData();


    // ========================================
    // ACTUALIZAR INTERFAZ
    // ========================================

    renderCategories();


    alert(
        `La seña "${sign.name}" fue eliminada correctamente.`
    );


    // ========================================
    // REGRESAR A LA VISTA ANTERIOR
    // ========================================

    if (
        previousSignView ===
        "dictionary"
    ) {

        showInternalView();

        categoryView.classList.add(
            "hidden"
        );

        signDetailView.classList.add(
            "hidden"
        );

        dictionaryView.classList.remove(
            "hidden"
        );

        renderDictionary(
            signs
        );

        return;
    }


    if (
        previousSignView ===
        "category" &&
        previousCategoryId !== null
    ) {

        showCategory(
            previousCategoryId
        );

        return;
    }


    showHomeView();

}

editSignButton.addEventListener(
    "click",
    () => {

        const signId =
            Number(
                signDetailView.dataset.signId
            );

        editSign(signId);

    }
);

deleteSignButton.addEventListener(
    "click",
    () => {

        const signId =
            Number(
                signDetailView.dataset.signId
            );

        deleteSign(signId);

    }
);




initializeApp();

// ========================================
// SELECTOR VISUAL DE ORIENTACIÓN
// ========================================

function createOrientationSelector(
    container,
    inputId
) {

    container.innerHTML = `

        <div class="orientation-selector">

            <label>
                Orientación
            </label>

            <div class="orientation-options">

                <button type="button" class="orientation-option" data-orientation="dorso_frente">
                    <span class="orientation-square dark"></span>
                    <span>Dorso al frente</span>
                </button>

                <button type="button" class="orientation-option" data-orientation="palma_frente">
                    <span class="orientation-square light"></span>
                    <span>Palma al frente</span>
                </button>

                <button type="button" class="orientation-option" data-orientation="dorso_arriba">
                    <span class="orientation-square half-horizontal-top"></span>
                    <span>Dorso arriba</span>
                </button>

                <button type="button" class="orientation-option" data-orientation="dorso_abajo">
                    <span class="orientation-square half-horizontal-bottom"></span>
                    <span>Dorso abajo</span>
                </button>

                <button type="button" class="orientation-option" data-orientation="dorso_izquierda">
                    <span class="orientation-square half-vertical-left"></span>
                    <span>Dorso izquierda</span>
                </button>

                <button type="button" class="orientation-option" data-orientation="dorso_derecha">
                    <span class="orientation-square half-vertical-right"></span>
                    <span>Dorso derecha</span>
                </button>

            </div>


            <input
                type="hidden"
                id="${inputId}"
                value=""
            >

        </div>

    `;

    const options =
        container.querySelectorAll(
            ".orientation-option"
        );

    const input =
        container.querySelector(
            `#${inputId}`
        );

    // ========================================
    // SELECCIONAR ORIENTACIÓN
    // ========================================

    options.forEach(option => {

        option.addEventListener("click", () => {

            options.forEach(item => {
                item.classList.remove("selected");
            });

            option.classList.add("selected");

            input.value =
                option.dataset.orientation;

            console.log(
                "Orientación seleccionada:",
                input.value
            );

        });

    });

    // ========================================
    // RESTAURAR ORIENTACIÓN GUARDADA
    // ========================================

    const savedOrientation =
        input.value;

    if (savedOrientation) {

        const selectedOption =
            container.querySelector(
                `[data-orientation="${savedOrientation}"]`
            );

        if (selectedOption) {
            selectedOption.classList.add("selected");
        }

    }

}

// ========================================
// RESTAURAR ORIENTACIÓN
// ========================================

function restoreOrientation(inputId, orientationValue) {

    const input =
        document.getElementById(inputId);

    if (!input || !orientationValue) {
        return;
    }

    input.value = orientationValue;

    const container =
        input.closest(".orientation-selector");

    if (!container) {
        return;
    }

    const selectedOption =
        container.querySelector(
            `[data-orientation="${orientationValue}"]`
        );

    if (selectedOption) {
        selectedOption.classList.add("selected");
    }

}


// ========================================
// RESTAURAR UBICACIÓN
// ========================================

function restoreLocation(inputId, locationData) {

    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    const selector =
        input.closest(".location-selector");

    if (!selector) {
        return;
    }

    const quadrant =
        locationData?.quadrant || "";

    input.value = quadrant;

    const options =
        selector.querySelectorAll("[data-location]");

    options.forEach(option => {

        option.classList.toggle(
            "selected",
            option.dataset.location === quadrant
        );

    });

    const distance =
        document.getElementById(`${inputId}Distance`);

    if (distance) {
        distance.value =
            locationData?.distance || "";
    }

    const notes =
        document.getElementById(`${inputId}Notes`);

    if (notes) {
        notes.value =
            locationData?.notes || "";
    }

}
    
// ========================================
// RESTAURAR MOVIMIENTO
// ========================================

function restoreMovement(
    originId,
    destinationId,
    movementData
) {

    if (!movementData) return;

    // RESTAURAR ORIGEN

    const originInput =
        document.getElementById(originId);

    if (originInput && movementData.origin) {

        originInput.value = movementData.origin;

        const originContainer =
            originInput.closest(".location-selector");

        const originOptions =
            originContainer.querySelectorAll("[data-movement]");

        originOptions.forEach(option => {

            option.classList.toggle(
                "selected",
                option.dataset.movement === movementData.origin
            );

        });
    }

        // RESTAURAR DESTINO

    const destinationInput =
        document.getElementById(destinationId);

    if (destinationInput && movementData.destination) {

        destinationInput.value = movementData.destination;

        const destinationContainer =
            destinationInput.closest(".location-selector");

        const destinationOptions =
            destinationContainer.querySelectorAll("[data-movement]");

        destinationOptions.forEach(option => {

            option.classList.toggle(
                "selected",
                option.dataset.movement === movementData.destination
            );

        });
    }

    // RESTAURAR DESCRIPCIÓN

    const description =
        document.getElementById(
            `${destinationId}Description`
        );

    if (description) {
        description.value =
            movementData.description || "";
    }


}



// ========================================
// SELECTOR VISUAL DE UBICACIÓN
// ========================================

function createLocationSelector(
    container,
    inputId
) {

    const quadrants = [
        "1", "2", "3",
        "4", "5", "6",
        "7", "8", "9"
    ];

    let gridHTML = "";

    quadrants.forEach(quadrant => {

        if (quadrant === "2" || quadrant === "5") {

            let subdivisions = "";

            for (let i = 1; i <= 9; i++) {

                subdivisions += `
                    <button
                        type="button"
                        class="location-subquadrant"
                        data-location="${quadrant}.${i}"
                    >
                        ${quadrant}.${i}
                    </button>
                `;

            }

            gridHTML += `
                <div class="location-quadrant subdivided">
                    <div class="location-subgrid">
                        ${subdivisions}
                    </div>
                </div>
            `;

        } else {

            gridHTML += `
                <button
                    type="button"
                    class="location-quadrant"
                    data-location="${quadrant}"
                >
                    ${quadrant}
                </button>
            `;

        }

    });

    container.innerHTML = `

        <div class="location-selector">

            <label>Ubicación</label>

            <p class="location-instruction">
                Selecciona el cuadrante donde se realiza la seña.
            </p>

            
            
            <div class="location-grid">
                ${gridHTML}
            </div>

            <div class="location-distance">

                <label for="${inputId}Distance">
                    Distancia con respecto al cuerpo
                </label>

                <select id="${inputId}Distance">

                    <option value="">
                        Selecciona una distancia
                    </option>

                    <option value="Pegada al cuerpo">
                        Pegada al cuerpo
                    </option>

                    <option value="A poca distancia del cuerpo">
                        A poca distancia del cuerpo
                    </option>

                    <option value="Algo alejada del cuerpo">
                        Algo alejada del cuerpo
                    </option>

                </select>

            </div>

            <div class="location-notes">

                <label for="${inputId}Notes">
                    Notas adicionales (opcional)
                </label>

                <textarea
                    id="${inputId}Notes"
                    placeholder="Describe algún detalle adicional de la ubicación..."
                    rows="2"
                ></textarea>

            </div>

            <input
                type="hidden"
                id="${inputId}"
                value=""
            >


        </div>

    `;

    const input =
        container.querySelector(`#${inputId}`);

    const options =
        container.querySelectorAll("[data-location]");

    options.forEach(option => {

        option.addEventListener("click", () => {

            options.forEach(item => {
                item.classList.remove("selected");
            });

            option.classList.add("selected");

            input.value =
                option.dataset.location;

            console.log(
                "Ubicación seleccionada:",
                input.value
            );

        });

    });

}


// ========================================
// SELECTOR VISUAL DE MOVIMIENTO
// ========================================

function createMovementSelector(
    container,
    inputId,
    title
) {

    const quadrants = [
        "1", "2", "3",
        "4", "5", "6",
        "7", "8", "9"
    ];

    let gridHTML = "";

    quadrants.forEach(quadrant => {

        if (quadrant === "2" || quadrant === "5") {

            let subdivisions = "";

            for (let i = 1; i <= 9; i++) {

                subdivisions += `
                    <button
                        type="button"
                        class="location-subquadrant"
                        data-movement="${quadrant}.${i}"
                    >
                        ${quadrant}.${i}
                    </button>
                `;
            }

            gridHTML += `
                <div class="location-quadrant subdivided">
                    <div class="location-subgrid">
                        ${subdivisions}
                    </div>
                </div>
            `;

        } else {

            gridHTML += `
                <button
                    type="button"
                    class="location-quadrant"
                    data-movement="${quadrant}"
                >
                    ${quadrant}
                </button>
            `;
        }

    });

    container.innerHTML = `

        <div class="location-selector">

            <label>${title}</label>

            <p class="location-instruction">
                Selecciona el cuadrante correspondiente.
            </p>

            <div class="location-grid">
                ${gridHTML}
            </div>

            <input
                type="hidden"
                id="${inputId}"
                value=""
            >

            ${title === "Punto de destino" ? `
    <div class="location-notes">
        <label for="${inputId}Description">
            Descripción del movimiento
        </label>

        <textarea
            id="${inputId}Description"
            placeholder="Describe cómo se realiza el movimiento..."
            rows="2"
        ></textarea>
    </div>
` : ""}

        </div>

    `;

    const input =
        container.querySelector(`#${inputId}`);

    const options =
        container.querySelectorAll("[data-movement]");

    options.forEach(option => {

        option.addEventListener("click", () => {

            options.forEach(item => {
                item.classList.remove("selected");
            });

            option.classList.add("selected");

            input.value =
                option.dataset.movement;

            console.log(
                "Punto de movimiento seleccionado:",
                input.value
            );

        });

    });

}
