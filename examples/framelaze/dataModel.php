<?php

  header('Content-type: text/javascript');

/*
    window.framelaze.app.config = {
        'dataModel': {
            'configurtion': {
                'updateBaseUrl': '/framelaze/dataModel.php',
                'version': 1,
                'entities': {
                    'Image': {'src': '/framelaze/entities.js', 'version': '1' }
                    }
                }
            }
        };
*/

?>
    window.framelaze.app.updateConfiguration( {
      'version': 1,
      'entities': {
        'image': {'src': '/framelaze/entities.js', 'version': '1' }
        }
      } );

<?php

?>
