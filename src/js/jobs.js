let is = is || {};
is.job = {};
is.job.ev = {};
is.job.tag = {};
is.job.runJobs = () => {
	//LOCALHOST ENVIRONMENT
	if (location.hostname === "localhost"){
		is.job.dummies = [
        {
          title: "Someone to read the Colonel's letters",
          owner:"Gabriel Gabria Marquez",
          created: Date.now(),
          id: 112312,
          c: "<p>Something goes here</p>"
        },
        {
          title: "Geographical Surveyor",
          owner:"Gabriel Gabria Marquez",
          created: Date.now(),
          id: 112342,
          c: "<p>Something goes here</p>"
        },
        {
          title: "Firemen Needed",
          owner:"Ray Bradbury",
          created: Date.now(),
          id: 119312,
          c: "<p>Something goes here</p>"
        },
        {
          title: "Ghost Hunter",
          owner:"Juan Rulfo",
          created: Date.now(),
          id: 112312,
          c: "<p>Something goes here</p>"
        }
      ];
	}
	is.job.ev = new Emitter();
	is.job.ev.on("test",(data) =>{
		console.log("TEST IS HOME ES",data);
	});
	riot.mount("menu-general, footer, job, joblist, newjob, editjob, deljob, newjob-tag, job-tag");
	$('.ui.dropdown').dropdown();
	$("#is-current-date").html(moment().format('LL'));
  $(".is-newjob-button").clickAsObservable().subscribe((ev) => {
      	$('.is-new-job-modal').modal("show");
  });
  $("#is-job-search-btn").clickAsObservable().subscribe((ev) => {
    let input = _.split($("#is-job-search-input").val(),",")
    let keywords = input.map((o) => _.trim(_.toLower(o)))
    if (!keywords.length) return;

    is.job.ev.emit("search",keywords);
  });
  $("joblist").onAsObservable("click",".is-job-delete").subscribe((ev) => {
        let docid = $(ev.target).attr("val");
        $('.is-deljob-modal .docid').val(docid);
        $('.is-deljob-modal').modal("show");
    });
  $("joblist").onAsObservable("click",".is-job-edit").subscribe((ev) => {
        let docid = $(ev.target).attr("val");
        $('.is-edit-job-modal .docid').val(docid);
        is.jobapi.get(docid,(err,data) => {
          if(err) return toastr.error(err);
          is.job.ev.emit("edit-modal-start",data);
        });
    });
};