<newjob-tag onclick= { clicked }>
  <div class="ui label is-newjob-tag">
  <span>{ct}</span> <i class="fa fa-times" aria-hidden="true"></i>
  </div>
  <style>
    .is-newjob-tag span {
      font-size: 1.2em;
      margin-right: 0.6em;
    }
    newjob-tag {
      margin-right: 0.3em;
    }

  </style>
  <script>
    this.clicked = (ev) => {
      is.job.ev.emit("delete-this-tag",{tag: this.ct})
    }
  </script>
</newjob-tag>
<editjob-tag onclick= { clicked }>
  <div class="ui label is-editjob-tag">
  <span>{ct}</span> <i class="fa fa-times" aria-hidden="true"></i>
  </div>
  <style>
    .is-newjob-tag span {
      font-size: 1.2em;
      margin-right: 0.6em;
    }
    newjob-tag {
      margin-right: 0.3em;
    }

  </style>
  <script>
    this.clicked = (ev) => {
      is.job.ev.emit("edit-delete-this-tag",{tag: this.ct})
    }
  </script>
</editjob-tag>
<job-tag onclick= {clicked}>
  <div class="ui label tag is-job-tag">
  <span>{ct}</span>
  </div>
  <style>
    .is-job-tag span {
      font-size: 1.2em;
      margin-right: 0.6em;
    }
    job-tag {
      margin-right: 0.3em;
    }

  </style>
  <script>
    this.clicked = (ev) => {
      //emit event to search for this tag?
    }
  </script>
</job-tag>

<editjob>
  <div class="ui modal fullscreen is-edit-job-modal">
      <div class="header">
        Edit Job Post
      </div>
      <div class="content">
      <form id="editjob-form" class="ui form" autocomplete="off">
      <div class="ui equal padded grid">
        <div class="ten wide column is-job-info">
          <input class="docid" name="docid" type="hidden">
          <div class="field">
            <label>Job Title</label>
            <input id="edit-title" name="jobtitle" placeholder="Untitled Job" type="text">
            <small>200 characters maximum</small>
          </div>

          <div class="inline fields">
            <label for="direction">You are...</label>
              <div class="field">
                <div class="ui radio checkbox">
                  <input id="edit-vac" type="radio" name="direction" value="1" checked>
                <label>Posting a Vacancy</label>
                </div>
              </div>
              <div class="field">
                <div class="ui radio checkbox">
                  <input id="edit-serv" type="radio" name="direction" value="2">
                <label>Offering Your Services</label>
                </div>
              </div>
          </div>

          <div class="field">
            <label>Job Description</label>
            <textarea id="edit-desc" name="jobdescription"></textarea>
            <small>10000 characters maximum</small>
          </div>


           <div id="wpp" class="field" style="display: none;">
            <label> Are you a Robot? </label>
            <input id="wp" name="wobbysite" type="text" value=""/>
          </div>
          <button class="ui button" type="submit">Post to Job Board</button>
       
        </div>
        <div class="six wide column is-job-tags">
          <div class="field">
            <label>Keyword Tags</label>
            <div class="ui blue labels is-job-tags-collection">
              <newjob-tag each={ct in utags} />
            </div>
          </div>
          <div class="grouped fields">
            <div class="field">
            <!--PLAN TO ADD LOCATIONS, SUBCATEGORIES -->
              <div class="field">
                <div class="ui right labeled input">
                  <input type="text" class="is-ejob-tag-input" placeholder="Enter tags">
                  <a class="ui tag label is-ejob-add-tag-click">
                    Add a Tag
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </form>
    </div>
  </div>
  <style>
    .is-job-tags-collection{
      min-height: 90px;
    }
  </style>
  <script>
    let nwk = this;
    nwk.id = null;
    is.job.tag = nwk;
    nwk.submitForm = (ev) => {
      //THINK MAKING THIS BETTER LISTENER 
      // LOOK AT NEW JOB MODAL
      if ($('#editjob-form input#wp').val().length != 0) return false;
      if( ! $('#editjob-form').form('is valid') ) return false;
      var fdata = $("#editjob-form").form("get values");
      //fdata.option = $("#newjob-form input[name=direction]")
      fdata.utags = nwk.utags
      is.jobapi.put(nwk.id,{
        "title": fdata.jobtitle,
        "c": fdata.jobdescription,
        "keywords": fdata.utags,
        "vac": ((fdata.direction === 1) ? true: false)
      },(err,org) => {
        if(err) return toastr.error(err);
        $(".is-edit-job-modal").modal("hide");
        if(is.getRoutes() != "own") route("/own");
        else is.job.ev.emit("refresh-now")
      });
    }
    this.on("mount",() => {
      nwk.utags = [];
      $(".is-ejob-add-tag-click").clickAsObservable().subscribe((ev) => {
        ev.preventDefault();
        //nwk.utags.push("test");
        let t = $(".is-ejob-tag-input").val();
        if(t.replace(/^\s+/g, '').length && nwk.utags.indexOf(t) < 0){
          nwk.utags.push(t);
        }
        nwk.update();
      });
      $("#editjob-form").form({
        title:{
        identifier: "jobtitle",
        rules:[{type:'empty'},{type:'maxLength[200]'}]
        },
        desc:{
        identifier: "jobdescription",
        rules:[{type:'empty'},{type:'maxLength[10000]'}]
        }
      },{
        onSuccess: nwk.executeForm
      });
      $("#editjob-form").on("submit", (ev) => { 
        ev.preventDefault();
        nwk.submitForm();
      });
    });
    is.job.ev.on("edit-delete-this-tag",(org) =>{
      nwk.utags = _.without(nwk.utags,org.tag);
      nwk.update();
    });
    is.job.ev.on("edit-modal-start",(org) => {
      if(org.vacancy){
        $("#edit-vac").prop("checked",true)
        $("#edit-serv").prop("checked",false)
      }else{
        $("#edit-vac").prop("checked",false)
        $("#edit-serv").prop("checked",true)
      }
      $("#edit-title").val(org.title)
      $("#edit-desc").val(org.c)
      nwk.utags = Object.assign([],org.tags);
      nwk.id = org.id;
      nwk.update();
      $(".is-edit-job-modal").modal("show");
    });
    this.on("updated",() => {
      $(".is-job-tag-input").val('');
      
    });

  </script>
