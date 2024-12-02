const produtos = [
    {
        concepto: "Teclado",
        pu: 60
    },
    {
        concepto: "Monitor",
        pu: 120
    },
    {
        concepto: "Ratón",
        pu: 30
    },
    {
        concepto: "Ordenador",
        pu: 800
    },
    {
        concepto: "Escritorio",
        pu: 100
    }
];


/**
 * Permite crear elementos para ser agregados al DOM
 * @param {String} tipo del elemento que se quiere crear
 * @param {Object} atributos que tendrá el elemento. Ej.: id, src, href, etc.
 * @param {Array} clases que tendrá el elemento
 * @returns 
 */
function crear(tipo, atributos = {}, clases = []) {
    let elemento = document.createElement(tipo);

    if (clases.length!=0) {
        elemento.classList.add(...clases);
    }
    
    if (Object.keys(atributos).length!=0) {
        Object.entries(atributos).forEach(([clave, valor])=>{
            elemento.setAttribute(clave, valor);
        });
    }

    return elemento;
}


// ==================== SECCIÓN DE PRODUCTOS: Tabla y filtro ====================
/**
 * Filtra productos por concepto
 */
function filtro() {
    let contenedor = crear("div", {id:"content-filtro"});
    let titulo = crear("p", {id:"titulo-filtro"});
    let input = crear("input", {type:"text", id:"filtro", placeholder:"Ingresa el concepto a buscar", style:"width:300px;"});
    let enviar = crear("button", {id:"enviar-filtro", style:"margin-left:5px;"});
    let todos = crear("button", {id:"todos-filtro", style:"margin-left:5px;"});

    document.querySelector("body").insertBefore(contenedor, document.querySelector("script"));
    contenedor.append(titulo, input, enviar, todos);
    titulo.append("Permite filtrar productos según su concepto");
    enviar.append("Buscar");
    todos.append("Todos");

    enviar.addEventListener("click", (x)=>{
        let tabla = document.querySelector("#content-productos");
        tabla.remove(); // Borramos lo que había en la tabla
        construct_tabla(); // Se vuelve a contruir

        let boton = document.querySelector("#" + x.target.id);
        let concepto = boton.parentNode.querySelector("input").value.toLowerCase();
        let producto = null;
        
        produtos.forEach((objeto)=>{
            Object.values(objeto).forEach((valor)=>{
                if (String(valor).toLowerCase()==concepto) {
                    producto = objeto;
                }
            });
        });

        if (producto!=null) {
            pintaProductos([producto]);
        }
        
    });


    todos.addEventListener("click", ()=>{
        let tabla = document.querySelector("#content-productos");
        tabla.remove(); // Borramos lo que había en la tabla
        construct_tabla();
        pintaProductos(produtos);

        let aux = document.querySelector("#content-factura");
        if (aux!=null) {
            aux.remove();
            document.querySelector("#content-descuentos").remove();
            document.querySelector("#content-total").remove();
        }


    });
}


/**
 * Añade productos a la tabla con su respectivo botón de agregar a la factura
 */
function pintaProductos(lista) {
    let tabla = document.querySelector("#tabla-productos");

    for (let i = 0; i < lista.length; i++) {
        let tr = crear("tr");

        // Añade los valores del objeto
        Object.values(lista[i]).forEach((valor)=>{
            let td = crear("td");
            td.append(valor);
            tr.append(td);
        });

        // Añade el botón de "agregar a factura"
        let agregar = crear("button", {id:lista[i].concepto});
        agregar.append("Agregar");

        agregar.addEventListener("click", (boton)=>{
            boton.target.setAttribute("disabled", "disabled");
            gestionaFactura(boton);
        });

        tr.append(agregar);
        tabla.append(tr);
    }
}


/**
 * Crea la tabla de productos disponibles: Concepto, PU, botón
 */
