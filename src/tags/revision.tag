<revlist>
	<div class="is-revs-header">
    <div class ="ui grid">
      <div class="ten wide column">
        <h3>Document History for {doc.title}</h3>
      </div>
      <div class="six wide column">
        <div class="ui selection dropdown right floated right floated is-home-sorter">
          <i class="dropdown icon"></i>
          <div class="text">Sort by...</div>
          <div class="menu">
            <div class="item">Date Created</div>
          </div>
        </div>
      </div>
    </div>
  	</div>
	<list>
    	<div class="pre-load">Loading your Document History...</div>
    	<revision each={r in revs} content={r} />
  	</list>
  	<script>
	    let fwk = this;
	    is.rev.ev.on("list-revision",(org) =>{
  	    if (location.hostname === "localhost"){
  	      fwk.revs = is.rev.dummies
          let state = is.rev.store.getState()
          this.doc = {}
          this.doc.title = state.title
  	      fwk.update();
  	    } else {
          let state = is.rev.store.getState();
          fwk.doc = {}
          fwk.doc.title = state.title
  	      is.revapi.list(state.docid,(err,data) => {
  	        if(err) {
              if(err.status == "404"){
                $("div.pre-load").show().html("No revision history found for this document.");
                fwk.update();
                return;
              }
              else return toastr.error(err.responseText);
            }
  	        //SORT REVISIONS BY INDEX BIGGEST FIRST HERE
  	        fwk.revs = data;
            data.sort((a,b) => {
              return Number(b.index) - Number(a.index)
            })
  	        fwk.update();
            is.rev.revisionListeners();
  	      }); 
        }	
	    });
	    this.on("mount",() => {
	      $("div.pre-load").hide();
	    });
	    this.on("updated",() => {
	      $('.ui.dropdown').dropdown();
	    });
  	</script>
</revlist>
<revision>
	<div class="ui top attached menu">
		<a class="item">{content.index}</a>
		<a class="item">{content.stamp}</a>
        <div class="right menu">
            <div class="ui dropdown item">
            	<i class="dropdown icon"></i>
              	<div class="menu">
                	<a class="item is-revtodoc" val="{content.index}">Make a New Document from Revision</a>
              	</div>
            </div>
		</div>
	</div>
  <div class="ui clearing attached segment">
    <button class="ui right floated button primary is-rev-view" val="{content.index}">View History Entry</button>
    <button class="ui right floated button primary is-rev-compare" val="{content.index}" >Compare to Most Recent Version</button>
  </div>
  <script>
    this.content = opts.content;
    this.content.stamp = moment(Number(this.content.stamp)).format('L LT')
    let fwk = this;
  </script>
</revision>
<rev-comparison-modal>
  <div class="ui long modal is-rev-compare-modal">
    <div class="header">
      Entry #{index} against the most recent version
    </div>
    <div class="content">
      <div class="diff-revco"><p><raw content="{blurb}"></raw></p></div>
    </div>
  </div>
  <style>
    .diff-revco{
      font-family: 'Noto Serif', serif;
      font-size: 1em;
      text-indent: 5%;
      line-height: 2.5em;
      padding-left: 0.5em;
      padding-right: 0.5em;
    }
  </style>
  <script>
    let fwk = this;
    is.rev.ev.on("compare-revision",(org) => {
      if(location.hostname == "localhost"){
        let index = org.index;
        let raw = fwk.tags.raw;
        let entry = is.rev.dummies.find((el) => { return el.index == index;});
        let fresh = is.rev.store.getState()
        let dmp = new diff_match_patch();
        let d = dmp.diff_main(entry.c,fresh.text);
        dmp.diff_cleanupSemantic(d);
        let ds = dmp.diff_prettyHtml(d);
        fwk.blurb = ds;
        fwk.index = index;
        raw.mount();
        fwk.update();
        $(".is-rev-compare-modal").modal("show");
      } else {
        let index = org.index;
        let raw = fwk.tags.raw;
        let fresh = is.helpers.mltoplain(is.rev.store.getState()["text"])
        is.revapi.getRev(org.docid,Number(index),(err,data) => {
          if(err) return toastr.error(err);
          let entry = is.helpers.mltoplain(data.c);
          let dmp = new diff_match_patch();
          let d = dmp.diff_main(entry,fresh);
          dmp.diff_cleanupSemantic(d);
          let display = dmp.diff_prettyHtml(d);
          fwk.blurb = display;
          fwk.index = index;
          raw.mount();
          fwk.update();
          $(".is-rev-compare-modal").modal("show");
        });
      }
    });
  </script>