</editjob>

<newjob>
  <div class="ui modal fullscreen is-new-job-modal">
      <div class="header">
        New Job Board Post
      </div>
      <div class="content">
      <form id="newjob-form" class="ui form" autocomplete="off">
      <div class="ui equal padded grid">
        <div class="ten wide column is-job-info">
        
          <div class="field">
            <label>Job Title</label>
            <input name="jobtitle" placeholder="Untitled Job" type="text">
            <small>200 characters maximum</small>
          </div>

          <div class="inline fields">
            <label for="direction">You are...</label>
              <div class="field">
                <div class="ui radio checkbox">
                  <input type="radio" name="direction" value="1" checked>
                <label>Posting a Vacancy</label>
                </div>
              </div>
              <div class="field">
                <div class="ui radio checkbox">
                  <input type="radio" name="direction" value="2">
                <label>Offering Your Services</label>
                </div>
              </div>
          </div>

          <div class="field">
            <label>Job Description</label>
            <textarea name="jobdescription"></textarea>
            <small>10000 characters maximum</small>
          </div>


           <div id="wpp" class="field" style="display: none;">
            <label> Are you a Robot? </label>
            <input id="wp" name="wobbysite" type="text" value=""/>
          </div>
          <button class="ui button" type="submit">Post to Job Board</button>
       
        </div>
        <div class="six wide column is-job-tags">
          <div class="field">
            <label>Keyword Tags</label>
            <div class="ui blue labels is-job-tags-collection">
              <newjob-tag each={ct in utags} />
            </div>
          </div>
          <div class="grouped fields">
            <div class="field">
            <!--PLAN TO ADD LOCATIONS, SUBCATEGORIES -->
              <div class="field">
                <div class="ui right labeled input">
                  <input type="text" class="is-njob-tag-input" placeholder="Enter tags">
                  <a class="ui tag label is-njob-add-tag-click">
                    Add a Tag
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </form>
    </div>
  </div>
  <style>
    .is-job-tags-collection{
      min-height: 90px;
    }
  </style>
  <script>
    let nwk = this;
    nwk.submitForm = (ev) => {
      //THINK MAKING THIS BETTER LISTENER 
      // LOOK AT NEW JOB MODAL
      if ($('input#wp').val().length != 0) return false;
      if( ! $('#newjob-form').form('is valid') ) return false;
      var fdata = $("#newjob-form").form("get values");
      //fdata.option = $("#newjob-form input[name=direction]")
      fdata.utags = nwk.utags
      is.jobapi.create({
        "title": fdata.jobtitle,
        "c": fdata.jobdescription,
        "keywords": fdata.utags,
        "vac": ((fdata.direction == 1) ? true: false)
      },(err,org) => {
        if(err) return toastr.error(err);
        $(".is-new-job-modal").modal("hide");
        if(is.getRoutes() != "own") route("/own");
        else is.job.ev.emit("refresh-now")
      });
    }
    this.on("mount",() => {
      nwk.utags = [];
      $(".is-njob-add-tag-click").clickAsObservable().subscribe((ev) => {
        ev.preventDefault();
        //nwk.utags.push("test");
        let t = $(".is-njob-tag-input").val();
        if(t.replace(/^\s+/g, '').length && nwk.utags.indexOf(t) < 0){
          nwk.utags.push(t);
        }
        nwk.update();
      });
      $("#newjob-form").form({
        title:{
        identifier: "jobtitle",
        rules:[{type:'empty'},{type:'maxLength[200]'}]
        },
        desc:{
        identifier: "jobdescription",
        rules:[{type:'empty'},{type:'maxLength[10000]'}]
        }
      },{
        onSuccess: nwk.executeForm
      });
      $("#newjob-form").on("submit", (ev) => { 
        ev.preventDefault();
        nwk.submitForm();
      });
    });
    is.job.ev.on("delete-this-tag",(org) =>{
      nwk.utags = _.without(nwk.utags,org.tag);
      nwk.update();
    });
    this.on("updated",() => {
      $(".is-job-tag-input").val('');
    });

  </script>