function construct_tabla() {
    let contenedor = crear("div", {id:"content-productos", style:"margin-top:20px;"});
    let tabla = crear("table", {id:"tabla-productos", style:"width:300px;text-align:center;"});
    let cabeceras = ["Concepto", "P.U"];
    
    // Construye cabeceras
    let tr = crear("tr");
    for (let i = 0; i < cabeceras.length; i++) {
        let th = crear("th");
        th.append(cabeceras[i]);
        tr.append(th);
    }
    let th = crear("th"); // Reserva el espacio para el botón de "agregar a factura"
    
    document.querySelector("body").insertBefore(contenedor, document.querySelector("script"));
    contenedor.append(tabla);
    tabla.append(tr);
    tr.append(th);
}


// ==================== SECCIÓN DE FACTURAS: Tabla y total ====================

/**
 * Calcula y muestra el total de la factura
 * 1. 20% en el total si el cliente es una empresa
 * 2. 25% por Black Friday, solo entre el 15 de noviembre y el 5 de diciembre
 */
function calcularTotal(BlackFriday, entidadEmpresa){
    let existe = document.querySelector("#content-total");
    let p;
    let total = 0;
    let factura = document.querySelector("#tabla-factura");
    let importes = factura.querySelectorAll(".importe");

    // Crea el contenedor si no existe
    if (existe==null) {
        let contenedor = crear("div", {id:"content-total"});
        let titulo = crear("p");
        p = crear("p", {id:"total"});
    
        document.querySelector("body").insertBefore(contenedor, document.querySelector("script"));
        contenedor.append(titulo, p);
        titulo.append("TOTAL:");
        p.append("0");

    }else {
        p = document.querySelector("#total");
    }

    importes.forEach((x)=>{
        total += Number(x.textContent);
    });

    // Cuándo la entidad es una empresa
    if (entidadEmpresa) {

        if (BlackFriday) {
            alert("No se aplicará descuento de empresa si no que se aplicará un 25% por el black Friday");
            total = total-(total*0.25);
        }else {
            alert("Se aplicó un descuento del 20% por ser empresa");
            total = total-(total*0.20);
        }
    }else if (BlackFriday) {
        alert("Se aplicó un descuento del 25% por black Friday");
        total = total-(total*0.25);
    }

    p.textContent = total;
}


/**
 * Gestiona los descuentos a aplicar
 */
function gestionDescuentos() {
    let contenedor = crear("div", {id:"content-descuentos", style:"margin-top:25px;"});
    let titulo = crear("p");
    let empresa = crear("input", {type:"radio", id:"empresa", name:"entidad"});
    let particular = crear("input", {type:"radio", id:"particular", name:"entidad"});
    let empresa_span = crear("span");
    let particular_span = crear("span");
    let enviar = crear("button", {id:"calcTotal", style:"margin-top:25px;", disabled:"disabled"});
    let actual = new Date();
    let incio = new Date(actual.getFullYear()+"-11-15");
    let fin = new Date(actual.getFullYear()+"-12-05");
    let BlackFriday = false;
    let entidadEmpresa = false;

    document.querySelector("body").insertBefore(contenedor, document.querySelector("script"));
    contenedor.append(titulo, empresa, empresa_span, particular, particular_span, crear("br"), enviar);
    titulo.append("Selecciona el tipo de entidad para calcular el total: ");
    empresa_span.append("Empresa");
    particular_span.append("Particular");
    enviar.append("Calcular");

    if ((actual >= incio && actual <= fin)) {
        BlackFriday = true;
    }

    empresa.addEventListener("click", (x)=>{
        entidadEmpresa = true;
        document.querySelector("#calcTotal").removeAttribute("disabled");
    });

    particular.addEventListener("click", (x)=>{
        entidadEmpresa = false;
        document.querySelector("#calcTotal").removeAttribute("disabled");
    });

    enviar.addEventListener("click", ()=>{
        calcularTotal(BlackFriday, entidadEmpresa);
        enviar.setAttribute("disabled", "disabled");
    });
}


/**
 * Gestiona el botón de "+"
 */
function gestionMas(boton){
    boton = boton.target.className;
    let fila = document.querySelector("."+boton).parentNode;
    let cant = fila.querySelector(".cantidad");
    let imprt = fila.querySelector(".importe");
    let pu = fila.querySelector("#pu").textContent;

    if (cant==0) {
        cant.textContent = 1;
        imprt.textContent = pu;
    }else {
        cant.textContent = Number(cant.textContent)+1;
        imprt.textContent = Number(imprt.textContent)+Number(pu);
    }

    let aux = document.querySelector("#empresa");
    let aux2 = document.querySelector("#particular");

    if (aux.checked || aux2.checked) {
        document.querySelector("#calcTotal").removeAttribute("disabled");
    }
}