</rev-comparison-modal>
<rev-view-modal>
	<div class="ui long modal is-rev-view-modal">
    <div class="header">
      Entry #{index} {stamp}
    </div>
    <div class="content-rev">
     	<p>{c}</p>
    </div>
  </div>
  <style>
    .content-rev{
      font-family: 'Noto Serif', serif;
      font-size: 1em;
      text-indent: 5%;
      line-height: 2.5em;
      padding-left: 0.5em;
      padding-right: 0.5em;
    }
  </style>
  <script>
  let fwk = this;
  is.rev.ev.on("view-revision",(org) => {
  	if(location.hostname == "localhost"){
  		let index = org.index;
  		let entry = is.rev.dummies.find((el) => { return el.index == index;});
  		this.index = index;
  		this.stamp = entry.stamp;
  		this.c = entry.c;
  		this.update();
  		$(".is-rev-view-modal").modal("show");
  	}
  	else{
  		is.revapi.getRev(org.docid,Number(org.index),(err,data) => {
  			if(err) return toastr.error(err);
  			fwk.index = org.index;
  			fwk.stamp = moment(Number(data.stamp)).format('L LT');
  			fwk.c = is.helpers.mltoplain(data.c);
  			fwk.update();
  			$(".is-rev-view-modal").modal("show");		
  		})
  	}
  });
  </script>
</rev-view-modal>
<revdoc-modal>
  <div class="ui modal small is-revdoc-modal">
    <div class="header">
      New Document From Revision {index}
    </div>
    <div class="content">
      <form id="revdoc-form" class="ui form" autocomplete="off">
        <div class="field">
          <label>Document Title</label>
          <input name="document-title" placeholder="{title}" type="text">
        </div>
         <div id="wpp" class="field" style="display: none;">
          <label> Are you a Robot? </label>
          <input id="wp" name="website" type="text" value=""/>
        </div>
        <button class="ui button" type="submit">Create a New Document From This Revision</button>
      </form>
    </div>
  </div>
  <script>
  let fwk = this;
  is.rev.ev.on("todoc-revision",(org) => {
    is.rev.store.dispatch(is.rev.storeActions.focusrev(org.index))
    
    fwk.index = org.index;
    fwk.title = is.rev.store.getState()["title"]
    fwk.update();
    $(".is-revdoc-modal").modal("show");
  });
  this.executeForm = () => {
    if ($('input#wp').val().length != 0) return false;
    let state = is.rev.store.getState();
    var fdata = $("#revdoc-form").form("get values");
    var payload = {
      title: fdata["document-title"]
    }
    $("#revdoc-form").addClass("loading");
    is.revapi.docFromRev(state.docid,Number(state.focusRev),payload,(err,data) => {
      if(err) return toastr.error(err);
      $(".is-revdoc-modal").modal("hide");
      $("#newdoc-form").removeClass("loading");
    });
  }
  this.on("mount",() => {
    $("#revdoc-form").form({
      title:{
        identifier: "document-title",
        rules:[{type:'empty', prompt:'This Document must have a title'}]
      }
    },{
      onSuccess: this.executeForm
    });
    $("#revdoc-form").on("submit", (ev) => { ev.preventDefault(); });
  });
  </script>
</revdoc-modal>