</newjob>

<deljob>
  <div class="ui modal small is-deljob-modal">
    <div class="header">
      Delete Job
    </div>
    <div class="content">
      <h1>Are you absolutely sure?</h1>
      <p>Deleting this job will permanently delete all information related to this job posting, including responses you have received from it. This process is <strong>irreversible</strong>. You <strong>will not</strong> be able to recover your job after you delete it.</p>
      <p>Please write "delete" on the text field below to confirm.</p>
      <form id="deljob-form" class="ui form" autocomplete="off">
        <div class="field">
          <input class="docid" name="docid" type="hidden">
          <input name="delete-confirmation" type="text">
        </div>
         <div id="wpp" class="field" style="display: none;">
          <label> Are you a Robot? </label>
          <input id="wp" name="website" type="text" value=""/>
        </div>
        <button class="ui red button" type="submit">Delete this Document</button>
      </form>
    </div>
  </div>
  <script>
    this.executeForm = () => {
      if ($('input#wp').val().length != 0) return false;
      var fdata = $("#deljob-form").form("get values");
      var payload = {
        onus: fdata["delete-confirmation"],
        id: fdata["docid"]
      }
      $("#deljob-form").addClass("loading");
      if(payload.onus != "delete"){
        $("#deljob-form").removeClass("loading");
        toastr.warning("You failed to write the confirmation.")
        return;
      }
      if(location.hostname === "localhost") {
        toastr.info("You did the thing");
        let doc = is.home.dummies.findIndex((e) => e.id == payload.id);
        $( ".is-deljob-modal" ).modal("hide");
        $("#deljob-form").removeClass("loading");
        $('#deljob-form .docid').val("");
        $('#deljob-form input[name="delete-confirmation"]').val("");
        is.home.dummies.splice(doc,1);
        is.home.ev.emit("list-documents");
        return;
      }
      is.jobapi.delete(payload.id,(err, data) => {
        if(err) payload.warning(err);
          $( ".is-deljob-modal" ).modal("hide");
          $("#deljob-form").removeClass("loading");
          $('#deljob-form .docid').val("");
          $('#deljob-form input[name="delete-confirmation"]').val("");
          if(is.getRoutes() != "own") route("/own");
          else is.job.ev.emit("refresh-now")
      });
    //}); 
    }
  this.on("mount",() => {
    $("#deljob-form").on("submit", (ev) => { ev.preventDefault(); });
    $("#deljob-form").form({
      onSuccess: this.executeForm
    });
  });
  
  </script>
