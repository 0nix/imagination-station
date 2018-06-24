<document>
        <div class="ui top attached menu">
          <a class="item">Last Updated: {content.stamp}</a>
          <div class="right menu">
            <a class="item" href="/editor?d={content.id}"><i class="fa fa-pencil" aria-hidden="true"></i></a>
            <div class="ui dropdown item">
              <i class="dropdown icon"></i>
              <div class="menu">
                <a href="/history?id={content.id}" class="item">Document History</a>
                <!--<a class="item">Share Permissions</a>-->
                <a class="item is-convert-doc" val="{content.id}">Save to Computer</a>
                <a class="item is-delete-doc" val="{content.id}">Delete this Document</a>    
              </div>
            </div>
          </div>
        </div>
        <div class="ui clearing attached segment">
          <h3>{content.title}</h3>
          <p><em>Created {content.created}</em></p>
          <p class="blurb">{content.blurb}</p>
          <a href="/history?id={content.id}" ><button class="ui right floated button">View Document History</button></a>
          <a href="/editor?d={content.id}" ><button class="ui right floated button primary">
            <i class="fa fa-pencil" aria-hidden="true"></i> Write
          </button></a>
        </div>
        <style>
          .blurb{
            font-family: 'Noto Serif', serif;
            font-style: italic;
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
          if(this.content.blurb){
            this.content.blurb = is.helpers.mltoplain(this.content.blurb).concat("...")
          }
          $('.ui.dropdown').dropdown();
          this.on("mount",() => {
            $('.ui.dropdown').dropdown();
            console.log(this.content.title,"["+this.content.id+"]")
          })
        </script>
</document>

<doclist>
  <div class="is-home-document-header">
    <div class ="ui grid">
      <div class="ten wide column">
        <h3>Your Documents</h3>
      </div>
      <!--<div class="six wide column">
        <div class="ui selection dropdown right floated right floated is-home-sorter">
          <i class="dropdown icon"></i>
          <div class="text">Sort by...</div>
          <div class="menu">
            <div class="item active">Last Document Edited</div>
            <div class="item">Alphabetically</div>
            <div class="item">Date Created</div>
          </div>
        </div>
      </div>-->
    </div>
  </div>
  <list>
    <div class="pre-load">Loading your Document List...</div>
    <document each={d in docs} content={d} />
  </list>
  <div id="isd-load-bar" class="ui tiny teal progress">
    <div class="bar"></div>
    <div class="label">Ad Finitum</div>
  </div>
  <style>
    .hide-now{
      display: none;
    }
  </style>
  <script>
    let fwk = this;
    this.offset = 0;
    this.limit = 5;
    fwk.docs = [];
    fwk.resetOffset = () => {
      this.offset = 0;
    }
    is.home.ev.on("list-documents",(org) =>{
      if (location.hostname === "localhost"){
        for(var i = 0, len = is.home.dummies.length; i < len; i++) {
          fwk.docs.push(Object.assign({},is.home.dummies[i]));
          let p = Math.ceil(((i + 1) / len) * 100);
          $("#is-load-bar").progress({percent: p});
        }
        fwk.update();
      } else {
        if(fwk.offset == 0) fwk.docs = Object.assign([]);
        is.docapi.list(fwk.offset,fwk.limit,(err,data) => {
          if(err) return toastr.error(err.responseText);
          for(var i = 0, len = data.length; i < len; i++) {
            fwk.docs.push(Object.assign({},data[i]));
            let p = Math.ceil(((i + 1) / len) * 100);
            $("#isd-load-bar").progress({percent: p});
          }
          fwk.update();
        }); 
      }
    });
    is.home.ev.on("bottom-reached",(org) => {
      fwk.offset = fwk.offset + fwk.limit;
      is.home.ev.emit("list-documents");
    });
    is.home.ev.on("refresh-now",(org) => {
      fwk.resetOffset();
      is.home.ev.emit("list-documents");
    });
    is.home.ev.emit("list-documents");
    this.on("mount",() => {
      $("div.pre-load").hide();
    });
    $(document).scrollAsObservable().debounce(250).subscribe((ev) => {
      if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight){
        is.home.ev.emit("bottom-reached");
      }
    });
    this.on("updated",() => {
      $('.ui.dropdown').dropdown();
    });
  </script>
