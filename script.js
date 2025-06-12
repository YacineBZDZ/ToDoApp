$(document).ready(function() {
    let fieldCount = 0;
    let fieldsMeta = [];

    function renderFields() {
        $('#fields').empty();
        fieldsMeta.forEach(function(field, idx) {
            let html = '<div class="field-row" data-idx="' + idx + '">';
            html += '<label>Field name: <input type="text" class="field-name" value="' + (field.name || '') + '" /></label>';
            if (field.type === 'text') {
                html += '<input type="text" class="field-value" placeholder="Enter value" />';
            } else if (field.type === 'select') {
                html += '<select class="field-value">';
                html += '<option value="Option 1">Option 1</option>';
                html += '<option value="Option 2">Option 2</option>';
                html += '<option value="Option 3">Option 3</option>';
                html += '</select>';
            }
            html += '<button type="button" class="removeField">Remove</button>';
            html += '</div>';
            $('#fields').append(html);
        });
    }

    $('#addText').click(function() {
        fieldsMeta.push({type: 'text', name: ''});
        renderFields();
    });

    $('#addSelect').click(function() {
        fieldsMeta.push({type: 'select', name: ''});
        renderFields();
    });

    $('#fields').on('click', '.removeField', function() {
        let idx = $(this).closest('.field-row').data('idx');
        fieldsMeta.splice(idx, 1);
        renderFields();
    });

    $('#fields').on('input', '.field-name', function() {
        let idx = $(this).closest('.field-row').data('idx');
        fieldsMeta[idx].name = $(this).val();
    });

    $('#customForm').submit(function(e) {
        e.preventDefault();
        let headers = [];
        let values = [];
        let valid = true;
        $('#fields .field-row').each(function(idx) {
            let name = $(this).find('.field-name').val().trim();
            let value = $(this).find('.field-value').val();
            if (!name) valid = false;
            headers.push(name);
            values.push(value);
        });
        if (!valid) {
            alert('Please enter all field names.');
            return;
        }
        // Render table
        let thead = '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
        let tbody = '<tr>' + values.map(v => '<td>' + v + '</td>').join('') + '</tr>';
        $('#dataTable thead').html(thead);
        $('#dataTable tbody').html(tbody);
    });

    renderFields();
});
