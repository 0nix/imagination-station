let is = is || {};
is.rev = {};
is.rev.ev = {};
is.rev.storeDefault = {
  docid: "",
  title: "",
  text: "",
  focusRev:""
}
is.rev.store = Redux.createStore((state = is.rev.storeDefault, action) => {
  switch(action.type){
    case "INIT":
      return Object.assign({}, state, { docid: action.docid, title:action.title, text: action.text})
    case "RECTEXT":
      return Object.assign({}, state, { markup: action.text})
    case "FOCUSREV":
      return Object.assign({}, state, { focusRev: action.rev})
    default:
      return state;
  }
})
is.rev.storeActions = {
  initialize: (_docid, _title, _text) => ({type: "INIT", docid: _docid, title:  _title, text: _text}),
  rectext: (_text) => ({type: "RECTEXT", text: _text}),
  focusrev: (_rev) => ({type: "FOCUSREV", rev: _rev})

}
is.rev.revisionListeners = () => {
  $("revision").onAsObservable("click",".is-rev-view").subscribe((ev) => {
    let ix = $(ev.target).attr("val");
    let id = is.getParameterByName("id");
    is.rev.ev.emit("view-revision",{docid: id, index: ix});
  });
  $("revision").onAsObservable("click",".is-rev-compare").subscribe((ev) => {
    let ix = $(ev.target).attr("val");
    let id = is.getParameterByName("id");
    is.rev.ev.emit("compare-revision",{docid: id, index: ix});
    //is.rev.ev.emit("todoc-revision",{docid: id, index: ix});
  });
  $("revision").onAsObservable("click",".is-revtodoc").subscribe((ev) => {
    let ix = $(ev.target).attr("val");
    let id = is.getParameterByName("id");
    is.rev.ev.emit("todoc-revision",{docid: id, index: ix});
  });
}
is.rev.runRevision = () => {
  //OBJECT ASSIGN POLYFILL
  if (typeof Object.assign != 'function') {
    Object.assign = function(target, varArgs) { // .length of function is 2
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
	//LOCALHOST ENVIRONMENT
	if (location.hostname === "localhost"){
    is.rev.comparison = "PERCEBES PERCEBES PERCEBES DERCEBES DERCEBES PERCEBES PERCEBES VORR"
		is.rev.dummies = [
        {
          id: 112312,
          index: 3,
          stamp: Date.now(),
          c: "PERCEBES PERCEBES PERCEBES PERCEBES PERCEBES PERCEBES PERCEBES PERCEBES"
        },
        {
          id: 112312,
          index: 2,
          stamp: Date.now(),
          c: "PERCEBES PERCEBES PERCEBES DERCEBES DERCEBES PERCEBES PERCEBES PERCEBES"
          
        },
        {
          id: 112312,
          index: 1,
          stamp: Date.now(),
          c: "PERCEBES DERCEBES DERCEBES"
        }
      ];
	}
	is.rev.ev = new Emitter();
	riot.mount("menu-general, footer, revision, revlist, rev-comparison-modal, rev-view-modal, revdoc-modal");
	$('.ui.dropdown').dropdown();
	$("#is-current-date").html(moment().format('LL'));
  if(location.hostname === "localhost"){
    is.rev.store.dispatch(is.rev.storeActions.initialize(112312,"Dummy", is.rev.comparison));
    is.rev.revisionListeners();
    is.rev.ev.emit("list-revision");
  }else{
    let id = is.getParameterByName("id");
    if(id == null) {
      toastr.error("No Document Id available.")
      return;
    }
    is.docapi.get(id,(err,data) => {
      if(err) return toastr.error(err);
      //is.rev.ev.emit("list-revision", {docid: id, text: org.c});
      is.rev.store.dispatch(is.rev.storeActions.initialize(id, data.title, data.c));
      is.rev.ev.emit("list-revision");
      //is.rev.revisionListeners();
    })
  }
  is.rev.revisionListeners();
};