</doclist>

<newdoc-modal>
  <div class="ui modal small is-newdocument-modal">
    <div class="header">
      New Document
    </div>
    <div class="content">
      <form id="newdoc-form" class="ui form" autocomplete="off">
        <div class="field">
          <label>Document Title</label>
          <input name="document-title" placeholder="Untitled Document" type="text">
        </div>
         <div id="wpp" class="field" style="display: none;">
          <label> Are you a Robot? </label>
          <input id="wp" name="website" type="text" value=""/>
        </div>
        <button class="ui button" type="submit">Create a New Document</button>
      </form>
    </div>
  </div>
  <script>
  this.executeForm = () => {
    //$( "#newdoc-form" ).on("submit",(ev) => {
      //ev.preventDefault();
      if ($('input#wp').val().length != 0) return false;
      var fdata = $("#newdoc-form").form("get values");
      var payload = {
        title: fdata["document-title"]
      }
      $("#newdoc-form").addClass("loading");
      if(location.hostname === "localhost") {
        toastr.info("You did the thing");
        is.home.dummies.unshift({
                  title: payload.title,
                  stamp: Date.now(),
                  created: Date.now()
        });
        $( ".is-newdocument-modal" ).modal("hide");
        $("#newdoc-form").removeClass("loading");
        is.home.ev.emit("list-documents");
        return;
      }
      $.ajax({
        method: "POST",
        url: "/api/doc",
        contentType: "application/json",
        success: (document_id) => {
          $.ajax({
            method: "PUT",
            url: "/api/doc/"+ document_id,
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (data) => {
              //TODO: REDIRECT TO THE WORKSHOP
              $( ".is-newdocument-modal" ).modal("hide");
              $("#newdoc-form").removeClass("loading");
              is.home.ev.emit("refresh-now");
            },
            error: (xhr,status,error) => {
              toastr.warning(xhr.responseText);
            }
          });
        },
      error: (xhr,status,error) => {
        toastr.warning(xhr.responseText);
      }
      });
    //}); 
  }
  this.on("mount",() => {
    $("#newdoc-form").form({
      title:{
        identifier: "document-title",
        rules:[{type:'empty', prompt:'This Document must have a title'}]
      }
    },{
      onSuccess: this.executeForm
    });
    $("#newdoc-form").on("submit", (ev) => { ev.preventDefault(); });
  });
  </script>
</newdoc-modal>
<deldoc-modal>
  <div class="ui modal tiny is-deldocument-modal">
    <div class="header">
      Delete Document
    </div>
    <div class="content">
      <h1>Are you absolutely sure?</h1>
      <p>Deleting a document will permanently delete all the versions we have of your file, as well as every single revision of it to date. This process is <strong>irreversible</strong>. You <strong>will not</strong> be able to recover your document after you delete it.</p>
      <p>Please write "delete" on the text field below to confirm.</p>
      <form id="deldoc-form" class="ui form" autocomplete="off">
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
      var fdata = $("#deldoc-form").form("get values");
      var payload = {
        onus: fdata["delete-confirmation"],
        id: fdata["docid"]
      }
      $("#deldoc-form").addClass("loading");
      if(payload.onus != "delete"){
        $("#deldoc-form").removeClass("loading");
        toastr.warning("You failed to write the confirmation.")
        return;
      }
      if(location.hostname === "localhost") {
        toastr.info("You did the thing");
        let doc = is.home.dummies.findIndex((e) => e.id == payload.id);
        $( ".is-deldocument-modal" ).modal("hide");
        $("#deldoc-form").removeClass("loading");
        $('#deldoc-form .docid').val("");
        $('#deldoc-form input[name="delete-confirmation"]').val("");
        is.home.dummies.splice(doc,1);
        is.home.ev.emit("list-documents");
        console.log("Excecuted")
        return;
      }
      $.ajax({
        method: "DELETE",
        url: "/api/doc/"+payload.id,
        contentType: "application/json",
        success: (document_id) => {
          $( ".is-deldocument-modal" ).modal("hide");
          $("#deldoc-form").removeClass("loading");
          $('#deldoc-form .docid').val("");
          $('#deldoc-form input[name="delete-confirmation"]').val("");
          is.home.ev.emit("refresh-now");
        },
      error: (xhr,status,error) => {
        toastr.warning(xhr.responseText);
        $( ".is-deldocument-modal" ).modal("hide");
        $("#deldoc-form").removeClass("loading");
        $('#deldoc-form .docid').val("");
        $('#deldoc-form input[name="delete-confirmation"]').val("")
      }
      });
    //}); 
    }
  this.on("mount",() => {
    $("#deldoc-form").on("submit", (ev) => { ev.preventDefault(); });
    $("#deldoc-form").form({
      onSuccess: this.executeForm
    });
  });
  
  </script>