/**
 * Gestiona el botón de "-"
 */
function gestionMenos(boton){
    boton = boton.target.className;
    let fila = document.querySelector("."+boton).parentNode;
    let cant = fila.querySelector(".cantidad");
    let imprt = fila.querySelector(".importe");
    let pu = fila.querySelector("#pu").textContent;

    if (cant.textContent!=0) {
        cant.textContent = Number(cant.textContent)-1;
        imprt.textContent = Number(imprt.textContent)-Number(pu);
    }

    let aux = document.querySelector("#empresa");
    let aux2 = document.querySelector("#particular");

    if (aux.checked || aux2.checked) {
        document.querySelector("#calcTotal").removeAttribute("disabled");
    }
    
}


/**
 * @param {object} boton del producto que se quiere agregar a la factura
 * Gestiona como se pintan las facturas
 */
function gestionaFactura(boton){
    let existe = document.querySelector("#content-factura");
    boton = boton.target.id;
    let fila = document.querySelector("#"+boton).parentNode;
    let concepto = fila.firstChild.textContent.toLowerCase();
    let producto = null;
    
    // Busca el objeto que coincida con el concepto
    produtos.forEach((objeto)=>{
        Object.values(objeto).forEach((valor)=>{
            if (String(valor).toLowerCase()==concepto) {
                producto = objeto;
            }
        });
    });

    // Crea productos y los añade a la tabla de facturas
    const creaProducto = (producto)=>{
        let tabla = document.querySelector("#tabla-factura");

        let tr = crear("tr");

        // Añade los valores del objeto
        Object.entries(producto).forEach(([clave, valor])=>{
            let td = crear("td", {id:clave});
            td.append(valor);
            tr.append(td);
        });

        let cant = crear("td", {}, ["cantidad"]);
        let imprt = crear("td",{}, ["importe"]);
        cant.append("1");
        imprt.append(producto.pu);

        tr.append(cant, imprt);

        // Añade el botón de "+" y "-"
        let mas = crear("button", {}, [producto.concepto]);
        let menos = crear("button", {}, [producto.concepto]);

        mas.append("+");
        mas.addEventListener("click", gestionMas);

        menos.append("-");
        menos.addEventListener("click", gestionMenos);

        tr.append(mas, menos);
        tabla.append(tr);
    }

    // Gestiona como se muestra la factura
    if (existe==null) {
        construct_factura();
        creaProducto(producto);
        gestionDescuentos();
    }else {
        creaProducto(producto);
    }
}


/**
 * Crea una tabla para la factura: Concepto, cantidad, PU, importe, botón +, botón -
 */
function construct_factura() {
    let contenedor = crear("div", {id:"content-factura", style:"margin-top:20px;"});
    let tabla = crear("table", {id:"tabla-factura", style:"width:300px;text-align:center;"});
    let cabeceras = ["Concepto", "P.U", "cantidad", "importe"];
    let reinicar = crear("button", {id:"reiniciar", style:"margin-top:30px;"});

    // Construye cabeceras
    let tr = crear("tr");
    for (let i = 0; i < cabeceras.length; i++) {
        let th = crear("th");
        th.append(cabeceras[i]);
        tr.append(th);
    }

    let res1 = crear("th"); // Reserva el espacio para el botón +
    let res2 = crear("th"); // Reserva el espacio para el botón -
    
    document.querySelector("body").insertBefore(contenedor, document.querySelector("script"));
    contenedor.append(tabla, reinicar);
    tabla.append(tr);
    tr.append(res1, res2);
    reinicar.append("Vaciar Factura");
    reinicar.addEventListener("click", ()=>{
        location.reload();
    });
}


// ==================== INICIO ====================
/**
 * Gestiona que funciones se inicializan al ejecutar el programa
 */
function incio() {
    filtro();
    construct_tabla();
    pintaProductos(produtos);
}

incio();