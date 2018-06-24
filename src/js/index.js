let is = is || {};
is.index = {};
is.index.runIndex = () => {
	$(document).ready(function() {
      // fix menu when passed
    riot.mount("menu-follower, menu-masthead, intro-video, newsletter-modal, footer");
		$('.masthead').visibility({
			once: false,
			onBottomPassed: function() {
            	$('.fixed.menu').transition('fade in');
          	},
          	onBottomPassedReverse: function() {
            	$('.fixed.menu').transition('fade out');
          	}
    	});
      // create sidebar and attach to menu open
      $('.ui.sidebar').sidebar('attach events', '.toc.item');
    });
    $("body").on("click",".sup-button",(ev) => {
      ev.preventDefault();
      $('.ui.modal').modal("show");
    });
    

};