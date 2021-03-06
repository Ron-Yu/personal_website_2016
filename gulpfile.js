//  *************************************
//
//  Gulpfile
//
//  *************************************
//
//  Available tasks:
//  'gulp'
//  'gulp list'
//  'gulp lint:js'
//  'gulp uglify:js'
//  'gulp watch:js'
//  'gulp serve'
//
//  *************************************



//  -------------------------------------
//  Modules
//  -------------------------------------
//
//  gulp                    :  The streaming build system
//  gulp-load-plugins       :  Automatically load Gulp plugins
//  gulp-cached             :  A simple in-memory file cache for gulp
//  gulp-eslint             :  The pluggable linting utility for JavaScript and JSX
//  gulp-jade								:  Compile Jade templates
//  gulp-jscs               :  JS code style linter
//  gulp-jscs-stylish       :  A reporter for the JSCS
//  gulp-plumber            :  Prevent pipe breaking caused by errors from gulp plugins
//  gulp-rucksack						:  A little bag of CSS superpowers
//  gulp-sourcemaps         :  Source map support for Gulp.js
//  gulp-task-listing       :  Task listing for your gulpfile
//  gulp-using              :  Lists all files used
//  gulp-util               :  Utility functions for gulp plugins
//  gulp-sass								:  Something like this will compile your Sass files
//  babel-eslint            :  Lint ALL valid Babel code with ESlint
//  browser-sync            :  Live CSS Reload & Browser Syncing
//  eslint-config-airbnb    :  Airbnb's ESLint config, following our styleguide
//
// -------------------------------------



//  -------------------------------------
//  Require gulp module
//  -------------------------------------
//
//  gulp core modules
var gulp = require('gulp');
var config = require('./gulp_config');
var $ = require('gulp-load-plugins')({lazy: true});
//
//  browser-sync module
var browserSync = require('browser-sync').create();
//
var mainBowerFiles = require('main-bower-files');
//
//  -------------------------------------



//  -------------------------------------
//  Utility function
//  -------------------------------------
//
function log(msg) {
	if (typeof(msg) === 'object') {
		for (var item in msg) {
			if (msg.hasOwnProperty(item)) {
				$.util.log($.util.colors.bgYellow.white(msg[item]));
			}
		}
	}
	else {
		$.util.log($.util.colors.underline.bold.bgYellow(msg));
	}
}
//
//  -------------------------------------


//  -------------------------------------
//  Task: list
//  -------------------------------------
//
gulp.task('list', function() {
  log('list all tasks registered');
  $.taskListing();
});
//
//  -------------------------------------



//  -------------------------------------
//  Task: export: library
//  -------------------------------------
//
gulp.task('export:library', function() {

	var jsFilter = $.filter(['**/*.js'], {restore: true});
	var cssFilter = $.filter('**/*.css', {restore: true});

	return gulp
		.src(mainBowerFiles())

	  .pipe(jsFilter)
		.pipe($.using({
      prefix: 'export:js',
      color: 'yellow'
    }))
	  .pipe(gulp.dest(config.build.VendorJs))
	  .pipe(jsFilter.restore)

    .pipe(cssFilter)
		.pipe($.using({
      prefix: 'export:css',
      color: 'yellow'
    }))
    .pipe(gulp.dest(config.build.VendorCss));

});
//
//  -------------------------------------



//  -------------------------------------
//  Task: build
//  -------------------------------------
//
gulp.task('build', ['uglify:js', 'compile:css', 'compile:html']);
//
//  -------------------------------------



//  -------------------------------------
//  Task: lint:js
//  -------------------------------------
//
gulp.task('lint:js', function(){
  log('ESlint and JSCS examination task');
  return gulp
    .src(config.src.js)
    .pipe($.cached('linting'))
    .pipe($.plumber())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.jscs())
    .pipe($.jscsStylish())
    .pipe($.using({
      prefix: 'lint:js',
      color: 'yellow'
    }));
});
//
//  -------------------------------------



//  -------------------------------------
//  Task: uglify:js
//  -------------------------------------
//
gulp.task('uglify:js',['lint:js'] ,function(){
  log('uglify js task');
  return gulp
		.src(config.src.js)
    .pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.using({
      prefix: 'uglify:js',
      color: 'yellow'
    }))
		.pipe($.concat('main.js'))
		.pipe($.uglify())
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(config.build.js))
    .pipe(browserSync.stream());
});
//
//  -------------------------------------



//  -------------------------------------
//  Task: watch:js
//  -------------------------------------
//
gulp.task('watch:js', ['uglify:js'], browserSync.reload);
//
//  -------------------------------------



//  -------------------------------------
//  Task: compile:css
//  -------------------------------------
//
gulp.task('compile:css', function () {
    log('Compiling Sass --> CSS');
    return gulp
        .src(config.src.applicationSass)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
				.pipe($.using({
		      prefix: 'compile:css',
		      color: 'yellow'
		    }))
        .pipe($.sass({
          indentedSyntax: true
        }))
				.pipe($.rucksack({
					autoprefixer: true
				}))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.build.css))
        .pipe(browserSync.stream())
});
//
//  -------------------------------------



//  -------------------------------------
//  Task: watch:css
//  -------------------------------------
//
gulp.task('watch:css', ['compile:css'], browserSync.reload);
//
//  -------------------------------------



//  -------------------------------------
//  Task: compile:html
//  -------------------------------------
//
gulp.task('compile:html', function () {
  log('Compiling Jade --> HTML');
  return gulp
    .src(config.src.pageJade)
    .pipe($.plumber())
		.pipe($.using({
			prefix: 'compile:html',
			color: 'yellow'
		}))
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(config.build.html))
    .pipe(browserSync.stream())
});
//
//  -------------------------------------



//  -------------------------------------
//  Task: watch:html
//  -------------------------------------
//
gulp.task('watch:html', ['compile:html'], browserSync.reload);
//
//  -------------------------------------



//  -------------------------------------
//  Task: serve
//  -------------------------------------
//
gulp.task('serve',['build'] ,function() {

    log('browser-sync starts');

    browserSync.init({
        server: {
            baseDir: './build'
        }
    });

    gulp.watch(config.src.js, ['watch:js']);
		gulp.watch(config.src.allSass, ['watch:css']);
		gulp.watch(config.src.allJade, ['watch:html']);
});
//  -------------------------------------



//  -------------------------------------
//  Task: default
//  -------------------------------------
//
gulp.task('default', ['list', 'serve']);
//
//  -------------------------------------
