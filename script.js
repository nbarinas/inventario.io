$(document).ready(function () {
    let itemCount = 0;

    // Manejo del formulario de inicio de sesión
    $('#loginForm').submit(function(event) {
        event.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        // Validación básica, cambiar por una validación segura en producción
        if (username === 'usuario' && password === 'contraseña') {
            $('#loginForm').hide();
            $('#inventoryContent').show();
            initializeInventory(); // Función para inicializar el contenido del inventario
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    });

    // Agregar un ítem inicial al cargar la página
    addItemRow();

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

    // Función para agregar una nueva fila de ítem al formulario
    function addItemRow() {
        itemCount++;
        const tr = $('<tr>');

        const tdItem = $('<td>');
        const selectItem = $('<select>').attr('name', `item_${itemCount}`).addClass('item-select');
        // Agregar opción predeterminada
        selectItem.append($('<option>').attr('value', '').text('Seleccione un item'));
        // Agregar productos
        productos.forEach(product => {
            const option = $('<option>').attr('value', product.id).text(product.name);
            selectItem.append(option);
        });
        tdItem.append(selectItem);
        tr.append(tdItem);

        const tdQuantity = $('<td>');
        const inputQuantity = $('<input>').attr('type', 'number').attr('name', `quantity_${itemCount}`).val(0);
        tdQuantity.append(inputQuantity);
        tr.append(tdQuantity);

        const tdWarehouse = $('<td>');
        const selectWarehouse = $('<select>').attr('name', `warehouse_${itemCount}`).addClass('warehouse-select');
        // Agregar opción predeterminada
        selectWarehouse.append($('<option>').attr('value', '').text('Seleccione una bodega'));
        // Agregar bodegas
        ['San Victorino', 'Calle 6', 'San Jose', 'OficeMax'].forEach(bodega => {
            const option = $('<option>').attr('value', bodega).text(bodega);
            selectWarehouse.append(option);
        });
        tdWarehouse.append(selectWarehouse);
        tr.append(tdWarehouse);

        const tdLocation = $('<td>');
        const selectLocation = $('<select>').attr('name', `location_${itemCount}`).addClass('location-select');
        // Agregar opción predeterminada
        selectLocation.append($('<option>').attr('value', '').text('Seleccione una ubicación'));
        // Agregar ubicaciones
        ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'].forEach(location => {
            const option = $('<option>').attr('value', location).text(location);
            selectLocation.append(option);
        });
        tdLocation.append(selectLocation);
        tr.append(tdLocation);

        $('#inventoryTableBody').append(tr);

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

    // Función para inicializar el contenido del inventario
    function initializeInventory() {
        // Ocultar formulario de inicio de sesión y mostrar contenido del inventario
        $('#loginForm').hide();
        $('#inventoryContent').show();
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
