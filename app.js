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
    "https://svhzyjifhezgxvqiyebl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_MhimkztuRxdhUi95Bg85aQ_Tws7E1z5";

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
// EXPORTAR DATOS
// ========================================

function exportData() {

    const data = {

        categories:
            categories,

        signs:
            signs

    };

    const json =
        JSON.stringify(
            data,
            null,
            4
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "glosario-lsm.json";

    link.click();

    URL.revokeObjectURL(
        url
    );

}

// ========================================
// IMPORTAR DATOS
// ========================================

function importData(file) {

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function () {

        try {

            const data =
                JSON.parse(
                    reader.result
                );

            if (
                !data ||
                !Array.isArray(
                    data.categories
                ) ||
                !Array.isArray(
                    data.signs
                )
            ) {

                alert(
                    "El archivo no tiene un formato de glosario válido."
                );

                return;
            }

            const confirmed =
                confirm(
                    "¿Quieres importar este glosario? Esto reemplazará las categorías y señas actuales."
                );

            if (!confirmed) {
                return;
            }

            categories.length = 0;

            categories.push(
                ...data.categories
            );

            signs.length = 0;

            signs.push(
                ...data.signs
            );

            saveData();

            alert(
                "El glosario fue importado correctamente."
            );

            location.reload();

        } catch (error) {

            console.error(
                "Error al importar el glosario:",
                error
            );

            alert(
                "No se pudo importar el archivo. Verifica que sea un archivo JSON válido."
            );

        }

    };

    reader.readAsText(
        file
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
// RESTAURAR DATOS ORIGINALES
// ========================================

function resetData() {

    const confirmed =
        confirm(
            "¿Seguro que quieres restaurar los datos originales? Se perderán las señas y categorías que hayas creado o modificado."
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        SIGNS_STORAGE_KEY
    );

    localStorage.removeItem(
        CATEGORIES_STORAGE_KEY
    );

    location.reload();
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

const resetDataButton =
    document.getElementById(
        "resetDataButton"
    );

    const exportDataButton =
    document.getElementById(
        "exportDataButton"
    );

const importDataButton =
    document.getElementById(
        "importDataButton"
    );

const importFileInput =
    document.getElementById(
        "importFileInput"
    );

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

const signImage =
    document.getElementById("signImage");

const manualConfiguration =
    document.getElementById(
        "manualConfiguration"
    );

const orientation =
    document.getElementById("orientation");

const locationField =
    document.getElementById("location");

const movement =
    document.getElementById("movement");

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

    document.body.classList.add(
        "internal-view"
    );

    searchSection.classList.add(
        "hidden"
    );

    categoriesSection.classList.add(
        "hidden"
    );

    dictionarySection.classList.add(
        "hidden"
    );
}


// ========================================
// VOLVER A INICIO
// ========================================

function showHomeView() {

    document.body.classList.remove(
        "internal-view"
    );

    mainHeader.classList.remove(
        "hidden"
    );

    searchSection.classList.remove(
        "hidden"
    );

    categoriesSection.classList.remove(
        "hidden"
    );

    dictionarySection.classList.remove(
        "hidden"
    );

    categoryView.classList.add(
        "hidden"
    );

    dictionaryView.classList.add(
        "hidden"
    );

    signDetailView.classList.add(
        "hidden"
    );

    searchInput.value = "";

    dictionarySearch.value = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// MOSTRAR CATEGORÍAS
// ========================================

function renderCategories() {

    categoriesContainer.innerHTML = "";

    categories.forEach(category => {

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
// MOSTRAR UNA CATEGORÍA
// ========================================

function showCategory(categoryId) {

    const category =
        categories.find(
            category =>
                category.id === categoryId
        );


    if (!category) return;


    const filteredSigns =
        signs.filter(
            sign =>
                sign.categoryId ===
                categoryId
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
                category.id ===
                sign.categoryId
        );


    if (!category) return;


    // ========================================
    // INFORMACIÓN PRINCIPAL
    // ========================================

    signDetailCategory.textContent =
        category.name;


    signDetailTitle.textContent =
        sign.name;


    // ========================================
    // ELEMENTO VISUAL
    // PRIORIDAD:
    // 1. EMOJI
    // 2. IMAGEN
    // 3. NADA
    // ========================================

    const emoji =
        findEmoji(
            sign.name
        );


    if (emoji) {

        signDetailImage.innerHTML = `

            <span class="sign-detail-emoji">
                ${emoji}
            </span>

        `;

    } else if (sign.image) {

        signDetailImage.innerHTML = `

            <img
                src="${sign.image}"
                alt="Seña de ${sign.name}"
            >

        `;

    } else {

        signDetailImage.innerHTML = "";

    }


    // ========================================
    // INFORMACIÓN DE LA SEÑA
    // ========================================

    signDetailManualConfiguration.textContent =
        sign.manualConfiguration ||
        "No especificada.";


    signDetailOrientation.textContent =
        sign.orientation ||
        "No especificada.";


    signDetailLocation.textContent =
        sign.location ||
        "No especificada.";


    signDetailMovement.textContent =
        sign.movement ||
        "No especificado.";


    signDetailNonManualFeatures.textContent =
        sign.nonManualFeatures ||
        "No especificados.";


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
// BUSCADOR PRINCIPAL
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .toLocaleLowerCase("es")
                .trim();


        if (!search) {

            showHomeView();

            return;
        }


        const filteredSigns =
            signs.filter(sign => {

                const category =
                    categories.find(
                        category =>
                            category.id ===
                            sign.categoryId
                    );


                return (

                    sign.name
                        .toLocaleLowerCase("es")
                        .includes(search)

                    ||

                    (
                        category &&

                        category.name
                            .toLocaleLowerCase("es")
                            .includes(search)
                    )

                );

            });


        showInternalView();


        categoryView.classList.add(
            "hidden"
        );

        dictionaryView.classList.remove(
            "hidden"
        );

        signDetailView.classList.add(
            "hidden"
        );


        dictionarySearch.value =
            search;


        renderDictionary(
            filteredSigns
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


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
            Selecciona una categoría
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
        "Error guardando la categoría en Supabase:",
        error
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

    // ========================================
    // MODO CREAR
    // ========================================

    editingSignId = null;


    signForm.reset();


    signModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    populateCategorySelect();

}


// ========================================
// CERRAR MODAL
// ========================================

function closeModal() {

    signModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";


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
// FORMULARIO
// ========================================

signForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            signName.value.trim();


        const categoryId =
            Number(
                signCategory.value
            );


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
        // VALIDAR CATEGORÍA
        // ========================================

        if (!categoryId) {

            alert(
                "Selecciona una categoría."
            );

            signCategory.focus();

            return;
        }


        const category =
            categories.find(
                category =>
                    category.id ===
                    categoryId
            );


        if (!category) {

            alert(
                "La categoría seleccionada no existe."
            );

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
        // LEER IMAGEN
        // ========================================

        let image = null;


        try {

            image =
                await readImageFile(
                    signImage.files[0]
                );

        } catch (error) {

            console.error(
                "Error leyendo la imagen:",
                error
            );

            alert(
                "No se pudo cargar la imagen."
            );

            return;
        }


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

            sign.manualConfiguration =
                manualConfiguration.value.trim();

            sign.orientation =
                orientation.value.trim();

            sign.location =
                locationField.value.trim();

            sign.movement =
                movement.value.trim();

            sign.nonManualFeatures =
                nonManualFeatures.value.trim();


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

                category_id:
                    sign.categoryId,

                image:
                    sign.image || null,

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

                categoryId:
                    categoryId,

                image:
                    image,

                manualConfiguration:
                    manualConfiguration.value.trim(),

                orientation:
                    orientation.value.trim(),

                location:
                    locationField.value.trim(),

                movement:
                    movement.value.trim(),

                nonManualFeatures:
                    nonManualFeatures.value.trim()

            };


            // ----------------------------------------
            // PREPARAR DATOS PARA SUPABASE
            // ----------------------------------------

            const supabaseSign = {

                id:
                    newSign.id,

                name:
                    newSign.name,

                category_id:
                    newSign.categoryId,

                image:
                    newSign.image || null,

                manual_configuration:
                    newSign.manualConfiguration || null,

                orientation:
                    newSign.orientation || null,

                location:
                    newSign.location || null,

                movement:
                    newSign.movement || null,

                non_manual_features:
                    newSign.nonManualFeatures || null

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

                categoryId:
                    Number(sign.category_id),

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
                    sign.non_manual_features

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

}

// ========================================
// EDITAR SEÑA
// ========================================

function editSign(signId) {

    const sign =
        signs.find(
            sign =>
                sign.id === signId
        );

    if (!sign) {
        return;
    }


    // Guardar qué seña estamos editando

    editingSignId =
        signId;


    // ========================================
    // CARGAR DATOS EN EL FORMULARIO
    // ========================================

    signName.value =
        sign.name || "";


    signCategory.value =
        sign.categoryId || "";


    manualConfiguration.value =
        sign.manualConfiguration || "";


    orientation.value =
        sign.orientation || "";


    locationField.value =
        sign.location || "";


    movement.value =
        sign.movement || "";


    nonManualFeatures.value =
        sign.nonManualFeatures || "";


    // ========================================
    // ABRIR MODAL
    // ========================================

    signModal.classList.remove(
        "hidden"
    );

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

resetDataButton.addEventListener(
    "click",
    resetData
);

exportDataButton.addEventListener(
    "click",
    exportData
);

importDataButton.addEventListener(
    "click",
    () => {

        importFileInput.click();

    }
);

importFileInput.addEventListener(
    "change",
    () => {

        const file =
            importFileInput.files[0];

        importData(
            file
        );

        importFileInput.value =
            "";

    }
);



initializeApp();

