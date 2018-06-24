let is = is || {};
/*is.fbasecon = {
    apiKey: "AIzaSyBlr_Re8ax6c5tg_kXC1MJ6XSmvbryL58g",
    authDomain: "istation-65175.firebaseapp.com",
    databaseURL: "https://istation-65175.firebaseio.com",
    storageBucket: "istation-65175.appspot.com",
};
firebase.initializeApp(is.fbasecon);*/
is.mx = {};
is.timer = {};
is.timerStream = Rx.Observable.interval(1000).pausable(new Rx.Subject());
is.reduxDefault = {
  markup:"",
  barActive: false,
  wordcount: 0,
  goalcount: 0,
  toolbarPos: 0,
  preferencesSet: false
}
is.timerDefault = {
  state: 0,
  time: 0
}

is.getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
is.getRoutes = (url) => {
  if (!url) url = window.location.href;
  return url.split("#!")[1]
}
is.helpers = {
	mltoplain: (html) => html.replace(/<(\/(h|p|pre)*(\d)?>)/g,"\n").replace(/(<([^>]+)>)/ig, ""),
	percent: (current, target) => Math.floor((current * 100) / target),
  observableFromStore: (store) => Rx.Observable.create(observer => store.subscribe(() => observer.onNext(store.getState())))
};
is.actionTypes = {
  storeWC: "STORE_WORDCOUNT",
  storeGC: "STORE_GOALCOUNT",
  storeTP: "STORE_TOOLBARPOS",
  storeMarkup: "STORE_MARKUP",
  activateBar: "ACTIVATE_BAR",
  deactivateBar: "DEACTIVATE_BAR",
  setEditorPrefs: "SET_PREFS"
}
is.actions = {
  storeMarkup: (mkup) => ({ type: is.actionTypes.storeMarkup, mkup}),
  storeWC: (wc) => ({type: is.actionTypes.storeWC, wc}),
  storeGC: (gc) => ({type: is.actionTypes.storeGC, gc}),
  storeToolbarPos: (toolbarPos) => ({type: is.actionTypes.storeTP, toolbarPos}),
  activateBar: () => ({type:is.actionTypes.activateBar}),
  deactivateBar: () => ({type: is.actionTypes.deactivateBar}),
  setEditorPrefs: (set) => ({type:is.actionTypes.setEditorPrefs, set})
}
is.timerActions = {
  start: (time) => ({ type:"START", state: 1, time}),
  resume: () => ({type:"RESUME", state: 1}),
  pause: () => ({type:"PAUSE", state: 2}),
  stop: () => ({type:"STOP", state: 0, time: 0}),
  set: (time) => ({type:"SET", time})
}
is.reducer = (state = is.reduxDefault, action) => {
  switch(action.type){
    case is.actionTypes.storeMarkup:
      return Object.assign({}, state, { markup: action.mkup})
    case is.actionTypes.storeWC:
      return Object.assign({}, state, { wordcount: action.wc})
    case is.actionTypes.storeGC:
      return Object.assign({}, state, { goalcount: action.gc})
    case is.actionTypes.storeTP:
      return Object.assign({}, state, { toolbarPos: action.toolbarPos})
    case is.actionTypes.activateBar:
      return Object.assign({}, state, { barActive: true})
    case is.actionTypes.deactivateBar:
      return Object.assign({}, state, { barActive: false})
    case is.actionTypes.setEditorPrefs:
      return Object.assign({}, state, { preferencesSet: action.set})
    default:
      return state;
  }
}
is.timerReducer = (state = is.timerDefault, action) => {
  switch(action.type){
    case "START":
      return Object.assign({}, state, { state: action.state, time:action.time})
    case "STOP":
      return Object.assign({}, state, { state: action.state, time:0})
    case "PAUSE":
      return Object.assign({}, state, { state: action.state})
    case "RESUME":
      return Object.assign({}, state, { state: action.state})
    case "SET":
      return Object.assign({}, state, { time: action.time})
    default:
      return state;
  }
}
is.model = () => ({
  store: Redux.createStore(is.reducer),
  tempStore: Redux.createStore(is.reducer),
  timerStore: Redux.createStore(is.timerReducer),
  actions: is.actions,
  timerActions: is.timerActions
})
is.prefWindowListeners = () => {
  if(!is.mx || !is.mx.store) return;
  $("input[name=wbar]").clickAsObservable().subscribe((ev) => {
    if(ev.target.checked) {
      $(".is-wcbar-setting").slideDown();
      is.mx.tempStore.dispatch(is.actions.activateBar());
    }
    else {
      $(".is-wcbar-setting").slideUp();
      is.mx.tempStore.dispatch(is.actions.deactivateBar()); 
    }
  });
  $("input[name=timer]").clickAsObservable().subscribe((ev) => {
    if(ev.target.checked) { 
      $(".is-timebar-setting").slideDown();
      $("#is-timer").css("opacity",1);
    }
    else {
      $(".is-timebar-setting").slideUp();
      $("#is-timer").css("opacity",0);
    }
  });
  $("input[name=wbaropt]").clickAsObservable().subscribe((ev) => {
    let setting = ev.target.getAttribute("option");
    let goalcount = Number($("#is-editor-current-gc-input").val())
    if (setting == "ABS"){
      is.mx.tempStore.dispatch(is.actions.storeGC(goalcount));
    }
    else if (setting == "REL"){
      let cwc = is.mx.store.getState()["wordcount"]
       is.mx.tempStore.dispatch(is.actions.storeGC(cwc + goalcount)); 
    }
  });
  $(".is-timer-btn").clickAsObservable().subscribe((ev) => {
    let setting = ev.target.getAttribute("option");
    let state = is.mx.timerStore.getState();
    let h = $("input[name=timer-set-hr]"), m = $("input[name=timer-set-min]"), s = $("input[name=timer-set-sec]");
    if(setting == null){
      toastr.warning("What the hell")
    }
    if(setting == "s"){
      let nh = Number(h.val()), nm = Number(m.val()), ns = Number(s.val())
      let secs = (nh * 60 * 60) + (nm * 60) + ns;
      if(!state.state) { //STOPPED, START TIMER
        is.mx.timerStore.dispatch(is.mx.timerActions.start(secs));
        is.timerStream.resume();
      } else if (state.state == 1){ // STARTED, PAUSE TIMER
        is.mx.timerStore.dispatch(is.mx.timerActions.pause())
        is.timerStream.pause()
      } else if (state.state == 2){ // PAUSED, RESUME TIMER
        is.mx.timerStore.dispatch(is.mx.timerActions.resume())
        is.timerStream.resume();
      }
    }
    else if (setting == "p"){
        is.mx.timerStore.dispatch(is.mx.timerActions.stop())
        h.val(0); m.val(0); s.val(0);
        $("input[name=timer-dis-hr]").val(0)
        $("input[name=timer-dis-min]").val(0)
        $("input[name=timer-dis-sec]").val(0)
        $(".is-timer-wrapper > .hours").html("00")
        $(".is-timer-wrapper > .minutes").html("00")
        $(".is-timer-wrapper > .seconds").html("00")

        is.timerStream.pause()
    }
  });
  $("#is-editor-current-gc-input").keyupAsObservable().subscribe((ev) => {
    let opts = $("input[name=wbaropt]:checked");
    if(!opts.length) return;
    let setting = opts[0].getAttribute("option");
    let goalcount = Number($("#is-editor-current-gc-input").val())
    if (setting == "ABS"){
      is.mx.tempStore.dispatch(is.actions.storeGC(goalcount));
    }
    else if (setting == "REL"){
      let cwc = is.mx.store.getState()["wordcount"]
       is.mx.tempStore.dispatch(is.actions.storeGC(cwc + goalcount)); 
    }
  });
  $("input[name=bar-position]").clickAsObservable().subscribe((ev) => {
    let op = ev.target.getAttribute("option")
    if(op == "left-barpos" ) is.mx.tempStore.dispatch(is.actions.storeToolbarPos(0))
    else if(op == "right-barpos") is.mx.tempStore.dispatch(is.actions.storeToolbarPos(1))
  });
}
is.prefWindowCallback = () => {
  if(!is.mx || !is.mx.store) return;
  let ts = is.mx.tempStore.getState()
  if(ts.barActive){
    is.mx.store.dispatch(is.actions.activateBar())
    is.mx.store.dispatch(is.actions.storeGC(ts.goalcount))
  }
  else is.mx.store.dispatch(is.actions.deactivateBar()) //deactivate bar
  is.mx.store.dispatch(is.actions.storeToolbarPos(ts.toolbarPos))
  is.mx.store.dispatch(is.actions.setEditorPrefs(true));
  //CHECK FOR FUNCTIONALITY OF THIS PART
  let doc_id = is.getParameterByName("d")
  if(doc_id) is.renderEditor(false);
  else is.renderEditor(true)
  //is.renderEditor()
}
is.renderEditor = (isLocal, prefs) => {
  if(isLocal){
    if(!localStorage.getItem('istation:local')) localStorage.setItem("istation:local","");
    is.mx.store.dispatch(is.actions.storeMarkup(localStorage.getItem('istation:local')));
  }
  let state = is.mx.store.getState()
  $("#is-editor").empty()
  $(".qll").empty()
  if (state.preferencesSet){
    if(state.toolbarPos){
      $("#is-toolbar-wrapper").removeClass("left")
      $("#is-toolbar-wrapper").addClass("right")
    }
    else{
    $("#is-toolbar-wrapper").removeClass("right")
    $("#is-toolbar-wrapper").addClass("left") 
    }
    if(state.barActive) $("#is-countbar").show()
    else $("#is-countbar").hide()
  }
  let prevMarkup = state["markup"]
  let editor = new Quill("#is-editor",{ 
      theme: "snow",
      modules: {
        toolbar: "#is-editor-toolbar"
      }
  });
  $("#is-editor-toolbar").css("left",$("#is-toolbar-wrapper").offset().left);

  if(prevMarkup){ 
    editor.clipboard.dangerouslyPasteHTML(0, prevMarkup);
    let wc = editor.getText().match(/\S+/g).length;
    is.mx.store.dispatch(is.mx.actions.storeWC(wc));
  }
  let btnstream = $(".uptop > button").clickAsObservable();
  let streditor = $(".ql-editor").onAsObservable("keyup mouseup").map((ev) => $(ev.target).html());
  let plaintext = streditor.debounce(500).map((str) =>{ 
    return is.helpers.mltoplain(str)
  });
  let strMarkup = streditor.debounce(200).subscribe((data) => {
    is.mx.store.dispatch(is.actions.storeMarkup(data))
  });
  let hideOnInput = streditor.subscribe((data) =>{
    if($(".menu").sidebar("is visible")) $(".menu").sidebar("pull page");
    $(".uptop > button").css("display","inline-flex")
  });
  let strWC = plaintext.subscribe((cleanStr) => {
    let wc = (!cleanStr || cleanStr == "\n" || cleanStr == "") ? 0 : cleanStr.match(/\S+/g).length;
    is.mx.store.dispatch(is.mx.actions.storeWC(wc));
    if(state.barActive) {
      $('#is-countbar').progress({
        percent: Math.max(0,Math.min(is.helpers.percent(wc,is.mx.store.getState()["goalcount"]),100))
      });
    }
  });
  let showToggle = btnstream.subscribe((data) => {
      if(!$(".menu").sidebar("is visible")) $(".menu").sidebar("push page");
      $(".uptop > button").fadeOut(100);
  });
}
is.app = () => {
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
  $(".menu").sidebar({
    dimPage: false,
    closable: false
  });
  is.mx =  is.model();
  let reduxStream = is.helpers.observableFromStore(is.mx.store);
  //is.mx.store.dispatch(is.mx.actions.storeMarkup(localStorage.getItem('istation:test')));
  let doc_id = is.getParameterByName("d")
  is.prefWindowListeners();
  $("#is-timer").css("opacity",0);
  $(".is-prefs-button").clickAsObservable().subscribe((ev) => {
    let store = is.mx.store.getState()
    let timerStore = is.mx.timerStore.getState()
    //put word count in input
    $('#is-editor-current-wc-input').val(store.wordcount)
    //determine what is the toolbar position
    if(!store.toolbarPos) {  //0 is on the left
      $("input[name=left-barpos]").prop("checked",true)
      $("input[name=right-barpos]").prop("checked",false)
    }
    else { //1 is on the right
      $("input[name=left-barpos]").prop("checked",false)
      $("input[name=right-barpos]").prop("checked",true)
    }
    //determine if word count bar is active
    if(store.barActive){ //if active, populate appropriate values
      $("#is-editor-current-gc-input").val(store.goalcount);
      $("input[name=wbaropt][option=ABS]").prop("checked",true);
    } else $(".is-wcbar-setting").hide();
    if (timerStore.state){
      $(".is-timebar-setting").show();
      $("input[name=timer]").prop("checked",true);
      $("#is-timer").css("opacity",1);
    }else {
      $(".is-timebar-setting").hide();
      $("input[name=timer]").prop("checked",false);
      $("#is-timer").css("opacity",0);
    }
    $('.is-editor-prefs').modal({
      closable:false,
      onApprove: is.prefWindowCallback
    }).modal("show");
  });
  is.timerStream.subscribe(() => {
    let state = is.mx.timerStore.getState();
    if(!state.time){
      toastr.info("Timer Out");
      is.mx.timerStore.dispatch(is.mx.timerActions.stop())
      is.timerStream.pause();
    }
    if(state.state){
      let t= state.time
      let h = Math.floor(t / 3600)
      t = t - h * 3600;
      let m = Math.floor(t / 60);
      let s = t - m * 60;
      $("input[name=timer-dis-hr]").val(h)
      $("input[name=timer-dis-min]").val(m)
      $("input[name=timer-dis-sec]").val(s)
      $(".is-timer-wrapper > .hours").html(String(h))
      $(".is-timer-wrapper > .minutes").html(String(m))
      $(".is-timer-wrapper > .seconds").html(String(s))

      is.mx.timerStore.dispatch(is.timerActions.set(state.time - 1));
    }
  });
  if(doc_id){
    is.docapi.get(doc_id,(err,data) => {
      if(err) return toastr.error(err.responseText);
      if(data["c"]){
        is.mx.store.dispatch(is.mx.actions.storeMarkup(data.c));
      }
      is.renderEditor(false);
      reduxStream.debounce(1500).distinctUntilChanged().subscribe((data) => {
        console.log("Saved",data)
        is.docapi.putCt(doc_id,data.markup,(err,org) => {
          if(err) return toastr.error(err.responseText);
          console.log(org);
        });
      });
    });
  } 
  else {
    is.renderEditor(true);
    reduxStream.debounce(1500).distinctUntilChanged().subscribe((data) => {
      console.log("Saved",data)
      localStorage.setItem("istation:local",data.markup);
    });
  }
  
  /**/
};