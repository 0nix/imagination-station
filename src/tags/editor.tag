<editor>
	
  	<div id="editable"></div>
  	<style scoped>
  		#editable{
  			padding-top: 6em;
  			padding-left: 1em;
  			padding-right: 1em;
			min-height: 100vh;
			border-left: 1px solid rgba(34, 36, 38, 0.15);
			border-right: 1px solid rgba(34, 36, 38, 0.15);

  		}
  		#editable:focus{
  			outline: none;
  		}
  		#editable h1, #editable h2, #editable h3, #editable p{
  			font-family: 'Noto Serif', serif;
  		}
  		#editable b{
  			font-weight: 700;
  		}
  		#editable p{
  			text-indent: 5%;
  			line-height: 2.5em;
  		}
  	</style>
  	<script>
  	this.on("mount",() => {
  		let redux = opts.model;
  		let store = "";
  		let htmlstore = "";
  		let wordcount = 0;
  		let yLastPos = 0;
  		let initText = redux.store.getState()[opts.key];
  		let handleWC = (cleanStr) => {
  			let wc = (!cleanStr || cleanStr == "\n" || cleanStr == "") ? 0 : cleanStr.match(/\S+/g).length;
			$('.is-countbar').progress({
  					percent: Math.max(0,Math.min(is.helpers.percent(wc,1000),100))
			});
  		}
	  	let editor = new MediumEditor($("#editable")[0],{
	  		buttonLabels: "fontawesome",
	  		toolbar:{
	  			buttons:["bold","italic","underline","strikethrough",
	  					"justifyLeft","justifyCenter","justifyRight","h1","h2","h3"]
	  		},
	  		placeholder: {
		        text: 'Select Text to Format, Bold, and Justify.\nAs you write, the Word Count Bar will fill up to help you meet your goal.\nClick here to start you journey.',
		        hideOnClick: true
    		},
    		paste: {
		        forcePlainText: false,
		        cleanPastedHTML: true,
		        cleanReplacements: [],
		        cleanAttrs: ['class', 'style', 'dir'],
		        cleanTags: ['meta','img','embed','iframe','span']
		    }
	  	});
		let btnstream = $(".uptop > button").clickAsObservable();
		let streditor = $("#editable").onAsObservable("input");
		
		let plaintext = streditor.map((ev) => $(ev.target).html()).sample(500).map((str) => is.helpers.mltoplain(str));
		let storeMarkup = streditor.map((ev) => $(ev.target).html()).debounce(200).subscribe((data) => {
			redux.store.dispatch(redux.actions.storeMarkup(data));	
		});
		let hideOnInput = streditor.subscribe((data) =>{
			if($(".menu").sidebar("is visible")) $(".menu").sidebar("pull page");
			$(".uptop > button").show();
		});
		let strWC = plaintext.subscribe((data) => handleWC(data));
		let showToggle = btnstream.subscribe((data) => {
			if(!$(".menu").sidebar("is visible")) $(".menu").sidebar("push page");
			$(".uptop > button").fadeOut(100);
		});
		if(initText && initText != "<p><br></p>"){
			editor.setContent(initText);
			handleWC(is.helpers.mltoplain(initText));
		}
		
	});
	</script>
</editor>