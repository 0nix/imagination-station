let is = is || {};
is.home = {};
is.home.ev = {};
is.home.runHome = () => {
	//LOCALHOST ENVIRONMENT
	if (location.hostname === "localhost"){
		is.home.dummies = [
        {
          title: "A Farewell To Arms",
          stamp: Date.now(),
          created: Date.now(),
          id: 112312,
          blurb:"<p>In the late summer of that year we lived in a house in a village that looked across the river and the plain to the mountains. In the bed of the river there were pebbles and boulders, dry and white in the sun, and the  water was clear and swiftly moving and blue in the channels"
        },
        {
          title: "The October Country",
          id: 341141,
          stamp: Date.now(),
          created: Date.now()
        },
        {
          title: "Fahrenheit 451",
          id: 342341,
          stamp: Date.now(),
          created: Date.now()
        }
      ];
	}
	is.home.ev = new Emitter();
	is.home.ev.on("test",(data) =>{
		console.log("TEST IS HOME ES",data);
	});
	riot.mount("menu-general, footer, document, doclist, newdoc-modal, deldoc-modal, condoc-modal");
	$('.ui.dropdown').dropdown();
	$("#is-current-date").html(moment().format('LL'));
    $(".is-newdocument-button").clickAsObservable().subscribe((ev) => {
      	$('.is-newdocument-modal').modal("show");
    });
    $(".is-delete-doc").clickAsObservable().subscribe((ev) => {
      	let docid = $(ev.target).attr("val");
      	$('.is-deldocument-modal .docid').val(docid);
      	$('.is-deldocument-modal').modal("show");
    });
    $("doclist").onAsObservable("click",".is-delete-doc").subscribe((ev) => {
      	let docid = $(ev.target).attr("val");
      	$('.is-deldocument-modal .docid').val(docid);
      	$('.is-deldocument-modal').modal("show");
    });
    $("doclist").onAsObservable("click",".is-convert-doc").subscribe((ev) => {
        let docid = $(ev.target).attr("val");
        $('.is-condocument-modal .docid').val(docid);
        $('.is-condocument-modal').modal("show");
    });

};