</deljob>

<job>
  <div class={content.isOwn ? 'ui inverted top attached menu' : 'ui top attached menu'}>
    <a class="item">Last Updated: {content.stamp}</a>
    <a if={content.isOwn} class="purple item">My Job Posting</a>
      <div class="right menu">
        <div class="ui dropdown item">
          <i class="dropdown icon"></i>
          <div class="menu">
            <a class="item">Save to My Jobs</a>
            <a class="item">Respond to Job</a>
            <a if={content.isOwn} val={content.id} class="purple item is-job-edit">Edit Job</a>
            <a if={content.isOwn} val={content.id} class="red item is-job-delete">Delete Job</a>
            <a class="item">Report Abuse</a> 
          </div>
        </div>
      </div>
  </div>
  <div class="ui clearing attached segment">
    <h3>{content.title}</h3>
    <p><em>Created {content.created} by {content.displayName}</em></p>
    <p class="wanted">{content.c}</p>
    <div class="ui black labels is-jobentry-tags-collection">
      <job-tag each={ct in content.tags} />
    </div>
  </div>
  <style>
    .wanted{
      font-family: 'Noto Serif', serif;
      font-size: 1.1em;
      text-indent: 5%;
      line-height: 2.5em;
      padding-left: 0.5em;
      padding-right: 0.5em;
    }
  </style>
  <script>
    this.content = opts.content;
    this.content.stamp = moment(this.content.stamp).format('L LT')
    this.content.created = moment(this.content.created).format('L LT')
    if(this.content.c){
      this.content.c = is.helpers.mltoplain(this.content.c)
    }
  </script>
