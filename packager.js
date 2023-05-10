'use strict';
var packager = require('electron-packager');
var options = {
    'arch': 'ia32',
    'platform': 'win32',
    'dir': './',
    'app-copyright': 'Joao Bonchristiano',
    'app-version': '1.0.0',
    'asar': true,
    'icon': './icon.ico',
    'name': 'Joule',
    'out': './builds',
    'overwrite': true,
    'prune': true,
    'version': '24.1.3',
    'version-string': {
        'CompanyName': 'Joao Bonchristiano',
        'FileDescription': 'Joule Browser',
        'OriginalFilename': 'JouleBrowser',
        'ProductName': 'Joule Browser',
        'InternalName': 'JouleBrowser'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});