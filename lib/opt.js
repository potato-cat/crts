// opt.js: parse command line options and spew help

// You can add command line options here in options.  They
// will be made into the exported opt object that will have
// the default_value by default.  For example:
/*

  var opt = require('./opt').opt;

  console.log( "http port = " + opt.http_port );

*/

var options = {

    debug: {

        type: 'bool',
        default_value: true,
        help: "Ran with more debugging spew",
    },


    help: {

        type: 'bool',
        default_value: false,
        help: "Print this help and then exit.",
        export_value: false, // do not expose to the opt object
        action: usage
    },

    http_port: {

        type: 'integer',
        default_value: 8080,
        argument: 'PORT',
        help: 'set the server HTTP port to PORT. ' +
            'The HTTP (non-secure) service is only available ' +
            'to localhost. Setting the PORT to "0" will ' +
            'disable this HTTP service.'
    },
    
    https_port: {

        type: 'integer',
        default_value: 9191,
        argument: 'SPORT',
        help: 'set the server HTTPS port to SPORT. ' +
            ' Setting the HTTPS port to "0" will ' +
            'disable this HTTPS service.'
    },

    spectrum_port: {

        type: 'integer',
        default_value: 9292,
        argument: 'PORT',
        help: 'set the spectrum reciever server port' +
            'to PORT. ' +
            ' Setting the spectrum reciever server to "0" will ' +
            'disable this spectrum reciever service.'
    }

};





var keys =  Object.keys(options);

keys.forEach(function(key) {
    options[key].value = options[key].default_value;
});


var error = '';

function addError(str) {
    if(error.length > 0)
        error += ' ' + str;
    else
        error = '\n  bad option(s): ' + str;
}

var path = require('path'),
    process = require('process');

function usage() {

    var program_name = path.basename(require.main.filename);
    // strip off the .js suffix if there is one.
    if(program_name.substr(-3) === '.js')
        program_name = program_name.substr(0, program_name.length-3);
    var spaces = '                                                  ' +
        '                                                           ' +

        '                           ',
        right0 = 4,  // chars left margin
        right1 = 25, // position to left side of help
        min_width = 50, // minimum width
        width = 78;  // width of text

    if(error.length)
        Write(error + "\n\n");

    function Write(str) {
        process.stdout.write(str);
    }

    function print(str, right, next_right) {

        var i;
        var out = '';

        while(str.length > 0 && str.substr(0,1) == ' ') str = str.substr(1);

        out = spaces.substr(0,right) + str;
        if(arguments.length > 2)
            right = next_right;

        while(out.length > width) {
            for(i=width; i>min_width && out.substr(i,1) != ' '; --i);
            if(i == min_width)
                // We failed to find a space so show it all.
                i = width;

            Write(out.substr(0,i) + "\n");
            out = out.substr(i);
            while(out.length > 0 && out.substr(0,1) == ' ') out = out.substr(1);
            if(out.length > 0)
                out = spaces.substr(0,right) + out;
        }
        Write(out + "\n");
    }

    Write('\n  Usage: ' + program_name + " [OPTIONS]\n\n");
    print('Run a ' + program_name + ' HTTP(S)/webSocket server.', 2);
    Write("\n");
    Write("  ----------------------------------------------------------------------------\n");
    Write("  ---------------------------       OPTIONS        ---------------------------\n");
    Write("  ----------------------------------------------------------------------------\n\n");



    keys.forEach(function(key) {
        var pre = '--' + key;
        var opt = options[key];
        if(opt.type === 'string' ||
                opt.type === 'regexp' ||
                opt.type === 'integer')
            pre += ' ' + opt.argument;

        if(pre.length < right1 - right0)
            pre += spaces.substr(0, right1 - right0 - pre.length);
        else
            pre += ' ';

        if(typeof(opt.default_print) === 'undefined' && opt.default_value) {
            if(opt.type === 'string')
                var default_value = ' The default value of ' +
                    opt.argument + ' is "' + opt.default_value + '".';
            else if(opt.type === 'integer')
                var default_value = ' The default value of ' +
                    opt.argument + ' is ' + opt.default_value + '.';
            else if(opt.type === 'regexp')
                var default_value = ' The default value of ' +
                    opt.argument + ' is /' + opt.default_value + '/.';
            else // if(opt.type === 'bool')
                var default_value = ' This is not set by default.';
        } else {
            var default_value = '';
        }

        print(pre + opt.help + default_value, right0, right1);
        Write("\n");
    });

    printOptions(options);

    process.exit(1);
}

function printOptions(obj) {

    var keys = Object.keys(obj);

    console.log('\n  ================= The ' + keys.length +
        ' options values found ===================\n');

    i=0;
    keys.forEach(function(key) {
        if(obj[key].value === undefined)
            var value = obj[key].toString();
        else
            var value = obj[key].value.toString();
        console.log('     ' + (i++) + '  ' + key + '=' +
                value);
    });

    console.log(
        '\n  =================================' +
        '===============================\n');
}


var alen = process.argv.length;

// Parse the command-line arguments
//
for(var i=2; i < alen; ++i) {
    var arg = process.argv[i];
    for(var k=0; k<keys.length; ++k) {
        var name = keys[k];
        var opt = options[name];
        var type = opt.type;
        //console.log(name);
        if(type === 'string' || type === 'regexp' || type === 'integer') {
            if(('--'+name === arg || '-'+name === arg) && alen > i+1) {
                // --option val   -option val
                arg = process.argv[++i];
                opt.value = arg;
                break;
            }

            var optlen = arg.indexOf('=') + 1;
            if(optlen > 0 && ('--'+name+'=' === arg.substr(0,optlen) ||
                        '-'+name+'=' === arg.substr(0, optlen)) &&
                        arg.length > optlen) {
                // --option=val
                opt.value = arg.substr(optlen);
                break;
            }

            // TODO: add short options like the list command 'ls -al'
        }

        if(type && type == 'bool') {
            if('--'+name === arg || '-'+name === arg) {
                // --option  -option
                opt.value = true;
                if(opt.action !== undefined &&
                        typeof(opt.action) === 'function')
                    opt.action();
                break;
            }
        }
    }
    if(k === keys.length) 
        addError(arg);
}

if(error.length)
    usage();



// Get what the user needs from options.  The rest of the objects in this
// file will disappear.
//
var opt = new Object;

keys.forEach(function(key) {
    var option = options[key];
    if(option.export_value === undefined || option.export_value === true) {
        var type = option.type;
        if(type === 'string' || type === 'regexp' || type === 'bool')
            opt[key] = option.value;
        else if(type === 'integer')
            opt[key] = parseInt(option.value);
        else {
            console.log("Missing type switch for option: " + key);
            process.exit(1);
        }
    }
});


printOptions(opt);

// Let the module user see opt.
//
module.exports = opt;