var gulp = require("gulp");
var jsFiles = ["src/js/*.js"];
var cssFiles = ["src/styles/*.css"];
var tagFiles = ["src/tags/*.tag"];
var html = ["src/*.html"];
var images = ["src/img/*.jpg","src/img/*.png"];
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});

function jsChange(content) {
    return content.replace(/@js\//g, 'static/js/');
}
function cssChange(content) {
    return content.replace(/@styles\//g, 'static/styles/');
}
function localChange(content){
	return content.replace(/@/g, '');
}

gulp.task("prdeps",function(){
	console.log("AVAILABLE DEPENDENCIES");
	console.log(plugins.mainBowerFiles());
});
gulp.task("deps",function(){
	console.log(plugins.mainBowerFiles());
	return gulp.src(plugins.mainBowerFiles())
	.pipe(plugins.filter("**/*.js"))
	.pipe(plugins.order(["**/jquery.js","**/*.js"]))
	.pipe(plugins.sourcemaps.init())
	.pipe(plugins.concat("deps.js"))
	.pipe(plugins.sourcemaps.write("."))
	.pipe(gulp.dest("build/js"));
});
gulp.task("behavior",function(){
	return gulp.src(jsFiles)
	.pipe(plugins.count("## js files"))
	.pipe(plugins.sourcemaps.init())
	.pipe(plugins.babel({presets: ["es2015"]}))
	.pipe(plugins.concat("my.js"))
	.pipe(plugins.sourcemaps.write("."))
	.pipe(gulp.dest("build/js"))
});
gulp.task("fonts",function(){
	return gulp.src(plugins.mainBowerFiles())
	.pipe(plugins.filter(["**/*.woff","**/*.ttf","**/*.otf"]))
	.pipe(gulp.dest("build/fonts"));
});
gulp.task("css",function(){
//	console.log(cssFiles.concat(plugins.mainBowerFiles()));
	return gulp.src(cssFiles.concat(plugins.mainBowerFiles()))
	.pipe(plugins.filter(["**/*.css"]))
	.pipe(plugins.count("## css files"))
	.pipe(plugins.sourcemaps.init())
	.pipe(plugins.concat("style.css"))
	.pipe(plugins.sourcemaps.write("."))
	.pipe(gulp.dest("build/styles"))
});
gulp.task("imgs",function() {
	return gulp.src(images)
	.pipe(plugins.count("## image files"))
	.pipe(gulp.dest("build/img"));
});
gulp.task("markup",function(){
	return gulp.src(html)
	.pipe(plugins.change(localChange))
	.pipe(gulp.dest("build"))
});
gulp.task("dist-markup",function(){
	return gulp.src(html)
	.pipe(plugins.change(jsChange))
	.pipe(plugins.change(cssChange))
	.pipe(gulp.dest("build"))
});
gulp.task("tags",function(){
	return gulp.src(tagFiles)
	.pipe(plugins.riot({
		compact: true,
		type: "babel",

	}))
	.pipe(plugins.concat("tags.js"))
	.pipe(gulp.dest("build/js"))
});
gulp.task("web",function(){
	gulp.src("build").pipe(
	plugins.webserver({
		livereload:true,
		directoryListing:false,
		open:true
	}))
});
gulp.task("webkill",function(){
	var stream = gulp.src('app').pipe(plugins.webserver());
	stream.emit('kill');
});
gulp.task("js",["deps","behavior"])
gulp.task('watch', function() {
  gulp.watch(tagFiles, ['tags']);
  gulp.watch(jsFiles, ['js']);
  gulp.watch(html, ['markup']);
  gulp.watch(cssFiles, ['css']);
});
gulp.task("default",["js","css","fonts","imgs","tags","markup"]);
gulp.task("upload",["js","css","fonts","imgs","tags","dist-markup"]);
