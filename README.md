# Autofill

A simple plugin for autocomplete with the help of jquery.

# Requirements

1. [jQuery](https://code.jquery.com/jquery-3.1.0.min.js)

# Installation

1. Download the source.
2. Copy and paste autofill.min.js and autofill.min.css
3. Include both in your file.

# Documentation

1. Autofill requires data in a valid json array format.
    `[{"label":"PHP"},{"label":"JAVA"},{"label":"jQuery"},{"label":"DotNet"},{"label":"Python"}]`
2. By default autofill shows the `label` field.
3. You can give any other attributes in the JSON array which are returned by Autofill on different events thus making it easier to manipulate inputs.    

# Example

1. Default.

    ```
    <input type='text' id='myInput' data-autofill='[{"label":"PHP"},{"label":"JAVA"},{"label":"jQuery"},{"label":"DotNet"},{"label":"Python"}]'>
    ```
    
    ```
    $('#myInput').autofill();
    ```
2. You can provide a source element which contains the JSON array.

    ```
    <div id='hidden'>
    [{"label":"PHP"},{"label":"JAVA"},{"label":"jQuery"},{"label":"DotNet"},{"label":"Python"}]
    </div>
    ```
    
    ```
    $('#myInput').autofill({
        source:$('#hidden').text()
    });
    ```
    
3. Or, You can provide the JSON source which gives JSON output by simply providing the URL and setting `ajax:true` which in turn sends a `get` request and fetches the data.

    ```
    $('#myInput').autofill({
        source:'myjson.php',
        ajax:true
    });
    ```

    

