$(document).ready(function () {
    let itemCount = 0;

    // Verificar si el usuario está logeado al cargar la página
    checkLoggedIn();

    // Manejo del formulario de inicio de sesión
    $('#loginForm').submit(function(event) {
        event.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        // Validación básica, cambiar por una validación segura en producción
        if (username === 'usuario' && password === 'contraseña') {
            // Guardar el estado de sesión en localStorage
            localStorage.setItem('loggedIn', true);

            $('#loginForm').hide();
            $('#inventoryContent').show();
            initializeInventory(); // Función para inicializar el contenido del inventario
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    // Función para verificar y mantener la sesión activa al cargar la página
    function checkLoggedIn() {
        const loggedIn = localStorage.getItem('loggedIn');
        if (loggedIn) {
            $('#loginForm').hide();
            $('#inventoryContent').show();
            initializeInventory(); // Cargar datos del inventario si el usuario está logeado
        }
    }

    // Función para inicializar el contenido del inventario
    function initializeInventory() {
        // Cargar datos del inventario desde localStorage si están disponibles
        const savedInventory = JSON.parse(localStorage.getItem('savedInventory'));
        if (savedInventory && savedInventory.length > 0) {
            savedInventory.forEach(item => {
                addItemRow(item);
            });
        } else {
            // Si no hay datos guardados, agregar un ítem inicial
            addItemRow();
        }
    }

    // Agregar un ítem al hacer clic en el botón
    $('#addItemButton').click(function () {
        if (!validatePreviousItem()) {
            return;
        }

        addItemRow();
    });

    // Validación del formulario de inventario antes de enviarlo
    $('#inventoryForm').submit(function (event) {
        if (!validatePreviousItem()) {
            event.preventDefault();
        } else {
            // Guardar los datos del inventario en localStorage
            const inventoryData = getInventoryData();
            localStorage.setItem('savedInventory', JSON.stringify(inventoryData));
        }
    });

    // Función para validar el ítem anterior antes de agregar uno nuevo
    function validatePreviousItem() {
        const lastItemRow = $('#inventoryTableBody tr:last');
        if (lastItemRow.length > 0) {
            const quantity = lastItemRow.find('input[type="number"]').val();
            const warehouse = lastItemRow.find('.warehouse-select').val();
            const location = lastItemRow.find('.location-select').val();

            if (parseInt(quantity) === 0 || warehouse === '' || location === '') {
                alert('Complete la cantidad, bodega y ubicación del ítem anterior antes de agregar uno nuevo.');
                return false;
            }
        }
        return true;
    }

    // Función para obtener los datos del inventario
    function getInventoryData() {
        const inventoryData = [];
        $('#inventoryTableBody tr').each(function() {
            const item = $(this).find('.item-select').val();
            const quantity = $(this).find('input[type="number"]').val();
            const warehouse = $(this).find('.warehouse-select').val();
            const location = $(this).find('.location-select').val();

            inventoryData.push({
                item: item,
                quantity: quantity,
                warehouse: warehouse,
                location: location
            });
        });
        return inventoryData;
    }

    // Función para agregar una nueva fila de ítem al formulario
    function addItemRow(itemData = null) {
        itemCount++;
        const tr = $('<tr>');

        const tdItem = $('<td>');
        const selectItem = $('<select>').attr('name', `item_${itemCount}`).addClass('item-select');
        // Agregar opción predeterminada
        selectItem.append($('<option>').attr('value', '').text('Seleccione un item'));
        // Agregar productos desde productos.js
        productos.forEach(product => {
            const option = $('<option>').attr('value', product.id).text(product.name);
            selectItem.append(option);
        });
        tdItem.append(selectItem);
        tr.append(tdItem);

        const tdQuantity = $('<td>');
        const inputQuantity = $('<input>').attr('type', 'number').attr('name', `quantity_${itemCount}`).val(itemData ? itemData.quantity : 0);
        tdQuantity.append(inputQuantity);
        tr.append(tdQuantity);

        const tdWarehouse = $('<td>');
        const selectWarehouse = $('<select>').attr('name', `warehouse_${itemCount}`).addClass('warehouse-select');
        // Agregar opción predeterminada
        selectWarehouse.append($('<option>').attr('value', '').text('Seleccione una bodega'));
        // Agregar bodegas (reemplaza con tu propia lógica)
        ['San Victorino', 'Calle 6', 'San Jose', 'OficeMax'].forEach(warehouse => {
            const option = $('<option>').attr('value', warehouse).text(warehouse);
            selectWarehouse.append(option);
        });
        tdWarehouse.append(selectWarehouse);
        tr.append(tdWarehouse);

        const tdLocation = $('<td>');
        const selectLocation = $('<select>').attr('name', `location_${itemCount}`).addClass('location-select');
        // Agregar opción predeterminada
        selectLocation.append($('<option>').attr('value', '').text('Seleccione una ubicación'));
        // Agregar ubicaciones (reemplaza con tu propia lógica)
        ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'].forEach(location => {
            const option = $('<option>').attr('value', location).text(location);
            selectLocation.append(option);
        });
        tdLocation.append(selectLocation);
        tr.append(tdLocation);

        $('#inventoryTableBody').append(tr);

        // Asignar valores a los selectores si se proporcionan datos de ítem
        if (itemData) {
            selectItem.val(itemData.item);
            selectWarehouse.val(itemData.warehouse);
            selectLocation.val(itemData.location);
        }

        // Inicializar Select2 en el nuevo select con configuraciones adicionales para dispositivos móviles
        selectItem.select2({
            dropdownAutoWidth: true, // Ajustar el ancho del menú desplegable automáticamente
            width: '100%', // Ancho completo en dispositivos móviles
            minimumInputLength: 0, // Permitir búsqueda desde el primer carácter
            minimumResultsForSearch: 10 // Mostrar la barra de búsqueda después de 10 resultados
        });
        selectWarehouse.select2({
            dropdownAutoWidth: true,
            width: '100%',
        });
        selectLocation.select2({
            dropdownAutoWidth: true,
            width: '100%',
        });

        // Ajustar el estilo para la búsqueda en dispositivos móviles
        $('.select2-search__field').css('width', '100%'); // Ajustar el ancho del campo de búsqueda
    }

    // Exportar a Excel (CSV)
    $('#exportToExcel').click(function() {
        exportToExcel();
    });

    // Función para exportar a Excel
    function exportToExcel() {
        // Crear CSV con los datos del formulario
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Item,Cantidad,Bodega,Ubicación\n";

        $('#inventoryTableBody tr').each(function() {
            const item = $(this).find('.item-select').val();
            const quantity = $(this).find('input[type="number"]').val();
            const warehouse = $(this).find('.warehouse-select').val();
            const location = $(this).find('.location-select').val();

            csvContent += `"${item}","${quantity}","${warehouse}","${location}"\n`;
        });

        // Crear un objeto Blob para el contenido CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Crear un elemento de descarga y simular un clic para descargar el archivo
        const link = document.createElement("a");
        if (link.download !== undefined) { // Verificar si el atributo download es soportado
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "inventario.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('La descarga automática no es soportada por su navegador. Por favor, haga clic en el botón "Exportar a Excel" para descargar el archivo.');
        }
    }
});