</deldoc-modal>
<condoc-modal>
  <div class="ui modal tiny is-condocument-modal">
    <div class="header">
      Save a Document Locally
    </div>
    <div class="content">
      <div class="ui equal width padded grid">
        <div class="row">
            <div class="column">
              <h4>Choose a Format</h4>
              <input class="docid" name="docid" type="hidden">
              <div class="ui vertical buttons con-btn-list">
                <button opt="html" class="is-conversion ui toggle button con-btn">HTML Document (.html)</button>
                <button opt="pdf" class="is-conversion ui toggle button con-btn">Adobe PDF (.pdf)</button>
                <button opt="rtf" class="is-conversion ui toggle button con-btn">Rich Text Format (.rtf)</button>
              </div>
            </div>
            <div class="column middle aligned">
              <div style="text-align:center; "class="row middle aligned">
                <button class="is-conversion ui disabled button massive is-con-btn">Save</button>
              </div>
            </div>
        </div>
      </div>
    </div>
    <style>
      .con-btn-list > .ui.button.con-btn {
        margin-bottom: 0.35em;
      }
    </style>
    <script>
      let fwk = this;
      fwk.opt = null;
      this.changeOpt = () => {
        if(!fwk.opt) return;
        if($(".is-con-btn").hasClass("disabled")) { 
          $(".is-con-btn").removeClass("disabled") 
          $(".is-con-btn").addClass("blue") 
        }

      };
      this.conversionOver = (err,data) => {
        if(err) return;
        $(".is-conversion").removeClass("disabled");
        $(".is-con-btn").removeClass("loading");
        $(".con-btn").removeClass("green");
        $(".is-con-btn").removeClass("blue");
        $(".is-con-btn").addClass("disabled"); 
        fwk.opt = null;
      }
      this.doConversion = () => {
        if(!fwk.opt) return;
        let id = $(".is-condocument-modal .docid").val()
        switch(fwk.opt) {
          case "html":
            is.conv.toHTML(id,fwk.conversionOver);
            break;
          case "pdf":
            is.conv.toPDF(id,fwk.conversionOver);
            break;
          case "rtf":        
            is.conv.toRTF(id,fwk.conversionOver);
            break;
        }
      }
      this.on("mount",() => {
        $(".con-btn").clickAsObservable().subscribe((ev) => {
          let option = $(ev.target).attr("opt");
          $(ev.target).addClass("green");
          $(".con-btn:not([opt=" + option + "])").removeClass("green");
          fwk.opt = option;
          fwk.changeOpt(option);
        });
        $(".is-con-btn").clickAsObservable().subscribe((ev) => {
          if(!fwk.opt) return;
          $(".is-conversion").addClass("disabled");
          $(".is-con-btn").addClass("loading")
          fwk.doConversion();
        });
      });
    </script>
  </div>
</condoc-modal>