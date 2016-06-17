var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	prefix = require('gulp-autoprefixer'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	source = require('vinyl-source-stream'),
	xtend = require('xtend'),
	jscs = require('gulp-jscs'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	bless = require('gulp-bless'),
	minifyCss = require('gulp-minify-css'),
	debug = require('gulp-debug');
	
var destOptions = {
    mode: 0755
};

	
var cartridgePaths = {
	'app_pandora_nz' : {
		scss: {
			src: './app_pandora_nz/cartridge/scss/*.scss',
			dest: './app_pandora_nz/cartridge/static/default/css'
		},
		js: {
			src: './app_pandora_nz/cartridge/js/app.js',
			dest: './app_pandora_nz/cartridge/static/default/js'
		},
		jsMinify : {
			src: './app_pandora_nz/cartridge/static/default/js/*.js',
			dest : './app_pandora_nz/cartridge/static/default/js/'
		},
		jshint : {
			src : './app_pandora_nz/cartridge/js/**/*.js'
		}
	},
	'app_pandora_au' : {
		scss: {
			src: './app_pandora_au/cartridge/scss/*.scss',
			dest: './app_pandora_au/cartridge/static/default/css'
		},
		js: {
			src: './app_pandora_au/cartridge/js/app.js',
			dest: './app_pandora_au/cartridge/static/default/js'
		},
		jsMinify : {
			src: './app_pandora_au/cartridge/static/default/js/*.js',
			dest : './app_pandora_au/cartridge/static/default/js/'
		},
		jshint : {
			src : './app_pandora_au/cartridge/js/**/*.js'
		}
	},
	'app_pandora_hk' : {
		scss: {
			src: './app_pandora_hk/cartridge/scss/*.scss',
			dest: './app_pandora_hk/cartridge/static/default/css'
		},
		js: {
			src: './app_pandora_hk/cartridge/js/app.js',
			dest: './app_pandora_hk/cartridge/static/default/js'
		},
		jsMinify : {
			src: './app_pandora_hk/cartridge/static/default/js/*.js',
			dest : './app_pandora_hk/cartridge/static/default/js/'
		},
		jshint : {
			src : './app_pandora_nz/cartridge/js/**/*.js'
		}
	}
}


var watching = false;
gulp.task('enable-watch-mode', function () { watching = true })

// =============================================== build scss ===========================================
var arrayTaskScss = [];
function createTaskScss(key,name)
{
    gulp.task(name, function() {
        return gulp.src(cartridgePaths[key].scss.src)
            .pipe(sass({sourcemap: true, outputStyle : 'compressed'}).on('error', sass.logError))
			.pipe(prefix({cascade: true}))		
			.pipe(minifyCss())
			.pipe(bless({
				imports: false
			}))
		.pipe(gulp.dest(cartridgePaths[key].scss.dest));
   
    });
}

for (var key in cartridgePaths)
{	
	var name = key + '_scss';
    createTaskScss(key,name);
    arrayTaskScss.push(name);
}

gulp.task('scss', arrayTaskScss);

//================================================= end build scss ========================================
//=========================================================================================================
//================================================= Start build JS ========================================

var arrayTaskJs = [];
function createTaskJS(key,name)
{
    gulp.task(name, function() {
        var opts = {
				entries: cartridgePaths[key].js.src,
				debug: (gutil.env.type === 'development')
			}
			if (watching) {
				opts = xtend(opts, watchify.args);
			}
			var bundler = browserify(opts);
			if (watching) {
				bundler = watchify(bundler);
			}
			bundler.on('update', function (ids) {
				gutil.log('File(s) changed: ' + gutil.colors.cyan(ids));
				gutil.log('Rebunlding...');
				rebundle();
			});

			function rebundle () {
				return bundler
					.bundle()
					.on('error', function (e) {
						gutil.log('Browserify Error', gutil.colors.red(e));
					})
					.pipe(source('app.js'))
					.pipe(gulp.dest(cartridgePaths[key].js.dest));
			}
			return rebundle();
		   
	});
}

for (var key in cartridgePaths)
{
	var name = key + '_js';
    createTaskJS(key,name);
    arrayTaskJs.push(name);
}

gulp.task('js', arrayTaskJs);

//================================================= end build JS ==========================================
//=========================================================================================================
//================================================= Start build jsMinify===================================
var arrayTaskJsMinify = [];
function createTaskJsMinify(key,name)
{
    gulp.task(name, function() {
        gulp.src(cartridgePaths[key].jsMinify.src)		
		.pipe(uglify())
		.pipe(gulp.dest(cartridgePaths[key].jsMinify.dest));		   
	});
}

for (var key in cartridgePaths)
{
	var name = key + '_jsMinify';
    createTaskJsMinify(key,name);
    arrayTaskJsMinify.push(name);
}

gulp.task('jsMinify', arrayTaskJsMinify);
//================================================= end build jsMinify ====================================
//=========================================================================================================

gulp.task('jscs', function () {
	return gulp.src('**/*.js')
		.pipe(jscs());
});

gulp.task('jshint', function () {
	return gulp.src([
          cartridgePaths.app_pandora_nz.jshint.src,
		  cartridgePaths.app_pandora_au.jshint.src,
		  cartridgePaths.app_pandora_hk.jshint.src
        ])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task('watch', ['enable-watch-mode', 'js'], function () {
	gulp.watch([
          cartridgePaths.app_pandora_nz.scss.src,
		  cartridgePaths.app_pandora_au.scss.src,
		  cartridgePaths.app_pandora_hk.scss.src
        ], ['scss']);
});