</job>
<joblist>
  <list>
      <div class="pre-load">Loading...</div>
      <job each={x in jobs} content={x} />
      <div class="hide-now on-empty ui segment">No More Items Loaded.</div>
      <div id="is-load-bar" class="ui tiny teal progress">
          <div class="bar"></div>
          <div class="label">Ad Finitum</div>
      </div>
  </list>
  <style>
    .hide-now{
      display: none;
    }
  </style>
  <script>
    let fwk = this;
    this.offset = 0;
    this.limit = 5;
    fwk.resetOffset = () => {
      this.offset = 0;
    }
    fwk.keywords = [];
    is.job.ev.on("list-score",(org) => {
      if (location.hostname === "localhost"){
        if(!fwk.jobs || org.routeSet) fwk.jobs = []
        for(var i = 0, len = is.job.dummies.length; i < len; i++) {
          is.job.dummies[i].isOwn = true;
          fwk.jobs.push(Object.assign({},is.job.dummies[i]));
          let p = Math.ceil(((i + 1) / len) * 100);
          $("#is-load-bar").progress({percent: p});
        }
        fwk.update();
      } else {
        is.jobapi.listScore(fwk.offset,fwk.limit,(err,data) => {
          if(err) return toastr.error(err.responseText);
          if(!fwk.jobs || org.routeSet) fwk.jobs = [];
          if(!data.length) {
            $("#is-load-bar").progress({percent: 100});
            if(fwk.offset == 0) $(".on-empty").removeClass("hide-now");
            return;
          }
          for(var i = 0, len = data.length; i < len; i++) {
            data[i].isOwn = false;
            fwk.jobs.push(Object.assign({},data[i]));
            let p = Math.ceil(((i + 1) / len) * 100);
            $("#is-load-bar").progress({percent: p});
          }
          fwk.update();
        }); 
    }
    });
    is.job.ev.on("job-search",(org) => {
      if (location.hostname === "localhost") return;
      is.jobapi.search(fwk.keywords,fwk.offset,fwk.limit,(err,data) => {
         if(err) return toastr.error(err.responseText);
         if(!fwk.jobs || org.routeSet) fwk.jobs = [];
          if(!data.length) {
            $("#is-load-bar").progress({percent: 100});
            if(fwk.offset == 0) $(".on-empty").removeClass("hide-now");
          }
          else{
            console.log(data,fwk.keywords)
            for(var i = 0, len = data.length; i < len; i++) {
              data[i].isOwn = false;
              fwk.jobs.push(Object.assign({},data[i]));
              let p = Math.ceil(((i + 1) / len) * 100);
              $("#is-load-bar").progress({percent: p});
            }
          }
          fwk.update();
      });
    });
    is.job.ev.on("job-own",(org) => {
      if (location.hostname === "localhost") return;
      is.jobapi.list(fwk.offset,fwk.limit,(err,data) => {
        if(err) return toastr.error(err.responseText);
        if(!fwk.jobs || org.routeSet) fwk.jobs = [];
        if(!data.length) {
          $("#is-load-bar").progress({percent: 100});
          if(fwk.offset == 0) $(".on-empty").removeClass("hide-now");
          return;
        } 
        for(var i = 0, len = data.length; i < len; i++) {
          data[i].isOwn = true;
          fwk.jobs.push(Object.assign({},data[i]));
          let p = Math.ceil(((i + 1) / len) * 100);
          $("#is-load-bar").progress({percent: p});
        }
        fwk.update();
      }); 
    });
    is.job.ev.on("job-edit",(org) => {

    });
    is.job.ev.on("search",(keys) => {
      fwk.keywords = Object.assign([],keys);
      fwk.resetOffset();
      route("/search");
      is.job.ev.emit("job-search",{routeSet:true});
    });
    is.job.ev.on("bottom-reached",(org) => {
      fwk.offset = fwk.offset + fwk.limit;
      switch(is.getRoutes()){
        case "list":
          is.job.ev.emit("list-score",{routeSet:false});
          break;
        case "own":
          is.job.ev.emit("job-own",{routeSet:false});
          break;
        case "search":
          is.job.ev.emit("job-search",{routeSet:false});
          break;
      }
    });
    is.job.ev.on("refresh-now",(org) => {
      fwk.resetOffset();
      switch(is.getRoutes()){
        case "list":
          is.job.ev.emit("list-score",{routeSet:true});
          break;
        case "own":
          is.job.ev.emit("job-own",{routeSet:true});
          break;
        case "search":
          is.job.ev.emit("job-search",{routeSet:true});
          break;
      }
    });
    route("/list",(route) => {
      fwk.resetOffset();
      is.job.ev.emit("list-score",{routeSet:true});  
    })
    route("/own",(route) => {
      fwk.resetOffset();
      is.job.ev.emit("job-own",{routeSet:true});
    });
    route("/search",(route)  => {
      fwk.resetOffset();
    });

    this.on("mount",() => {
      $("div.pre-load").addClass("hide-now");
      $(document).scrollAsObservable().debounce(250).subscribe((ev) => {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight){
          is.job.ev.emit("bottom-reached");
          console.log((window.innerHeight + window.scrollY),document.body.scrollHeight)
        }
      });
      route.base("#!");
      route.start(true);
      let broute = is.getRoutes() 
      if(broute == "" || broute == "undefined" || broute == undefined) route("/list");
      else route("/"+is.getRoutes())
    });
    this.on("updated",() => {
      //console.log(fwk.jobs.length)
      $('.ui.dropdown').dropdown();
    });
  </script>
</joblist>
<new-job>
  
</new-job>