/*
JQUERY FRAMELAZE

Copyright (c) 2012   Ivan Garrido
https://github.com/pweak/jquery-framelaze

This software is under MIT license:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */



/* Framelaze begin */

function Framelaze() {
  this.app       = {
    'config': {}
    };
  this.dataModel = {};
  this.templates = {};
  this.actions   = {};
  this.rules     = {};
  this.user      = {};


  var thisObj = this;

  this.app.updateConfiguration = function( config, numTries ) {
    if( 'undefined' == typeof numTries ) { numTries = 0; }
    if( numTries > 5 ) {
      console.log( 'Maximum retries reached' );
      return;
      }

    window.framelaze.app.config.dataModel.configuration.version  = config.version;

    if( 'undefined' == typeof window.framelaze.app.config.dataModel.configuration.entities ) {
      window.framelaze.app.config.dataModel.configuration.entities = {};
      }

    if( 'undefined' == typeof window.framelaze.dataModel.definition ) {
      window.framelaze.dataModel.definition = {};
      }

    for( entityIdx in config.entities ) {
//      if( 'undefined' == typeof window.framelaze.app.config.dataModel.configuration.entities[entityIdx] ) {
      if( 'undefined' == typeof window.framelaze.dataModel.definition[entityIdx] ) {

        $.getScript( config.entities[entityIdx].src )
          .done(function(script, textStatus) {
            console.log( textStatus );
            window.framelaze.app.updateConfiguration( config, 1+numTries );
            })
          .fail(function(jqxhr, settings, exception) {
            console.log( "Triggered ajaxError handler." );
            console.log( exception.get_message() );
            });

        return;
        }
      else {
        window.framelaze.app.config.dataModel.configuration.entities[entityIdx] = config.entities[entityIdx];
        }

      }

    };
  }

Framelaze.prototype.checkUpdates = function() {

  $.getScript( this.app.config.dataModel.configuration.updateBaseUrl )
    .done(function(script, textStatus) {
      console.log( textStatus );
      })
    .fail(function(jqxhr, settings, exception) {
      console.log( "Triggered ajaxError handler." );
      console.log( exception.get_message() );
      });

  };


Framelaze.prototype.render = function() {
  var action = this.actions.app.init;

  this.execute( action );

  };

Framelaze.prototype.execute = function( action ) {
  var thisObj = this;

  if( $.isArray(action) ) {
    // First pos: template name
    // Second pos: id target div

    $('#'+action[1]).empty().append(this.templates[action[0]]);
    }
  else if( 'function' == typeof action ) {

    action();
    }

  for( idxElement in this.actions ) {
    var appElement = idxElement;
    if( 'app' != appElement ) {
      for( idxEventName in this.actions[ appElement ] ) {
        var appEventName = idxEventName;
        var newAction = this.actions[ appElement ][ appEventName ];
        var elementXPath = $.trim( appElement ); if( elementXPath.indexOf(' ') < 0 && '#' != elementXPath.substring(0,1) && '.' != elementXPath.substring(0,1) ) { elementXPath = '#'+elementXPath; }

        $( elementXPath ).bind( appEventName, function( ev ) {
          var appElement = ev.target.id;
          var eventName = ev.type;
          var execAction = thisObj.actions[ appElement ][ eventName ];
          thisObj.execute( execAction );
          });
//        if( $.isArray( this.actions[ element ][ eventName ] ) ) {
//          }

        }  //  foreach Event
      }
    }  // foreach Element

  };  //  END method execute()

Framelaze.prototype.generateClasses = function() {

  for( appClass in this.dataModel.definition ) {
    var className = appClass.toLowerCase();
    className = className.substring( 0, 1 ).toUpperCase() + className.substring( 1 );

    var thisObj = this;

    this.dataModel[ className ] = function( id ) {
/*
      var localAppClass  = thisObj.dataModel[ className ].appDataModelName;//''+appClass;
      var localClassName = thisObj.dataModel[ className ].appDataModelName;//''+className;
      this.appDataModelName = localAppClass;
      this.appClassName     = localClassName;
*/
      if( isFinite( id ) ) {
        id = framelaze.dataModel[this.appClassName+'Manager'].get( id );
        }

      if( 'object' == typeof id ) {
        for( attribute in framelaze.dataModel.definition[ this.appDataModelName ] ) {
          this[ attribute ] = id[ attribute ];
          }
        }

      };

    this.dataModel[ className ].appDataModelName = appClass;
    this.dataModel[ className ].appClassName     = className;

    this.dataModel[ className ].prototype.appDataModelName = appClass;
    this.dataModel[ className ].prototype.appClassName     = className;


    this.dataModel[ className+"Manager" ] = {
      'appDataModelName' : appClass,
      'appClassName'      : className,

      'getList': function() {
        var list = [];
        list.push( new framelaze.dataModel[ this.appClassName ]( '1' ) );
        list.push( new framelaze.dataModel[ this.appClassName ]( '2' ) );
        list.push( new framelaze.dataModel[ this.appClassName ]( '3' ) );

        return list;
        },
      'get': function( id ) {
        return { 'id': id, 'name': 'A', 'img': 'NO' };
        }
      };

    }

  };  //  END method generateClasses()

Framelaze.prototype.updateDataModel = function( dataModel ) {

  if( 'object' != typeof this.dataModel ) { this.dataModel = {}; }

  this.dataModel.definition = dataModel;

  this.generateClasses();

  };  //  END method updateDataModel()


defaultDataManager = function() {
  this.db = null;

  this.db = openDatabase( defaultDataManager.dbName, defaultDataManager.dbVersion, defaultDataManager.dbDesc, defaultDataManager.dbSize );

  var db = this.db;
  db.transaction(function(tx) {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS image ( ' +
      '  id   INTEGER PRIMARY KEY ASC, ' +
      '  name VARCHAR(255), '+
      '  img  VARCHAR(255) ' +
      '  )' , [] );

    tx.executeSql(
      'INSERT INTO image ( name, img ) ' +
      "  VALUES ( 'Image 1', 'YES' ) " , [] );

    tx.executeSql(
      'INSERT INTO image ( name, img ) ' +
      "  VALUES ( 'Image 2', 'NO' ) " , [] );


    });

  };

defaultDataManager.dbName    = 'Framelaze';
defaultDataManager.dbVersion = '1.0';
defaultDataManager.dbDesc    = 'Framelaze data';
defaultDataManager.dbSize    = 5*1024*1024;

defaultDataManager.prototype.query = function( entity, conditions, limit ) {
}


window.framelaze = new Framelaze();





function startFramelaze() {
  $( function() {
    window.framelaze.checkUpdates();
    window.framelaze.render();
    window.framelaze.dataManager = new defaultDataManager();
    });
  }



/* Framelaze end */
