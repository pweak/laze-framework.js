window.framelaze.updateDataModel( {
    'image': {
        'id':   'number',
        'name': 'string',
        'img':  'string'
        },
    'user': {
        'id':         { 'type': 'number', 'validate': 'autoincrement', 'desc': 'Identifier of users' },
        'visualName': { 'type': 'string', 'validate': 'non_empty', 'desc': 'Name to be shown at app.' },
        'lang':       { 'type': 'string', 'validate': ['es','en'], 'urlFriendlyName': 'lang' }
        }
    });
